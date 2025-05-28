import json

import redis
import requests
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from openstack_portal.tasks import fetch_and_cache_instance_options

redis_client = redis.Redis(host='redis', port=6379, db=0)


class ResourceOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        redis_key = f"keystone_token:{username}"
        token = redis_client.get(redis_key)

        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        nova_url = "http://172.93.187.251/compute/v2.1"
        headers = {"X-Auth-Token": token.decode()}
        url = f"{nova_url}/servers/detail"

        try:
            r = requests.get(url, headers=headers)
            r.raise_for_status()
            data = r.json()
        except requests.RequestException as e:
            return Response({"error": "Failed to fetch server data", "details": str(e)}, status=500)

        servers = data.get("servers", [])
        total = len(servers)
        online = sum(1 for s in servers if s.get("status") == "ACTIVE")
        offline = total - online

        return Response({
            "total_servers": total,
            "online_servers": online,
            "offline_servers": offline,
        })
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
        redis_key = f"instances_cache:{username}"
        cached_data = redis_client.get(redis_key)

        if cached_data:
            # Lấy data từ cache
            result = ast.literal_eval(cached_data)
            return Response(result)

        # Nếu không có cache thì lấy token từ redis, gọi API, cache lại
        token_key = f"keystone_token:{username}"
        token = redis_client.get(token_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        # Gọi task Celery để cache data
        cache_user_instances.delay(username, token)

        # Tạm thời trả dữ liệu empty, client sẽ gọi lại sau để lấy cache
        return Response({"message": "Caching in progress, try again shortly."}, status=202)

class LimitSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        redis_key = f"keystone_token:{username}"
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


class CreateInstanceAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1. Lấy token từ Redis theo username
        username = request.user.username
        redis_key = f"keystone_token:{username}"
        token = redis_client.get(redis_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)
        # token = token.decode()
        project_id = request.auth.get('project_id')

        # 3. Lấy dữ liệu đầu vào từ request.data
        name = request.data.get('name')
        image_id = request.data.get('image_id')
        flavor_id = request.data.get('flavor_id')
        network_id = request.data.get('network_id')

        if not all([name, image_id, flavor_id, network_id]):
            return Response({"error": "Missing required fields"}, status=400)

        # 4. Chuẩn bị URL và payload gửi lên OpenStack Nova API
        nova_url = f"http://172.93.187.251/compute/v2.1/{project_id}/servers"
        payload = {
            "server": {
                "name": name,
                "imageRef": image_id,
                "flavorRef": flavor_id,
                "networks": [{"uuid": network_id}],
                "availability_zone": "nova",
            }
        }
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        # 5. Gửi request POST lên Nova API tạo instance
        try:
            response = requests.post(nova_url, json=payload, headers=headers)
            if response.status_code in [200, 202]:
                # Tạo thành công trả về 201 với dữ liệu response
                return Response(response.json(), status=201)
            else:
                # Trả về lỗi từ Nova API
                return Response(response.json(), status=response.status_code)
        except Exception as e:
            # Xử lý lỗi ngoại lệ (network, timeout,...)
            return Response({"error": str(e)}, status=500)
