from concurrent.futures import ThreadPoolExecutor

import requests
from django.conf import settings
from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404
from openstack.exceptions import SDKException, ResourceNotFound
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from userauth.permissions import IsAdmin

from overview.tasks import redis_client
from .models import ProjectType, ProjectUserMapping, Project, FloatingIPPool, IPStatus
from utils.conn import vl_connect_with_token

from utils.conn import connect_with_token_v5

from .serializers import AssignUserToProjectSerializer, ProjectSerializer, ReplaceProjectOwnerSerializer
from utils.token import get_admin_token


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
    permission_classes = [IsAuthenticated]

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
            user_id = user_map.get(project.id)
            user = User.objects.filter(id=user_id).first() if user_id else None
            result.append({
                "project_id": project.id,
                "project_name": project.name,
                "openstack_id": project.openstack_id,
                "project_type": {
                    "id": project_type.id if project_type else None,
                    "name": project_type.name if project_type else None,
                },
                "user_id": user_id,
                "username": user.username if user else None,
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
                # ✅ Compute quotas
                conn.set_compute_quotas(
                    os_project.id,
                    instances=project_type.instances,
                    cores=project_type.vcpus,
                    ram=project_type.ram,
                    key_pairs=project_type.key_pairs,
                    server_groups=project_type.server_groups,
                    server_group_members=project_type.server_group_members,
                    metadata_items=project_type.metadata_items,
                    injected_files=project_type.injected_files,
                    injected_file_content_bytes=project_type.injected_file_content_bytes
                )

                # ✅ Network quotas
                conn.set_network_quotas(
                    os_project.id,
                    floatingip=project_type.floating_ips,
                    network=project_type.networks,
                    port=project_type.ports,
                    router=project_type.routers,
                    security_group=project_type.security_groups,
                    security_group_rule=project_type.security_group_rules,
                    subnet=project_type.subnets
                )

                # ✅ Volume quotas
                conn.set_volume_quotas(
                    os_project.id,
                    volumes=project_type.volumes,
                    snapshots=project_type.volume_snapshots,
                    gigabytes=project_type.total_volume_gb
                )

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

            floating_ip_quota = project_type.floating_ips

            available_ips = FloatingIPPool.objects.filter(
                status=IPStatus.AVAILABLE
            ).order_by('created_at')[:floating_ip_quota]

            if available_ips.count() < floating_ip_quota:
                return Response({
                    "error": f"Not enough available floating IPs in pool. Required: {floating_ip_quota}, Available: {available_ips.count()}"
                }, status=400)

            # Update IPs in DB
            for ip in available_ips:
                ip.project_id = os_project.id
                ip.status = IPStatus.RESERVED
                ip.save()

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


class ChangeVPSTypeView(APIView):
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

        # Input validation
        project_id = request.data.get("project_id")
        new_type_id = request.data.get("project_type_id")

        if not project_id or not new_type_id:
            return Response({"error": "Missing project_id or project_type_id."}, status=400)

        # Get project and new type
        project = get_object_or_404(Project, openstack_id=project_id)
        new_type = get_object_or_404(ProjectType, id=new_type_id)

        try:
            # Update quotas in OpenStack
            conn.set_compute_quotas(
                project.openstack_id,
                instances=new_type.instances,
                cores=new_type.vcpus,
                ram=new_type.ram,
                key_pairs=new_type.key_pairs,
                server_groups=new_type.server_groups,
                server_group_members=new_type.server_group_members,
                metadata_items=new_type.metadata_items,
                injected_files=new_type.injected_files,
                injected_file_content_bytes=new_type.injected_file_content_bytes
            )

            conn.set_network_quotas(
                project.openstack_id,
                floatingip=new_type.floating_ips,
                network=new_type.networks,
                port=new_type.ports,
                router=new_type.routers,
                security_group=new_type.security_groups,
                security_group_rule=new_type.security_group_rules,
                subnet=new_type.subnets
            )

            conn.set_volume_quotas(
                project.openstack_id,
                volumes=new_type.volumes,
                snapshots=new_type.volume_snapshots,
                gigabytes=new_type.total_volume_gb
            )

            # Update in local DB
            project.type = new_type
            project.save()

            return Response({
                "message": "VPS type updated successfully.",
                "project_id": project.id,
                "new_type": {
                    "id": new_type.id,
                    "name": new_type.name
                }
            }, status=200)

        except SDKException as e:
            return Response({"error": f"Failed to apply new quotas: {str(e)}"}, status=500)

        except Exception as ex:
            return Response({"error": str(ex)}, status=500)




class ClientChangeVPSTypeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"

        token_bytes = redis_client.get(token_key)
        if not token_bytes:
            return Response({"error": "Token not found in Redis."}, status=401)

        token = token_bytes
        conn = connect_with_token_v5(token, project_id)

        # Input validation
        project_id = request.data.get("project_id")
        new_type_id = request.data.get("project_type_id")

        if not project_id :
            return Response({"error": "Missing project_id ."}, status=400)
        if not new_type_id:
            return Response({"error": "Missing project_type_id."}, status=400)
        project = get_object_or_404(Project, openstack_id=project_id)
        new_type = get_object_or_404(ProjectType, id=new_type_id)

        try:
            # Update quotas in OpenStack
            conn.set_compute_quotas(
                project.openstack_id,
                instances=new_type.instances,
                cores=new_type.vcpus,
                ram=new_type.ram,
                key_pairs=new_type.key_pairs,
                server_groups=new_type.server_groups,
                server_group_members=new_type.server_group_members,
                metadata_items=new_type.metadata_items,
                injected_files=new_type.injected_files,
                injected_file_content_bytes=new_type.injected_file_content_bytes
            )

            conn.set_network_quotas(
                project.openstack_id,
                floatingip=new_type.floating_ips,
                network=new_type.networks,
                port=new_type.ports,
                router=new_type.routers,
                security_group=new_type.security_groups,
                security_group_rule=new_type.security_group_rules,
                subnet=new_type.subnets
            )

            conn.set_volume_quotas(
                project.openstack_id,
                volumes=new_type.volumes,
                snapshots=new_type.volume_snapshots,
                gigabytes=new_type.total_volume_gb
            )

            # Update in local DB
            project.type = new_type
            project.save()

            return Response({
                "message": "VPS type updated successfully.",
                "project_id": project.id,
                "new_type": {
                    "id": new_type.id,
                    "name": new_type.name
                }
            }, status=200)

        except SDKException as e:
            return Response({"error": f"Failed to apply new quotas: {str(e)}"}, status=500)

        except Exception as ex:
            return Response({"error": str(ex)}, status=500)


class AssignUserToProjectView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"

        token_bytes = redis_client.get(token_key)
        if not token_bytes:
            return Response({"error": "Token not found in Redis."}, status=401)

        token = token_bytes
        serializer = AssignUserToProjectSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = serializer.validated_data["user"]
        project = serializer.validated_data["project"]

        # Save to local mapping
        mapping = ProjectUserMapping.objects.create(user=user, project=project)

        # Get OpenStack connection with admin credentials
        conn =connect_with_token_v5(token, project_id)

        try:
            # Get OpenStack user & project by ID
            openstack_user = conn.identity.find_user(user.username)
            openstack_project = conn.identity.find_project(project.openstack_id)

            if not openstack_user or not openstack_project:
                return Response({"error": "OpenStack user or project not found."}, status=404)

            # Find 'member' role
            admin_role = conn.identity.find_role("admin")
            if not admin_role:
                return Response({"error": "OpenStack role 'member' not found."}, status=404)

            # Assign role to user on project
            conn.identity.assign_project_role_to_user(
                project=openstack_project,
                user=openstack_user,
                role=admin_role
            )

        except Exception as e:
            mapping.delete()  # rollback local DB
            return Response({"error": f"OpenStack error: {str(e)}"}, status=500)

        return Response({"message": "✅ User assigned to project successfully."}, status=200)


class ReplaceProjectOwnerView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"

        token_bytes = redis_client.get(token_key)
        if not token_bytes:
            return Response({"error": "Token not found in Redis."}, status=401)

        token = token_bytes
        serializer = ReplaceProjectOwnerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        new_owner = serializer.validated_data["new_owner"]
        project = serializer.validated_data["project"]

        conn = connect_with_token_v5(token, project_id)

        try:
            # Look up OpenStack resources
            openstack_user = conn.identity.find_user(new_owner.username)
            openstack_project = conn.identity.find_project(project.openstack_id)
            if not openstack_user :
                return Response({"error": "OpenStack user not found."}, status=404)
            if not openstack_project:
                return Response({"error": "OpenStack project not found."}, status=404)
            admin_role = conn.identity.find_role("admin")
            if not admin_role:
                return Response({"error": "OpenStack role 'member' not found."}, status=404)
            # Remove current admin(s) of the project
            current_mappings = ProjectUserMapping.objects.filter(project=project, role="member")
            for mapping in current_mappings:
                current_os_user = conn.identity.find_user(mapping.user.username)
                if current_os_user:
                    try:
                        conn.identity.unassign_project_role_from_user(
                            project=openstack_project,
                            user=current_os_user,
                            role=admin_role
                        )
                    except Exception:
                        pass  # soft fail in case unassignment fails
                mapping.delete()

            # Assign admin role to new owner in OpenStack
            conn.identity.assign_project_role_to_user(
                project=openstack_project,
                user=openstack_user,
                role=admin_role
            )

            # Save new owner in local DB
            ProjectUserMapping.objects.create(user=new_owner, project=project, role="owner")

        except Exception as e:
            return Response({"error": f"OpenStack error: {str(e)}"}, status=500)

        return Response({"message": "✅ Project owner replaced successfully."}, status=200)






class AdminProjectDetailView(APIView):
    permission_classes = [IsAdmin]

    @staticmethod
    def safe_quota_get(quota, key):
        val = quota.get(key)
        return (val.get("in_use", 0), val.get("limit", 0)) if isinstance(val, dict) else (0, val or 0)

    @staticmethod
    def get_token_from_redis(username, project_id):
        token_key = f"keystone_token:{username}:{project_id}"
        return redis_client.get(token_key)

    @staticmethod
    def get_compute_quota(openstack_id, atoken):
        url = f"{settings.OPENSTACK_COMPUTE_URL}/os-quota-sets/{openstack_id}?usage=True"
        response = requests.get(url, headers={"X-Auth-Token": atoken})
        response.raise_for_status()
        return response.json().get("quota_set", {})

    @staticmethod
    def get_storage_quota(openstack_id, atoken):
        url = f"{settings.OPENSTACK_BLOCK_STORAGE_URL}/os-quota-sets/{openstack_id}?usage=True"
        response = requests.get(url, headers={"X-Auth-Token": atoken})
        response.raise_for_status()
        return response.json().get("quota_set", {})

    def extract_vm_info(self, servers, project_id, flavor_map):
        vms = []
        cpu_used, ram_used = 0, 0

        for server in servers:
            if getattr(server, "project_id", None) != project_id:
                continue

            flavor_id_raw = str(server.flavor.get("id"))
            flavor = flavor_map.get(flavor_id_raw)
            if flavor:
                cpu_used += flavor.vcpus
                ram_used += flavor.ram

            # Extract IP
            ip = ""
            for net in server.get("addresses", {}).values():
                if isinstance(net, list) and net:
                    ip = next(
                        (a["addr"] for a in net if a.get("OS-EXT-IPS:type") == "floating" and a.get("version") == 4),
                        next((a["addr"] for a in net if a.get("version") == 4), net[0].get("addr", ""))
                    )
                    break

            vms.append({
                "id": server.id,
                "name": server.name,
                "status": server.status,
                "ip": ip,
                "created": server.created_at[:10] if server.created_at else "",
                "flavor": {
                    "id": str(flavor.id) if flavor else flavor_id_raw,
                    "name": flavor.name if flavor else "Unknown",
                    "vcpus": flavor.vcpus if flavor else 0,
                    "ram": flavor.ram if flavor else 0,
                    "disk": flavor.disk if flavor else 0,
                }
            })

        return vms, cpu_used, ram_used

    def get(self, request, openstack_id):
        # Step 1: Get DB Project
        project = get_object_or_404(Project, openstack_id=openstack_id)
        project_id = request.auth.get("project_id")

        owner_mapping = ProjectUserMapping.objects.filter(project=project, is_active=True).first()
        owner = owner_mapping.user if owner_mapping else None

        # Step 2: Redis token
        token = self.get_token_from_redis(request.user.username, project_id)
        if not token:
            return Response({"error": "Token not found in Redis."}, status=401)

        try:
            # Step 3: Connect to OpenStack
            conn = connect_with_token_v5(token, project_id)
            atoken = get_admin_token()

            # Step 4: Fetch compute/storage quota concurrently
            with ThreadPoolExecutor(max_workers=2) as executor:
                compute_future = executor.submit(self.get_compute_quota, openstack_id, atoken)
                storage_future = executor.submit(self.get_storage_quota, openstack_id, atoken)
                nova_quota = compute_future.result()
                cinder_quota = storage_future.result()

            _, cpu_limit = self.safe_quota_get(nova_quota, "cores")
            _, ram_limit = self.safe_quota_get(nova_quota, "ram")
            storage_used, storage_limit = self.safe_quota_get(cinder_quota, "gigabytes")

            # Step 5: Fetch flavor list once
            flavors = conn.list_flavors()
            flavor_map = {str(f.id): f for f in flavors}
            flavor_map.update({str(f.name): f for f in flavors})

            # Step 6: Fetch servers
            servers = conn.list_servers()
            vms, cpu_used, ram_used = self.extract_vm_info(servers, project.openstack_id, flavor_map)

            # Step 7: Compile response
            return Response({
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "status": "Active",
                "created_at": project.created_at.isoformat(),
                "owner": {
                    "name": owner.username if owner else "—",
                    "email": owner.email if owner else "—",
                },
                "usage": {
                    "vcpus_used": cpu_used,
                    "vcpus_total": cpu_limit,
                    "ram_used": ram_used,
                    "ram_total": ram_limit,
                    "storage_used": storage_used,
                    "storage_total": storage_limit,
                },
                "vms": vms,
                "product_type": {
                    "id": project.type.id,
                    "name": project.type.name,
                    "price_per_month": project.type.price_per_month,
                    "description": project.type.description,
                    "vcpus": project.type.vcpus,
                    "ram": project.type.ram,
                    "total_volume_gb": project.type.total_volume_gb,
                    "floating_ips": project.type.floating_ips,
                    "instances": project.type.instances,
                } if project.type else None
            })

        except requests.HTTPError as http_err:
            return Response({"error": f"Quota fetch failed: {str(http_err)}"}, status=502)
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=500)

class AdminProjectBasicInfoView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, openstack_id):
        project = get_object_or_404(Project, openstack_id=openstack_id)
        owner_mapping = ProjectUserMapping.objects.filter(project=project, is_active=True).first()
        owner = owner_mapping.user if owner_mapping else None

        return Response({
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "status": "Active",
            "created_at": project.created_at.isoformat(),
            "owner": {
                "name": owner.username if owner else "—",
                "email": owner.email if owner else "—",
            },
            "product_type": {
                "id": project.type.id,
                "name": project.type.name,
                "price_per_month": project.type.price_per_month,
                "description": project.type.description,
                "vcpus": project.type.vcpus,
                "ram": project.type.ram,
                "total_volume_gb": project.type.total_volume_gb,
                "floating_ips": project.type.floating_ips,
                "instances": project.type.instances,
            } if project.type else None
        })

