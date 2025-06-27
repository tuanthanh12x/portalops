from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404
from openstack.exceptions import SDKException
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from userauth.permissions import IsAdmin

from overview.tasks import redis_client
from .models import ProjectType, ProjectUserMapping, Project
from utils.conn import vl_connect_with_token

from utils.conn import connect_with_token_v5


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
            "floating_ips", "security_groups", "security_group_rules"
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

class AllProjectsOverview(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"

        token_bytes = redis_client.get(token_key)
        if not token_bytes:
            return Response({"error": "Token not found in Redis."}, status=401)

        token = token_bytes
        conn = connect_with_token_v5(token, project_id)

        projects = Project.objects.select_related("type").all()

        # Build project_id -> user_id mapping
        user_map = {}
        for mapping in ProjectUserMapping.objects.select_related("user").order_by("joined_at"):
            if mapping.project_id not in user_map:
                user_map[mapping.project_id] = mapping.user.id

        result = []
        for project in projects:
            project_type = project.type
            openstack_status = None

            # Get OpenStack project status (if project exists in Keystone)
            try:
                os_project = conn.identity.get_project(project.openstack_id)
                openstack_status = "enabled" if os_project.is_enabled else "disabled"
            except Exception as e:
                openstack_status = f"❌ error: {str(e)}"

            result.append({
                "project_id": project.id,
                "project_name": project.name,
                "openstack_id": project.openstack_id,
                "project_type": {
                    "id": project_type.id if project_type else None,
                    "name": project_type.name if project_type else None,
                },
                "user_id": user_map.get(project.id),
                "status": openstack_status,
            })

        return Response(result)


class CreateProjectView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"

        token_bytes = redis_client.get(token_key)
        if not token_bytes:
            return Response({"error": "Token not found in Redis."}, status=401)

        token = token_bytes
        conn = connect_with_token_v5(token, project_id)

        # Step 1: Parse input
        name = request.data.get("name")
        description = request.data.get("description", "")
        type_id = request.data.get("project_type_id")
        assign_user_id = request.data.get("user_id", None)  # Optional

        if not name or not type_id:
            return Response({"error": "Missing required fields: name or project_type_id"}, status=400)

        project_type = get_object_or_404(ProjectType, id=type_id)

        try:
            # Step 2: Create OpenStack project
            os_project = conn.identity.create_project(
                name=name,
                description=description,
                is_enabled=True,
                domain_id="default"
            )

            # Step 3: Apply quotas from ProjectType
            try:
                conn.set_compute_quotas(project_id=os_project.id, quotas={
                    "instances": project_type.instances,
                    "cores": project_type.vcpus,
                    "ram": project_type.ram,
                    "key_pairs": project_type.key_pairs,
                    "server_groups": project_type.server_groups,
                    "server_group_members": project_type.server_group_members,
                    "metadata_items": project_type.metadata_items,
                    "injected_files": project_type.injected_files,
                    "injected_file_content_bytes": project_type.injected_file_content_bytes,
                })

                conn.set_network_quotas(project_id=os_project.id, quotas={
                    "floatingip": project_type.floating_ips,
                    "network": project_type.networks,
                    "port": project_type.ports,
                    "router": project_type.routers,
                    "security_group": project_type.security_groups,
                    "security_group_rule": project_type.security_group_rules,
                    "subnet": project_type.subnets,
                })

                conn.set_volume_quotas(project_id=os_project.id, quotas={
                    "volumes": project_type.volumes,
                    "snapshots": project_type.volume_snapshots,
                    "gigabytes": project_type.total_volume_gb,
                })
            except SDKException as quota_error:
                return Response({
                    "error": f"OpenStack project created, but failed to apply quotas: {str(quota_error)}"
                }, status=500)

            # Step 4: Create local project record
            new_project = Project.objects.create(
                name=name,
                description=description,
                type=project_type,
                openstack_id=os_project.id,
            )

            mapped_user_id = None

            # Step 5 (optional): assign project owner
            if assign_user_id:
                user_obj = get_object_or_404(User, id=assign_user_id)
                ProjectUserMapping.objects.create(
                    user=user_obj,
                    project=new_project,
                    role="admin",
                    is_active=True
                )
                mapped_user_id = user_obj.id

            return Response({
                "project_id": new_project.id,
                "project_name": new_project.name,
                "openstack_id": new_project.openstack_id,
                "project_type": {
                    "id": project_type.id,
                    "name": project_type.name
                },
                "user_id": mapped_user_id,
                "status": "enabled"
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)