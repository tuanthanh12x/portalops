import json

import redis
import requests
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from openstack_portal.tasks import fetch_and_cache_instance_options

from utils.conn import connect_with_token

from utils.conn import connect_with_token_v5

redis_client = redis.Redis(host='redis', port=6379, db=0)


import redis
import os
from .tasks import cache_user_instances
import ast  # để parse string dict từ redis
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

class MyInstancesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        project_id = request.auth.get('project_id')
        redis_key = f"instances_cache:{username}:{project_id}"
        cached_data = redis_client.get(redis_key)

        if cached_data:
            # Lấy data từ cache
            result = ast.literal_eval(cached_data)
            return Response(result)

        token_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(token_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)


        cache_user_instances.delay(username, token,project_id)
        return Response({"message": "Caching in progress, try again shortly."}, status=202)



class LimitSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        project_id = request.auth.get('project_id')
        redis_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(redis_key)

        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        # token = token.decode()
        project_id = request.auth.get("project_id")

        nova_url = "http://172.93.187.251/compute/v2.1"
        nova_headers = {"X-Auth-Token": token}
        try:
            nova_response = requests.get(f"{nova_url}/limits", headers=nova_headers)
            nova_response.raise_for_status()
            absolute = nova_response.json().get("limits", {}).get("absolute", {})
        except requests.RequestException as e:
            return Response({"error": "Failed to fetch compute limits", "details": str(e)}, status=500)

        cpu_used = absolute.get("totalCoresUsed", 0)
        cpu_limit = absolute.get("maxTotalCores", 0)
        ram_used = absolute.get("totalRAMUsed", 0)
        ram_limit = absolute.get("maxTotalRAMSize", 0)


        cinder_url = f"http://172.93.187.251/volume/v3/{project_id}/os-quota-sets/{project_id}?usage=True"
        cinder_headers = {"X-Auth-Token": token}
        try:
            cinder_response = requests.get(cinder_url, headers=cinder_headers)
            cinder_response.raise_for_status()
            quota = cinder_response.json().get("quota_set", {})
        except requests.RequestException as e:
            return Response({"error": "Failed to fetch storage quota", "details": str(e)}, status=500)

        storage_used = quota.get("gigabytes", {}).get("in_use", 0)
        storage_limit = quota.get("gigabytes", {}).get("limit", 0)

        return Response({
            "cpu": {"used": cpu_used, "limit": cpu_limit},
            "ram": {"used": ram_used, "limit": ram_limit},
            "storage": {"used": storage_used, "limit": storage_limit}
        })


class CreateConsoleAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Create a VNC console for a specified server.

        Args:
            request: Contains user authentication and server details.

        Returns:
            Response: Console details or error message.
        """
        try:
            # Extract username and project_id from request
            username = request.user.username
            project_id = request.auth.get("project_id")

            if not project_id:
                return Response(
                    {"error": "Project ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check Redis for token
            redis_key = f"keystone_token:{username}:{project_id}"
            token = redis_client.get(redis_key)

            if not token:
                return Response(
                    {"error": "Authentication token expired or missing"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Decode token if it's in bytes
            if isinstance(token, bytes):
                token = token.decode()

            # Validate server_id
            server_id = request.data.get("server_id")
            if not server_id:
                return Response(
                    {"error": "Server ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get console type, default to 'novnc'
            console_type = request.data.get("type", "novnc")

            # Connect to Nova API and request VNC console
            conn = connect_with_token_v5(token, project_id)
            response = conn.compute.post(
                f"/servers/{server_id}/action",
                json={
                    "os-getVNCConsole": {
                        "type": console_type
                    }
                }
            )

            # Assuming response contains the console data directly
            console_data = response.json().get("console")
            if not console_data:
                return Response(
                    {"error": "Console data not found in response"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response(
                {"console": console_data},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Failed to create console: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
