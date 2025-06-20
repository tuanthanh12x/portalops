from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from utils.conn import connect_with_token  # thay thế bằng path helper thực tế
from utils.redis_client import redis_client  # thay thế bằng thực thể Redis bạn đang dùng

class VolumeAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get_token(self, request):
        username = request.auth.get("username")
        project_id = request.auth.get('project_id')

        redis_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(redis_key)

        if not token:
            return None, project_id, Response({"error": "Token expired or missing"}, status=401)

        if isinstance(token, bytes):
            token = token.decode()

        return token, project_id, None

    def get(self, request):
        token, project_id, error = self.get_token(request)
        if error:
            return error

        try:
            conn = connect_with_token(token, project_id)
            volumes = conn.block_storage.volumes(details=True)

            result = []
            for vol in volumes:
                detailed_vol = conn.block_storage.get_volume(vol.id)

                snapshot_id = getattr(detailed_vol, "snapshot_id", None)
                image_meta = getattr(detailed_vol, "volume_image_metadata", None)
                source_volid = getattr(detailed_vol, "source_volid", None)

                if snapshot_id:
                    source_type = "snapshot"
                    source_id = snapshot_id
                elif image_meta:
                    source_type = "image"
                    source_id = detailed_vol.volume_image_metadata.get(
                        'image_id') if detailed_vol.volume_image_metadata else None
                elif source_volid:
                    source_type = "volume"
                    source_id = source_volid
                else:
                    source_type = "manual"
                    source_id = None

                result.append({
                    "id": detailed_vol.id,
                    "name": detailed_vol.name,
                    "type": detailed_vol.volume_type,
                    "source_type": source_type,
                    "source_id": source_id,
                    "size": detailed_vol.size,
                    "status": detailed_vol.status,
                    "created_at": detailed_vol.created_at,
                    "description": detailed_vol.description or "",
                })

            return Response(result)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        token, project_id, error = self.get_token(request)
        if error:
            return error

        name = request.data.get('name')
        size = request.data.get('size')
        volume_type = request.data.get('volume_type')
        availability_zone = request.data.get('availability_zone')

        if not all([name, size, volume_type, availability_zone]):
            return Response({"error": "Missing required fields"}, status=400)

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
