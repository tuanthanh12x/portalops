from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from overview.tasks import redis_client
from utils.conn import connect_with_token



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

        try:
            conn = connect_with_token(token, project_id)
            images = conn.image.images()

            result = []
            for image in images:
                props = image.get("properties", {}) or {}
                result.append({
                    "id": image.id,
                    "name": image.name,
                    "size": image.size,
                    "status": image.status,
                    "created_at": image.created_at,
                    "visibility": image.visibility,
                    "disk_format": image.disk_format,
                    "os_type": props.get("os_type", "-"),
                })

            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=500)