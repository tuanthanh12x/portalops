import json

import redis
import requests
from django.shortcuts import render
from rest_framework import serializers, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import time
from ..tasks import fetch_and_cache_instance_options
from project.models import ProjectType

from userauth.permissions import IsAdmin

from overview.tasks import cache_user_instances

from utils.conn import get_admin_connection

redis_client = redis.Redis(host='redis', port=6379, db=0)

class InstanceOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.auth.get("username")
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
import json

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
        username = request.auth.get("username")
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



class CreateInstanceAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.auth.get("username")
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
            time.sleep(12)
            cache_user_instances(username, token, project_id)
            return Response({"instance": server.to_dict()}, status=201)

        except Exception as e:
            return Response({"error": f"Failed to create instance: {str(e)}"}, status=500)


class CreateInstanceAsAdminAPI(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        # Required fields
        target_project_id = request.data.get("project_id")
        name = request.data.get("name")
        image_id = request.data.get("image_id")
        flavor_id = request.data.get("flavor_id")
        network_id = request.data.get("network_id")

        if not all([target_project_id, name, image_id, flavor_id, network_id]):
            return Response({"error": "Missing required fields"}, status=400)

        # Dùng kết nối của admin, scoped vào project của user
        try:
            conn = get_admin_connection(project_id=target_project_id)
        except Exception as e:
            return Response({"error": f"Failed to connect as admin: {str(e)}"}, status=500)

        # Tạo server
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
        username = request.auth.get("username")

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

        glance_url = f"{settings.OPENSTACK_IMAGE_URL}/v2/images"
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
            upload_url = f"{settings.OPENSTACK_IMAGE_URL}/v2/images/{image_id}/file"
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





class InstanceActionAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):  # id = instance_id
        username = request.auth.get("username")
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
            elif action == "delete":
                conn.compute.delete_server(server, ignore_missing=True)
            else:
                return Response({"error": f"Unsupported action: {action}"}, status=400)
            time.sleep(7)
            cache_user_instances(username, token, project_id)
            return Response({"message": f"Action '{action}' executed successfully on instance {id}"})

        except Exception as e:
            return Response({"error": str(e)}, status=500)





class KeypairView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.auth.get("username")
        project_id = request.auth.get("project_id")

        redis_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(redis_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        try:
            conn = connect_with_token(token, project_id)
            keypairs = conn.compute.keypairs()

            result = []
            for keypair in keypairs:
                result.append({
                    "name": keypair.name,
                    "fingerprint": keypair.fingerprint,
                    "type": keypair.type,
                    "public_key": keypair.public_key,
                })

            return Response(result)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        username = request.user.username
        project_id = request.auth.get('project_id')

        redis_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(redis_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        keypair_name = request.data.get('name')
        if not keypair_name:
            return Response({"error": "Keypair name is required"}, status=400)

        nova_url = f"{settings.OPENSTACK_COMPUTE_URL}"
        headers = {
            "X-Auth-Token": token.decode() if isinstance(token, bytes) else token,
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





from datetime import datetime



class VPSDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, instance_id):
        username = request.auth.get("username")
        project_id = request.auth.get("project_id")
        if not project_id:
            return Response({"error": "Missing project_id in token"}, status=400)

        token_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(token_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)
        if isinstance(token, bytes):
            token = token.decode()

        try:
            conn = vl_connect_with_token(token, project_id)

            # Get instance info
            instance = conn.compute.get_server(instance_id)
            flavor_id_or_name = instance.flavor.get("id")
            flavor = conn.compute.find_flavor(flavor_id_or_name)

            if not flavor:
                return Response({"error": f"Flavor '{flavor_id_or_name}' not found"}, status=404)

            image = conn.compute.get_image(instance.image["id"]) if instance.image else None
            addresses = instance.addresses or {}

            # Network info
            private_ip, floating_ip, mac_address, subnet = "", "", "", ""
            for net in addresses.values():
                for addr in net:
                    if addr.get("OS-EXT-IPS:type") == "floating":
                        floating_ip = addr["addr"]
                    elif addr.get("OS-EXT-IPS:type") == "fixed":
                        private_ip = addr["addr"]
                        mac_address = addr.get("OS-EXT-IPS-MAC:mac_addr", "")
                        subnet = addr.get("subnet", "")

            # Attached volumes
            volumes = []
            for attachment in instance.attached_volumes:
                vol = conn.block_storage.get_volume(attachment["id"])
                volumes.append({
                    "id": vol.id,
                    "name": vol.name,
                    "size": f"{vol.size} GB",
                    "status": vol.status
                })

            glance_snapshots = [
                {
                    "id": img.id,
                    "name": img.name or img.id,
                    "size": f"{img.size / (1024 ** 3):.2f} GB",
                    "created_at": img.created_at
                }
                for img in conn.image.images()
                if img.visibility == "private"
                   and img.get("image_type") == "snapshot"
            ]

            if isinstance(instance.created_at, datetime):
                created_at = instance.created_at.isoformat()
            else:
                created_at = instance.created_at  # giữ nguyên nếu đã là string
            data = {
                "id": instance.id,
                "name": instance.name,
                "status": instance.status,
                "ip": floating_ip or private_ip,
                "cpu": f"{flavor.vcpus} vCPU",
                "ram": f"{flavor.ram / 1024:.1f} GB",
                "disk": f"{flavor.disk} GB",
                "os": image.name if image else "Custom Image",
                "datacenter": instance.availability_zone,
                "created_at": created_at,

                "monitoring": {
                    "cpu_usage": 55,  # Placeholder
                    "ram_usage": 72,
                    "disk_usage": 40
                },

                "snapshots": glance_snapshots,
                "volumes": volumes,
                "network": {
                    "floating_ip": floating_ip,
                    "private_ip": private_ip,
                    "mac_address": mac_address,
                    "subnet": subnet or "192.168.1.0/24"  # fallback
                }
            }

            return Response(data)

        except Exception as e:
            return Response({"error": str(e)}, status=500)



class InstanceSnapshotView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    class SnapshotCreateSerializer(serializers.Serializer):
        name = serializers.CharField(max_length=255)

    def post(self, request, instance_id):
        serializer = self.SnapshotCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        snapshot_name = serializer.validated_data["name"]
        username = request.auth.get("username")
        project_id = request.auth.get("project_id")
        if not project_id:
            return Response({"error": "Missing project_id in token"}, status=400)

        token_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(token_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)
        if isinstance(token, bytes):
            token = token.decode()

        try:
            conn = vl_connect_with_token(token, project_id)

            image = conn.compute.create_server_image(instance_id, snapshot_name)
            return Response(
                {"message": f"Snapshot '{snapshot_name}' created successfully", "image_id": image.id},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to create snapshot: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
