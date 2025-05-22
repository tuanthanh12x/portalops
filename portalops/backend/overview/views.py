import redis
import requests
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


# Redis client dùng chung
redis_client = redis.Redis(host='localhost', port=6379, db=0)


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

            # Mô tả plan nếu có flavor
            flavor = s.get("flavor", {})
            plan = flavor.get("original_name", "Unknown")

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
