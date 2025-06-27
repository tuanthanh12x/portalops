from django.shortcuts import render
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from userauth.permissions import IsAdmin

from overview.tasks import redis_client
from .models import ProjectType
from utils.conn import vl_connect_with_token



class CreateProjectTypeView(APIView):
    permission_classes = [IsAdmin]

    class InputSerializer(serializers.Serializer):
        name = serializers.CharField(max_length=100)
        price_per_month = serializers.DecimalField(max_digits=10, decimal_places=4)
        description = serializers.CharField(required=False, allow_blank=True)

        instances = serializers.IntegerField(min_value=0)
        vcpus = serializers.IntegerField(min_value=0)
        ram = serializers.IntegerField(min_value=0)

        metadata_items = serializers.IntegerField(min_value=0, default=128)
        key_pairs = serializers.IntegerField(min_value=0, default=100)
        server_groups = serializers.IntegerField(min_value=0, default=10)
        server_group_members = serializers.IntegerField(min_value=0, default=10)
        injected_files = serializers.IntegerField(min_value=0, default=5)
        injected_file_content_bytes = serializers.IntegerField(min_value=0, default=10240)

        volumes = serializers.IntegerField(min_value=0)
        volume_snapshots = serializers.IntegerField(min_value=0)
        total_volume_gb = serializers.IntegerField(min_value=0)

        networks = serializers.IntegerField(min_value=0, default=100)  # ✅ Add this line
        routers = serializers.IntegerField(min_value=0, default=10)
        ports = serializers.IntegerField(min_value=0, default=500)
        subnets = serializers.IntegerField(min_value=0, default=50)
        floating_ips = serializers.IntegerField(min_value=0, default=50)
        security_groups = serializers.IntegerField(min_value=0, default=10)
        security_group_rules = serializers.IntegerField(min_value=0, default=100)

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        try:
            project_type = ProjectType.objects.create(
                name=data["name"],
                price_per_month=data["price_per_month"],
                description=data.get("description", ""),
                instances=data["instances"],
                vcpus=data["vcpus"],
                ram=data["ram"],
                metadata_items=data["metadata_items"],
                key_pairs=data["key_pairs"],
                server_groups=data["server_groups"],
                server_group_members=data["server_group_members"],
                injected_files=data["injected_files"],
                injected_file_content_bytes=data["injected_file_content_bytes"],
                volumes=data["volumes"],
                volume_snapshots=data["volume_snapshots"],
                total_volume_gb=data["total_volume_gb"],
                networks=data["networks"],  # ✅ Add this line
                ports=data["ports"],
                subnets=data["subnets"],
                routers=data["routers"],
                floating_ips=data["floating_ips"],
                security_groups=data["security_groups"],
                security_group_rules=data["security_group_rules"],
            )

            return Response({
                "message": "✅ Project Type with quota created successfully.",
                "project_type_id": project_type.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"❌ Failed to create Project Type: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProjectTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectType
        fields = [
            "id", "name", "price_per_month", "description",
            "instances", "vcpus", "ram",
            "metadata_items", "key_pairs", "server_groups", "server_group_members",
            "injected_files", "injected_file_content_bytes",
            "volumes", "volume_snapshots", "total_volume_gb",
            "networks", "routers", "ports", "subnets",
            "floating_ips", "security_groups", "security_group_rules",
            "created_at", "updated_at"  # if your model has these fields
        ]


class ListProjectTypeView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            project_types = ProjectType.objects.all().order_by("-id")
            serializer = ProjectTypeSerializer(project_types, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"❌ Failed to fetch Project Types: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )