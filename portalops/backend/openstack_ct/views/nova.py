from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from openstack_ct.services.usage_service import get_project_usage


class ResourceUsageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")

        if not project_id:
            return Response({"detail": "Missing project_id in token"}, status=400)

        try:
            data = get_project_usage(username, project_id)
            return Response(data)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)