import requests
from django.conf import settings
from datetime import datetime
from utils.redis_client import redis_client


def get_project_usage(username, project_id):
    token_key = f"keystone_token:{username}"
    token = redis_client.get(token_key)
    if not token:
        raise ValueError("Token expired or missing")

    token = token.decode()
    nova_url = "http://172.93.187.251/compute/v2.1"

    today = datetime.utcnow()
    start = today.replace(day=1).isoformat()
    end = today.isoformat()

    url = f"{nova_url}/os-simple-tenant-usage/{project_id}"
    params = {
        "start": start,
        "end": end
    }
    headers = {"X-Auth-Token": token}

    r = requests.get(url, headers=headers, params=params)
    r.raise_for_status()

    usage = r.json().get("tenant_usage", {})
    return {
        "total_vcpus": usage.get("total_vcpus_usage", 0),
        "total_ram_mb": usage.get("total_memory_mb_usage", 0),
        "total_storage_gb": usage.get("total_local_gb_usage", 0)
    }

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from openstack import connection
from django.conf import settings

class LimitSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        token = request.headers.get("X-Auth-Token")
        project_id = request.auth.get("project_id")  # Giả định bạn đã decode từ JWT

        conn = connection.Connection(
            auth_url=settings.OS_AUTH_URL,
            project_id=project_id,
            token=token,
            compute_api_version='2.1',
        )

        # 1. CPU & RAM từ Nova
        nova_limits = conn.compute.get_limits()
        absolute = nova_limits['absolute']
        cpu_used = absolute['totalCoresUsed']
        cpu_limit = absolute['maxTotalCores']
        ram_used = absolute['totalRAMUsed']          # MB
        ram_limit = absolute['maxTotalRAMSize']      # MB

        # 2. Storage từ Cinder
        cinder_quota = conn.block_storage.get_quota_set(project_id, usage=True)
        storage_used = cinder_quota['gigabytes']['in_use']
        storage_limit = cinder_quota['gigabytes']['limit']

        return Response({
            "cpu": {"used": cpu_used, "limit": cpu_limit},
            "ram": {"used": ram_used, "limit": ram_limit},  # Đơn vị: MB
            "storage": {"used": storage_used, "limit": storage_limit}  # Đơn vị: GB
        })
