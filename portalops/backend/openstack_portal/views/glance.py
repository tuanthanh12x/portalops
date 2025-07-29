from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from utils.redis_client import redis_client

from ..services.glance import get_valid_token, list_all_images, list_snapshots
from utils.conn import connect_with_token_v5

from userauth.permissions import IsAdmin


class ListImagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.auth.get("username")
        project_id = request.auth.get("project_id") if request.auth else None

        if not project_id:
            return Response({"error": "Missing project_id in token"}, status=401)

        try:
            token = get_valid_token(redis_client, username, project_id)
            result = list_all_images(token, project_id)
            return Response(result)
        except ValueError as ve:
            return Response({"error": str(ve)}, status=401)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class SnapshotListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.auth.get("username")
        project_id = request.auth.get("project_id") if request.auth else None

        if not project_id:
            return Response({"error": "Missing project_id in token"}, status=401)

        try:
            token = get_valid_token(redis_client, username, project_id)
            result = list_snapshots(token, project_id)
            return Response(result)
        except ValueError as ve:
            return Response({"error": str(ve)}, status=401)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class CreateImageAsAdminView(APIView):
    permission_classes = [IsAdmin]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        try:
            # Step 1: Extract project_id from token
            project_id = request.auth.get("project_id")
            if not project_id:
                return Response({"error": "Missing project_id in token."}, status=400)
            username = request.user.username
            project_id = request.auth.get('project_id')

            token_key = f"keystone_token:{username}:{project_id}"
            token_bytes = redis_client.get(token_key)

            # Step 2: Get admin token and connection
            admin_token = token_bytes.decode()
            if not admin_token:
                return Response({"error": "Failed to get admin token."}, status=500)

            conn = connect_with_token_v5(admin_token, project_id)

            # Step 3: Get form-data
            name = request.data.get("name")
            disk_format = request.data.get("disk_format")  # e.g., qcow2, raw, vmdk
            visibility = request.data.get("visibility", "private")  # default private
            image_file = request.FILES.get("file")

            if not all([name, disk_format, image_file]):
                return Response({"error": "Missing required fields."}, status=400)

            # Step 4: Create the image (metadata only first)
            image = conn.image.create_image(
                name=name,
                disk_format=disk_format,
                container_format="bare",
                visibility=visibility
            )

            # Step 5: Upload image content
            conn.image.upload_image(image, data=image_file)

            return Response({
                "message": "Image created successfully.",
                "image_id": image.id,
                "image_name": image.name
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)