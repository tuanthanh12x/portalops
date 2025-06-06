from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from utils.conn import connect_with_token  # Thay bằng đường dẫn thực tế
from utils.redis_client import redis_client  # Thay bằng thực thể Redis bạn đang dùng

class ListImagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id") if request.auth else None

        if not project_id:
            return Response({"error": "Missing project_id in token"}, status=401)

        redis_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(redis_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        if isinstance(token, bytes):
            token = token.decode()

        try:
            conn = connect_with_token(token, project_id)
            images = conn.image.images()

            result = []
            for image in images:
                props = getattr(image, "properties", {}) or {}
                image_type = props.get("image_type", "image")  # Lấy kiểu ảnh hoặc mặc định "image"
                result.append({
                    "id": image.id,
                    "name": image.name,
                    "size": image.size,
                    "status": image.status,
                    "created_at": image.created_at,
                    "visibility": image.visibility,
                    "disk_format": image.disk_format,
                    "os_type": props.get("os_type", "-"),
                    "image_type": image_type,  # Trường mới thêm
                })

            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