class AdminProjectQuotaView(APIView):
    permission_classes = [IsAdmin]

    @staticmethod
    def safe_quota_get(quota, key):
        val = quota.get(key)
        return (val.get("in_use", 0), val.get("limit", 0)) if isinstance(val, dict) else (0, val or 0)

    def get(self, request, openstack_id):
        project_id = request.auth.get("project_id")
        token = AdminProjectDetailView.get_token_from_redis(request.user.username, project_id)
        if not token:
            return Response({"error": "Token not found in Redis."}, status=401)

        try:
            atoken = get_admin_token()

            with ThreadPoolExecutor(max_workers=2) as executor:
                compute_future = executor.submit(AdminProjectDetailView.get_compute_quota, openstack_id, atoken)
                storage_future = executor.submit(AdminProjectDetailView.get_storage_quota, openstack_id, atoken)
                nova_quota = compute_future.result()
                cinder_quota = storage_future.result()

            cores_used, cores_total = self.safe_quota_get(nova_quota, "cores")
            ram_used, ram_total = self.safe_quota_get(nova_quota, "ram")
            storage_used, storage_total = self.safe_quota_get(cinder_quota, "gigabytes")

            return Response({
                "vcpus_used": cores_used,
                "vcpus_total": cores_total,
                "ram_used": ram_used,
                "ram_total": ram_total,
                "storage_used": storage_used,
                "storage_total": storage_total,
            })

        except requests.HTTPError as http_err:
            return Response({"error": f"Quota fetch failed: {str(http_err)}"}, status=502)
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=500)


class AdminProjectVMsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, openstack_id):
        project = get_object_or_404(Project, openstack_id=openstack_id)
        project_id = request.auth.get("project_id")

        token = AdminProjectDetailView.get_token_from_redis(request.user.username, project_id)
        if not token:
            return Response({"error": "Token not found in Redis."}, status=401)

        try:
            conn = connect_with_token_v5(token, project_id)
            flavors = conn.list_flavors()
            flavor_map = {str(f.id): f for f in flavors}
            flavor_map.update({str(f.name): f for f in flavors})

            servers = conn.list_servers(
                all_projects=True,
                filters={'project_id': project.openstack_id}
            )

            vms, cpu_used, ram_used = AdminProjectDetailView().extract_vm_info(servers, project.openstack_id, flavor_map)

            return Response({
                "cpu_used": cpu_used,
                "ram_used": ram_used,
                "vms": vms
            })

        except Exception as e:
            return Response({"error": f"Failed to retrieve VM data: {str(e)}"}, status=500)
class ChangeOwnerProjectView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"

        token_bytes = redis_client.get(token_key)
        if not token_bytes:
            return Response({"error": "Token not found in Redis."}, status=401)

        token = token_bytes
        serializer = AssignUserToProjectSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = serializer.validated_data["user"]
        project = serializer.validated_data["project"]

        # Save to local mapping
        mapping = ProjectUserMapping.objects.create(user=user, project=project)

        # Get OpenStack connection with admin credentials
        conn =connect_with_token_v5(token, project_id)

        try:
            # Get OpenStack user & project by ID
            openstack_user = conn.identity.find_user(user.username)
            openstack_project = conn.identity.find_project(project.openstack_id)

            if not openstack_user or not openstack_project:
                return Response({"error": "OpenStack user or project not found."}, status=404)

            # Find 'member' role
            member_role = conn.identity.find_role("member")
            if not member_role:
                return Response({"error": "OpenStack role 'member' not found."}, status=404)

            # Assign role to user on project
            conn.identity.assign_project_role_to_user(
                project=openstack_project,
                user=openstack_user,
                role=member_role
            )

        except Exception as e:
            mapping.delete()  # rollback local DB
            return Response({"error": f"OpenStack error: {str(e)}"}, status=500)

        return Response({"message": "✅ User assigned to project successfully."}, status=200)



