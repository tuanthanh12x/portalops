import redis
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from utils.conn import connect_with_token_v5

from project.models import FloatingIPPool

redis_client = redis.Redis(host='redis', port=6379, db=0)


class PortListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, network_id):
        username = request.user.username
        project_id = request.auth.get('project_id')

        token_key = f"keystone_token:{username}:{project_id}"
        token_bytes = redis_client.get(token_key)

        if not token_bytes:
            return Response({"detail": "Token not found in Redis."}, status=401)

        try:
            token = token_bytes.decode()
            conn = connect_with_token_v5(token, project_id)

            ports = []
            for port in conn.network.ports(network_id=network_id):
                port_name = port.name or f"Port-{port.id[:8]}"
                ip_addresses = [ip['ip_address'] for ip in port.fixed_ips]

                ports.append({
                    "id": port.id,
                    "name": port_name,
                    "network_id": port.network_id,
                    "ip_addresses": ip_addresses,
                    "status": port.status,
                    "device_owner": port.device_owner,
                    "device_id": port.device_id,
                })

            return Response(ports)

        except Exception as e:
            return Response(
                {"detail": f"Failed to fetch ports: {str(e)}"},
                status=500
            )

class FloatingIPListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        project_id = request.auth.get("project_id")

        if not project_id:
            return Response({"detail": "Missing project_id in token."}, status=400)

        try:
            # Filter IPs belonging to this project
            floating_ips = FloatingIPPool.objects.filter(project_id=project_id)

            data = [
                {
                    "ip_address": ip.ip_address,
                    "subnet_id": ip.subnet_id,
                    "network_id": ip.network_id,
                    "vm_id": ip.vm_id,
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

class AttachFloatingIPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"
        token_bytes = redis_client.get(token_key)

        if not token_bytes:
            return Response({"detail": "Token not found in Redis."}, status=401)

        try:
            token = token_bytes.decode()
            conn = connect_with_token_v5(token, project_id)

            server_id = request.data.get("server_id")
            floating_ip = request.data.get("floating_ip")  # optional

            if not server_id:
                return Response({"detail": "server_id is required."}, status=400)

            server = conn.compute.get_server(server_id)
            if not server:
                return Response({"detail": "Server not found."}, status=404)

            # Find the first port attached to the server
            server_ports = list(conn.network.ports(device_id=server_id))
            if not server_ports:
                return Response({"detail": "No ports found for this server."}, status=404)

            port = server_ports[0]

            # Step 1: Use existing or allocate new floating IP
            if floating_ip:
                fip = conn.network.find_ip(floating_ip)
                if not fip:
                    return Response({"detail": "Floating IP not found."}, status=404)
            else:
                # Allocate new from first available external network
                ext_net = next((net for net in conn.network.networks() if net.is_router_external), None)
                if not ext_net:
                    return Response({"detail": "No external network found to allocate a floating IP."}, status=500)
                fip = conn.network.create_ip(floating_network_id=ext_net.id)

            # Step 2: Associate floating IP with the port
            conn.network.update_ip(fip, port_id=port.id, fixed_ip_address=port.fixed_ips[0]["ip_address"])

            return Response({
                "message": "Floating IP associated successfully.",
                "floating_ip": fip.floating_ip_address,
                "port_id": port.id,
                "server_id": server.id,
            })

        except Exception as e:
            return Response({"detail": f"Failed to associate floating IP: {str(e)}"}, status=500)


class NetworkListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"
        token_bytes = redis_client.get(token_key)

        if not token_bytes:
            return Response({"detail": "Token not found in Redis."}, status=401)
        token = token_bytes.decode()
        conn = connect_with_token_v5(token, project_id)

        networks = []
        try:
            for net in conn.network.networks():
                count_subnet =len(net.subnet_ids)
                networks.append({
                    "id": net.id,
                    "name": net.name,
                    "status": net.status,
                    "shared": net.is_shared,
                    "admin_state_up": net.is_admin_state_up,
                    "subnets": count_subnet,
                    "router_external": net.is_router_external,
                    "tenant_id": net.project_id,
                })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        return Response(networks)


class CreateNetworkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"
        token_bytes = redis_client.get(token_key)

        if not token_bytes:
            return Response({"detail": "Token not found in Redis."}, status=401)

        token = token_bytes.decode()
        conn = connect_with_token_v5(token, project_id)

        # Extract form data
        name = request.data.get("name")
        cidr = request.data.get("cidr")
        gateway_ip = request.data.get("gateway_ip")
        enable_dhcp = request.data.get("enable_dhcp", True)

        if not name or not cidr or not gateway_ip:
            return Response({"error": "Missing required fields."}, status=400)

        try:
            # Step 1: Create the network
            network = conn.network.create_network(
                name=name,
                admin_state_up=True,
                shared=False,
                project_id=project_id
            )

            # Step 2: Create the subnet under that network
            subnet = conn.network.create_subnet(
                name=f"{name}-subnet",
                network_id=network.id,
                ip_version=4,
                cidr=cidr,
                gateway_ip=gateway_ip,
                enable_dhcp=enable_dhcp,
                project_id=project_id,
            )

            return Response({
                "network": {
                    "id": network.id,
                    "name": network.name,
                    "status": network.status,
                    "shared": network.is_shared,
                    "admin_state_up": network.is_admin_state_up,
                    "subnets": [subnet.id],
                    "tenant_id": network.project_id,
                },
                "subnet": {
                    "id": subnet.id,
                    "name": subnet.name,
                    "cidr": subnet.cidr,
                    "gateway_ip": subnet.gateway_ip,
                    "enable_dhcp": subnet.enable_dhcp
                }
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class SubnetListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"
        token_bytes = redis_client.get(token_key)

        if not token_bytes:
            return Response({"detail": "Token not found in Redis."}, status=401)

        token = token_bytes.decode()
        conn = connect_with_token_v5(token, project_id)

        subnets = []
        try:
            for subnet in conn.network.subnets():
                subnet_data = subnet.to_dict()
                subnets.append({
                    "id": subnet.id,
                    "name": subnet.name,
                    "cidr": subnet.cidr,
                    "ip_version": subnet.ip_version,
                    "gateway_ip": subnet.gateway_ip,
                    "enable_dhcp": subnet_data.get("enable_dhcp", False),
                    "network_id": subnet.network_id,
                    "project_id": subnet.project_id,
                    "allocation_pools": subnet.allocation_pools,
                    "dns_nameservers": subnet.dns_nameservers,
                    "host_routes": subnet.host_routes,
                })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        return Response(subnets)


class AssignOrReplaceFloatingIPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"
        token_bytes = redis_client.get(token_key)

        if not token_bytes:
            return Response({"detail": "Token not found in Redis."}, status=401)

        ip_id = request.data.get("ip_id")
        vm_id = request.data.get("vm_id")

        if not ip_id or not vm_id:
            return Response({"detail": "Both 'ip_id' and 'vm_id' are required."}, status=400)

        try:
            token = token_bytes.decode()
            conn = connect_with_token_v5(token, project_id)

            # Get the new IP to assign (from DB)
            new_ip = FloatingIPPool.objects.get(ip_address=ip_id, status="reserved")

            # Detach any existing IP
            existing_ip = FloatingIPPool.objects.filter(vm_id=vm_id).first()
            if existing_ip:
                os_old_fip = conn.network.find_ip(existing_ip.ip_address)
                if os_old_fip:
                    conn.compute.remove_floating_ip_from_server(
                        server=vm_id,
                        address=os_old_fip.floating_ip_address
                    )

                existing_ip.vm_id = None
                existing_ip.status = "available"
                existing_ip.project_id = None
                existing_ip.save()

            # Ensure new IP exists in OpenStack
            os_new_fip = conn.network.find_ip(new_ip.ip_address)
            if not os_new_fip:
                # Create floating IP in OpenStack using the known address
                external_net = conn.network.find_network("public")  # ⚠️ change to your network name
                if not external_net:
                    return Response({"detail": "External network not found."}, status=404)

                os_new_fip = conn.network.create_ip(
                    floating_ip_address=new_ip.ip_address,
                    floating_network_id=external_net.id
                )

            # Attach the floating IP to the VM
            conn.compute.add_floating_ip_to_server(
                server=vm_id,
                address=os_new_fip.floating_ip_address
            )

            # Update DB
            new_ip.vm_id = vm_id
            new_ip.status = "allocated"
            new_ip.project_id = project_id
            new_ip.save()

            return Response({
                "detail": "Floating IP assigned successfully.",
                "ip_address": new_ip.ip_address,
                "ip_id": new_ip.id
            }, status=200)

        except FloatingIPPool.DoesNotExist:
            return Response({"detail": "Floating IP not found or not available."}, status=404)
        except Exception as e:
            return Response({"detail": f"Unexpected error: {str(e)}"}, status=500)