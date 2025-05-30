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
        project_id = request.auth.get('project_id')

        if not project_id:
            return Response({"error": "Missing project_id in token"}, status=400)

        # Redis key để cache options theo user + project
        redis_key = f"instance_options:{username}:{project_id}"
        cached_data = redis_client.get(redis_key)

        if cached_data:
            try:
                data = json.loads(cached_data)
                return Response(data)
            except json.JSONDecodeError:
                pass  # Nếu lỗi parse, fallback để fetch mới

        # Lấy Keystone token từ Redis
        token_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(token_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        if isinstance(token, bytes):
            token = token.decode()

        try:
            data = fetch_and_cache_instance_options(username, token, project_id)
            return Response(data)
        except Exception as e:
            return Response({"error": f"Failed to fetch options: {str(e)}"}, status=500)




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from openstack import connection
from keystoneauth1 import session
from keystoneauth1.identity import v3
import json

# Redis client assumed to be imported already
# from your_app.redis_config import redis_client

def vl_connect_with_token(token, project_id):
    auth = v3.Token(
        auth_url=settings.OPENSTACK_AUTH["auth_url"],
        token=token,
        project_id=project_id
    )
    sess = session.Session(auth=auth)
    return connection.Connection(
        session=sess,
        block_storage_api_version='3',  # Force Cinder v3
    )

def fetch_volume_types(conn):
    try:
        response = conn.block_storage.get("/types")
        types = response.json().get("volume_types", [])
        return [{"id": t["id"], "name": t["name"]} for t in types]
    except Exception as e:
        return []


class VolumeOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        project_id = request.auth.get('project_id')

        if not project_id:
            return Response({"error": "Missing project_id in token"}, status=400)

        redis_key = f"volume_options:{username}:{project_id}"
        cached_data = redis_client.get(redis_key)

        if cached_data:
            try:
                return Response(json.loads(cached_data))
            except json.JSONDecodeError:
                pass

        token_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(token_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)
        if isinstance(token, bytes):
            token = token.decode()

        try:
            conn = vl_connect_with_token(token, project_id)

            # Fallback GET /types
            def fetch_volume_types(conn):
                try:
                    response = conn.block_storage.get("/types")
                    types = response.json().get("volume_types", [])
                    return [{"id": t["id"], "name": t["name"]} for t in types]
                except Exception:
                    return []

            volume_types = fetch_volume_types(conn)

            azs = [
                az.name for az in conn.block_storage.availability_zones()
                if getattr(az, "state", {}).get("available", False)
            ]

            images = [
                {"id": img.id, "name": img.name}
                for img in conn.image.images()
                if img.status == "active"
            ]

            volumes = [
                {"id": vol.id, "name": vol.name or vol.id}
                for vol in conn.block_storage.volumes(details=True)
            ]

            snapshots = [
                {"id": snap.id, "name": snap.name or snap.id}
                for snap in conn.block_storage.snapshots(details=True)
            ]

            data = {
                "volume_types": volume_types,
                "availability_zones": azs,
                "images": images,
                "volumes": volumes,
                "snapshots": snapshots,
            }

            redis_client.set(redis_key, json.dumps(data), ex=300)
            return Response(data)

        except Exception as e:
            return Response({"error": f"Failed to fetch options: {str(e)}"}, status=500)



from utils.redis_client import redis_client


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from openstack import connection


class CreateVolumeAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.user.username
        project_id = request.auth.get('project_id')

        redis_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(redis_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        if isinstance(token, bytes):
            token = token.decode()

        # Required fields
        name = request.data.get('name')
        size = request.data.get('size')
        volume_type = request.data.get('volume_type')
        availability_zone = request.data.get('availability_zone')

        if not all([name, size, volume_type, availability_zone]):
            return Response({"error": "Missing required fields"}, status=400)

        # Optional fields
        description = request.data.get('description', '')
        bootable = request.data.get('bootable', False)
        source_image = request.data.get('source_image')
        source_volume = request.data.get('source_volume')
        source_snapshot = request.data.get('source_snapshot')

        try:
            conn = connect_with_token(token, project_id)

            create_kwargs = {
                "name": name,
                "size": size,
                "volume_type": volume_type,
                "availability_zone": availability_zone,
                "description": description,
            }

            # Set source depending on bootable and source fields
            if bootable and source_image:
                create_kwargs["imageRef"] = source_image
            elif source_volume:
                create_kwargs["source_volid"] = source_volume
            elif source_snapshot:
                create_kwargs["snapshot_id"] = source_snapshot

            volume = conn.block_storage.create_volume(**create_kwargs)

            return Response({
                "id": volume.id,
                "name": volume.name,
                "status": volume.status,
                "size": volume.size,
            }, status=201)

        except Exception as e:
            return Response({"error": f"Failed to create volume: {str(e)}"}, status=500)



class CreateInstanceAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.user.username
        project_id = request.auth.get('project_id')


        redis_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(redis_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        if isinstance(token, bytes):
            token = token.decode()

        # Required fields
        name = request.data.get('name')
        image_id = request.data.get('image_id')
        flavor_id = request.data.get('flavor_id')
        network_id = request.data.get('network_id')

        if not all([name, image_id, flavor_id, network_id]):
            return Response({"error": "Missing required fields"}, status=400)

        try:
            conn = connect_with_token(token, project_id)
        except Exception as e:
            return Response({"error": f"Failed to connect OpenStack: {str(e)}"}, status=500)

        try:
            server = conn.compute.create_server(
                name=name,
                image_id=image_id,
                flavor_id=flavor_id,
                networks=[{"uuid": network_id}],
                availability_zone="nova"
            )
            return Response({"instance": server.to_dict()}, status=201)

        except Exception as e:
            return Response({"error": f"Failed to create instance: {str(e)}"}, status=500)


from keystoneauth1 import session
from keystoneauth1.identity import v3

def connect_with_token(token, project_id):
    auth = v3.Token(
        auth_url=settings.OPENSTACK_AUTH["auth_url"],
        token=token,
        project_id=project_id
    )
    sess = session.Session(auth=auth)
    return connection.Connection(session=sess)



from rest_framework.parsers import MultiPartParser, FormParser


class CreateImageAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        username = request.user.username

        project_id = request.auth.get('project_id')

        redis_key = f"keystone_token:{username}:{project_id}"
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
        project_id = request.auth.get('project_id')

        redis_key = f"keystone_token:{username}:{project_id}"
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


class InstanceActionAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):  # id = instance_id
        username = request.user.username
        project_id = request.auth.get('project_id')

        if not project_id:
            return Response({"error": "Missing project_id"}, status=400)

        redis_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(redis_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)
        if isinstance(token, bytes):
            token = token.decode()

        action = request.data.get("action")
        if not action:
            return Response({"error": "Missing action"}, status=400)

        try:
            conn = connect_with_token(token, project_id)

            server = conn.compute.get_server(id)
            if not server:
                return Response({"error": "Instance not found"}, status=404)

            if action == "start":
                conn.compute.start_server(server)
            elif action == "stop":
                conn.compute.stop_server(server)
            elif action == "reboot":
                conn.compute.reboot_server(server, reboot_type="SOFT")
            elif action == "resize":
                new_flavor_id = request.data.get("flavor_id")
                if not new_flavor_id:
                    return Response({"error": "Missing flavor_id for resize"}, status=400)
                conn.compute.resize_server(server, flavor=new_flavor_id)
            else:
                return Response({"error": f"Unsupported action: {action}"}, status=400)

            return Response({"message": f"Action '{action}' executed successfully on instance {id}"})

        except Exception as e:
            return Response({"error": str(e)}, status=500)