class PackageManagementView(APIView):
    permission_classes = [IsAuthenticated]
    # def post(self, request):



class UserProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get all project-user mappings for this user
        mappings = ProjectUserMapping.objects.select_related("project", "project__type").filter(user=user)

        # Extract project objects
        projects = [mapping.project for mapping in mappings]

        # Serialize the projects
        serializer = ProjectSerializer(projects, many=True)

        return Response(serializer.data)


from .tasks import sync_floating_ips_task
class SyncFloatingIPsView(APIView):
    permission_classes = [IsAdmin]
    def post(self, request, *args, **kwargs):
        sync_floating_ips_task.delay()
        return Response({"detail": "Sync task has been started."})



class FloatingIPAListView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request, project_id):
        # Optionally restrict to staff only
        try:
            floating_ips = FloatingIPPool.objects.filter(project_id=project_id)

            data = [
                {
                    "ip_address": ip.ip_address,
                    "subnet_id": ip.subnet_id,
                    "network_id": ip.network_id,
                    "vm_id": ip.vm_id,
                    "vm_name":ip.vm_name,
                    "status": ip.status,
                    "note": ip.note,
                    "created_at": ip.created_at,
                    "updated_at": ip.updated_at,
                }
                for ip in floating_ips
            ]

            return Response(data, status=200)

        except Exception as e:
            return Response({"detail": f"Failed to retrieve floating IPs: {str(e)}"}, status=500)


