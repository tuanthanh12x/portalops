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



class InstanceOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        redis_key = f"keystone_token:{username}"
        token = redis_client.get(redis_key)

        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        token = token.decode()
        project_id = request.auth.get('project_id')
        headers = {"X-Auth-Token": token}

        nova_url = settings.OS_NOVA_URL  # e.g., http://172.93.187.251/compute/v2.1
        glance_url = settings.OS_GLANCE_URL  # e.g., http://172.93.187.251/image/v2

        ### 1. Availability Zones (Regions)
        try:
            az_res = requests.get(f"{nova_url}/os-availability-zone", headers=headers)
            az_res.raise_for_status()
            az_data = az_res.json()
            regions = [
                az["zoneName"] for az in az_data.get("availabilityZoneInfo", [])
                if az.get("zoneState", {}).get("available", False)
            ]
        except Exception:
            regions = []

        ### 2. Images
        try:
            img_res = requests.get(f"{glance_url}/images", headers=headers)
            img_res.raise_for_status()
            img_list = img_res.json().get("images", [])
        except Exception:
            img_list = []

        images = {
            "distribution": [],
            "marketplace": [],
            "my_images": [],
            "iso": []
        }

        for img in img_list:
            name = img.get("name", "").lower()
            entry = {"id": img.get("id"), "name": img.get("name")}

            if "ubuntu" in name or "centos" in name:
                images["distribution"].append(entry)
            elif "win" in name or "market" in name:
                images["marketplace"].append(entry)
            elif "iso" in name or img.get("disk_format") == "iso":
                images["iso"].append(entry)
            elif img.get("owner") == project_id:
                images["my_images"].append(entry)

        ### 3. Flavors (Plans)
        try:
            flavor_res = requests.get(f"{nova_url}/flavors/detail", headers=headers)
            flavor_res.raise_for_status()
            flavor_list = flavor_res.json().get("flavors", [])
        except Exception:
            flavor_list = []

        plans = []
        for flavor in flavor_list:
            plans.append({
                "id": flavor.get("id"),
                "label": f"{flavor.get('name')} - {flavor.get('vcpus')} CPU, {flavor.get('ram')}MB RAM, {flavor.get('disk')}GB SSD"
            })

        return Response({
            "regions": regions,
            "plans": plans,
            "images": images
        })