from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from utils.redis_client import redis_client

from ..services.glance import get_valid_token, list_all_images, list_snapshots


class ListImagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
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
        username = request.user.username
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