class AvailableFloatingIPListView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        try:
            floating_ips = FloatingIPPool.objects.filter(status="available")

            data = [
                {
                    "ip_address": ip.ip_address,
                    "subnet_id": ip.subnet_id,
                    "network_id": ip.network_id,
                    "note": ip.note,
                }
                for ip in floating_ips
            ]

            return Response(data, status=200)

        except Exception as e:
            return Response({"detail": f"Failed to retrieve floating IPs: {str(e)}"}, status=500)


class AssignFloatingIPView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, project_id):

        ip_address = request.data.get("ip_address")

        if not ip_address:
            return Response({"detail": "Missing 'ip_address' in request body."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ip_obj = get_object_or_404(FloatingIPPool, ip_address=ip_address)

            if ip_obj.status == IPStatus.ALLOCATED:
                return Response({"detail": f"IP {ip_address} is already allocated to another project."}, status=400)

            # Assign IP to project only (no VM)
            ip_obj.project_id = project_id
            ip_obj.vm_id = None  # Ensure VM is unset
            ip_obj.status = IPStatus.RESERVED
            ip_obj.save()

            return Response(
                {"detail": f"Floating IP {ip_address} successfully assigned to project {project_id}."},
                status=200
            )

        except Exception as e:
            return Response({"detail": f"Error assigning floating IP: {str(e)}"}, status=500)