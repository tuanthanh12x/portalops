import json

import redis
import requests
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from ..tasks import fetch_and_cache_instance_options

redis_client = redis.Redis(host='redis', port=6379, db=0)



class InstanceOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        redis_key = f"instance_options:{username}"
        cached_data = redis_client.get(redis_key)

        if cached_data:
            data = json.loads(cached_data)
        else:
            token = redis_client.get(f"keystone_token:{username}")
            if not token:
                return Response({"error": "Token expired or missing"}, status=401)

            project_id = request.auth.get('project_id')

            # Gọi Celery task (chạy đồng bộ ở đây hoặc chỉ gọi task rồi trả về trước)
            # Bạn có thể chạy task theo kiểu delay() (bất đồng bộ) và trả về cache cũ hoặc rỗng
            # Ở đây, ta chạy đồng bộ cho ví dụ:
            data = fetch_and_cache_instance_options(username, token, project_id)

        return Response(data)


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


from rest_framework.parsers import MultiPartParser, FormParser


class CreateImageAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        username = request.user.username
        redis_key = f"keystone_token:{username}"
        token = redis_client.get(redis_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        project_id = request.auth.get('project_id')
        if not project_id:
            return Response({"error": "Project ID missing in token"}, status=400)

        # Lấy thông tin từ form-data
        name = request.data.get('name')
        disk_format = request.data.get('disk_format')
        visibility = request.data.get('visibility', 'private')
        image_file = request.FILES.get('file')

        if not all([name, disk_format, image_file]):
            return Response({"error": "Missing required fields"}, status=400)

        glance_url = f"http://172.93.187.251/image/v2/images"
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        payload = {
            "name": name,
            "disk_format": disk_format,
            "visibility": visibility,
            "container_format": "bare",
        }

        try:
            # Tạo metadata
            resp = requests.post(glance_url, json=payload, headers=headers)
            if resp.status_code not in [200, 201]:
                return Response(resp.json(), status=resp.status_code)

            image = resp.json()
            image_id = image['id']

            # Upload file image (PUT)
            upload_url = f"http://172.93.187.251/image/v2/images/{image_id}/file"
            upload_headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/octet-stream"
            }
            upload_resp = requests.put(upload_url, data=image_file.read(), headers=upload_headers)
            if upload_resp.status_code not in [200, 201, 204]:
                return Response(upload_resp.json(), status=upload_resp.status_code)

            return Response(image, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


import redis
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

redis_client = redis.Redis(host='redis', port=6379, db=0)

class CreateKeypairAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.user.username
        redis_key = f"keystone_token:{username}"
        token = redis_client.get(redis_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        project_id = request.auth.get('project_id')
        keypair_name = request.data.get('name')

        if not keypair_name:
            return Response({"error": "Keypair name is required"}, status=400)

        nova_url = "http://172.93.187.251/compute/v2.1"
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        payload = {
            "keypair": {
                "name": keypair_name,
            }
        }

        try:
            response = requests.post(f"{nova_url}/os-keypairs", json=payload, headers=headers)
            if response.status_code in [200, 201]:
                return Response(response.json(), status=201)
            else:
                return Response(response.json(), status=response.status_code)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

