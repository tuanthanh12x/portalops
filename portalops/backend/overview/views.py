import redis
import requests
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


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


class MyInstancesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        redis_key = f"keystone_token:{username}"
        token = redis_client.get(redis_key)

        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        project_id = request.auth.get('project_id')  # nếu bạn gắn vào JWT

        nova_url = "http://172.93.187.251/compute/v2.1"
        headers = {"X-Auth-Token": token.decode()}
        url = f"{nova_url}/servers/detail"

        try:
            r = requests.get(url, headers=headers)
            r.raise_for_status()
            data = r.json()
        except requests.RequestException as e:
            return Response({"error": "Failed to fetch instances", "details": str(e)}, status=500)

        servers = data.get("servers", [])
        result = []

        for s in servers:
            # Lấy địa chỉ IP đầu tiên nếu có
            ip = ""
            for net in s.get("addresses", {}).values():
                if isinstance(net, list) and net:
                    ip = net[0].get("addr", "")
                    break

            flavor_id = s.get("flavor", {}).get("id")
            plan = "Unknown"

            if flavor_id:
                flavor_url = f"{nova_url}/flavors/{flavor_id}"
                try:
                    flavor_res = requests.get(flavor_url, headers=headers)
                    flavor_res.raise_for_status()
                    flavor_info = flavor_res.json().get("flavor", {})
                    vcpus = flavor_info.get("vcpus")
                    ram = flavor_info.get("ram")  # MB
                    disk = flavor_info.get("disk")  # GB
                    name = flavor_info.get("name", "Unnamed Plan")
                    plan = f"{name} ({vcpus} vCPU / {ram}MB / {disk}GB)"
                except Exception:
                    plan = "Unknown"

            instance = {
                "id": s.get("id"),
                "name": s.get("name"),
                "status": "Online" if s.get("status") == "ACTIVE" else "Offline",
                "ip": ip,
                "plan": plan,
                "region": s.get("OS-EXT-AZ:availability_zone", ""),
                "created": s.get("created", "")[:10]  # YYYY-MM-DD
            }
            result.append(instance)

        return Response(result)

class LimitSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        redis_key = f"keystone_token:{username}"
        token = redis_client.get(redis_key)

        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        token = token.decode()
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

        # 2. Cinder: Lấy Storage
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
            "ram": {"used": ram_used, "limit": ram_limit},       # MB
            "storage": {"used": storage_used, "limit": storage_limit}  # GB
        })