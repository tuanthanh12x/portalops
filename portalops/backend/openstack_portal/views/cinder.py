from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from overview.tasks import redis_client
from utils.conn import connect_with_token


class ListVolumesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")  # your token payload has project_id?

        redis_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(redis_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        try:
            conn = connect_with_token(token, project_id)  # your OpenStack connection helper
            volumes = conn.block_storage.volumes(details=True)

            result = []
            for vol in volumes:
                result.append({
                    "id": vol.id,
                    "name": vol.name,
                    "size": vol.size,  # size in GB
                    "status": vol.status,
                    "created_at": vol.created_at,
                    "description": vol.description or "",
                })

            return Response(result)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
