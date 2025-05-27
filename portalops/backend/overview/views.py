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

        project_id = request.auth.get('project_id')

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
                "created": s.get("created", "")[:10]
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

        nova_url = "http://172.93.187.251/compute/v2.1"
        glance_url = "http://172.93.187.251/image/v2"
        neutron_url = f"http://172.93.187.251/networking/v2.0"  # Neutron API

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

        ### 4. Networks
        try:
            net_res = requests.get(f"{neutron_url}/networks", headers=headers)
            net_res.raise_for_status()
            networks_data = net_res.json().get("networks", [])
            networks = [{"id": net.get("id"), "name": net.get("name")} for net in networks_data]
        except Exception:
            networks = []

        return Response({
            "regions": regions,
            "plans": plans,
            "images": images,
            "networks": networks,  # Thêm networks ở đây
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
        token = token.decode()
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
