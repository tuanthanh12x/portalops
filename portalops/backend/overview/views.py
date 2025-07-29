

import ast
import redis
import requests
import os

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings

from openstack_portal.tasks import fetch_and_cache_instance_options
from .tasks import cache_user_instances
from utils.conn import connect_with_token_v5

from userauth.permissions import IsAdmin

from project.models import Project

# Redis connection
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)


class MyInstancesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.auth.get("username")
        project_id = request.auth.get('project_id')

        redis_key = f"instances_cache:{username}:{project_id}"
        cached_data = redis_client.get(redis_key)

        if cached_data:
            try:
                result = ast.literal_eval(cached_data)
                return Response(result)
            except Exception:
                return Response({"error": "Failed to parse cached data"}, status=500)

        token_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(token_key)
        if not token:
            return Response({"error": "Authentication token has expired or is missing."}, status=401)

        cache_user_instances.delay(username, token, project_id)
        return Response({"message": "Data is being prepared. Please try again in a few moments."}, status=202)


class LimitSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.auth.get("username")
        project_id = request.auth.get('project_id')

        token_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(token_key)

        if not token:
            return Response({"error": "Authentication token has expired or is missing."}, status=401)

        # Use .env-based URLs
        compute_url = settings.OPENSTACK_COMPUTE_URL
        block_storage_url = settings.OPENSTACK_BLOCK_STORAGE_URL

        # Fetch compute usage
        try:
            nova_response = requests.get(f"{compute_url}/limits", headers={"X-Auth-Token": token})
            nova_response.raise_for_status()
            absolute = nova_response.json().get("limits", {}).get("absolute", {})
        except requests.RequestException as e:
            return Response({"error": "Unable to retrieve compute limits", "details": str(e)}, status=500)

        cpu_used = absolute.get("totalCoresUsed", 0)
        cpu_limit = absolute.get("maxTotalCores", 0)
        ram_used = absolute.get("totalRAMUsed", 0)
        ram_limit = absolute.get("maxTotalRAMSize", 0)

        # Fetch block storage usage
        try:
            cinder_url = f"{block_storage_url}/{project_id}/os-quota-sets/{project_id}?usage=True"
            cinder_response = requests.get(cinder_url, headers={"X-Auth-Token": token})
            cinder_response.raise_for_status()
            quota = cinder_response.json().get("quota_set", {})
        except requests.RequestException as e:
            return Response({"error": "Unable to retrieve block storage quotas", "details": str(e)}, status=500)

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
        try:
            username = request.auth.get("username")
            project_id = request.auth.get("project_id")

            if not project_id:
                return Response({"error": "Project ID is required."}, status=status.HTTP_400_BAD_REQUEST)

            redis_key = f"keystone_token:{username}:{project_id}"
            token = redis_client.get(redis_key)

            if not token:
                return Response({"error": "Authentication token has expired or is missing."}, status=401)

            server_id = request.data.get("server_id")
            if not server_id:
                return Response({"error": "Server ID is required."}, status=400)

            console_type = request.data.get("type", "novnc")

            conn = connect_with_token_v5(token, project_id)
            response = conn.compute.post(
                f"/servers/{server_id}/action",
                json={"os-getVNCConsole": {"type": console_type}}
            )

            if response.status_code != 200:
                return Response({"error": "Failed to retrieve console.", "details": response.text}, status=500)

            console_data = response.json().get("console")
            if not console_data:
                return Response({"error": "Console information was not returned by the server."}, status=500)

            return Response({"console": console_data}, status=200)

        except Exception as e:
            return Response({"error": f"Unexpected error occurred: {str(e)}"}, status=500)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from django.contrib.auth import get_user_model
from utils.conn import get_admin_connection
User = get_user_model()
class SystemSummaryView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            project_id = request.auth.get("project_id")
            conn = get_admin_connection(project_id=project_id)

            # 1. Active users in the Portal (Django)
            active_users = User.objects.filter(is_active=True).count()

            # 2. Total number of VM instances
            instances = list(conn.compute.servers(all_projects=True))
            total_instances = len(instances)

            # 3. Total vCPUs used
            total_vcpus = sum([int(getattr(i.flavor, 'vcpus', 0)) for i in instances])

            # 4. Total storage used (GB)
            volumes = list(conn.block_storage.volumes(details=True, all_projects=True))
            total_storage = sum([int(v.size) for v in volumes])

            # 5. Total number of projects (from local DB)
            total_projects = Project.objects.count()

            # 6. Total number of networks
            networks = list(conn.network.networks())
            total_networks = len(networks)

            return Response({
                "active_users": active_users,
                "total_instances": total_instances,
                "total_vcpus_used": total_vcpus,
                "total_storage_used_gb": total_storage,
                "total_projects": total_projects,
                "total_networks": total_networks
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

