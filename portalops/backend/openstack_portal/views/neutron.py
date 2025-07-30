import redis
import requests
from django.conf import settings
from openstack.exceptions import ResourceNotFound
from rest_framework.parsers import JSONParser
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
            floating_ips = FloatingIPPool.objects.filter(project_id=project_id)

            data = [
                {
                    "ip_address": ip.ip_address,
                    "vm_name": ip.vm_name,
                    "status": ip.status,
                    "note": ip.note,
                    "created_at": ip.created_at,
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
                # Optional: verify no conflict exists with this IP
                try:
                    ip_list = list(conn.network.ips(floating_ip_address=new_ip.ip_address))
                    if ip_list:
                        return Response({"detail": f"Conflict: IP {new_ip.ip_address} already exists in OpenStack."},
                                        status=409)
                except Exception as lookup_err:
                    return Response({"detail": f"Error checking existing IPs: {str(lookup_err)}"}, status=500)

                # Create the IP in OpenStack
                external_net = conn.network.find_network("public")  # 🔁 Replace with your actual external network name
                if not external_net:
                    return Response({"detail": "External network not found."}, status=404)

                try:
                    os_new_fip = conn.network.create_ip(
                        floating_ip_address=new_ip.ip_address,
                        floating_network_id=external_net.id
                    )
                except Exception as create_err:
                    return Response({"detail": f"Failed to create IP in OpenStack: {str(create_err)}"}, status=500)

            server = conn.compute.get_server(vm_id)
            if not server:
                return Response({"detail": "VM not found in current project."}, status=404)
            # Attach the floating IP to the VM
            action_url = f"/servers/{vm_id}/action"
            payload = {
                "addFloatingIp": {
                    "address": os_new_fip.floating_ip_address
                }
            }
            conn.compute.post(action_url, json=payload)

            # Update DB
            new_ip.vm_id = vm_id
            new_ip.vm_name = server.name
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

class AddingFloatingIPView(APIView):
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

            # Lấy IP từ DB
            new_ip = FloatingIPPool.objects.get(ip_address=ip_id, status="reserved")

            # Kiểm tra IP đã tồn tại trên OpenStack chưa
            os_new_fip = conn.network.find_ip(new_ip.ip_address)
            if not os_new_fip:
                # Đảm bảo không bị trùng lặp
                ip_list = list(conn.network.ips(floating_ip_address=new_ip.ip_address))
                if ip_list:
                    return Response({
                        "detail": f"Conflict: IP {new_ip.ip_address} already exists in OpenStack."
                    }, status=409)

                external_net = conn.network.find_network("public")
                if not external_net:
                    return Response({"detail": "External network not found."}, status=404)

                os_new_fip = conn.network.create_ip(
                    floating_ip_address=new_ip.ip_address,
                    floating_network_id=external_net.id
                )

            server = conn.compute.get_server(vm_id)
            if not server:
                return Response({"detail": "VM not found."}, status=404)

            # ✅ Tìm fixed IP của VM chưa gán floating IP
            available_fixed_ip = None
            ports = list(conn.network.ports(device_id=vm_id))

            for port in ports:
                has_floating = list(conn.network.ips(port_id=port.id))
                if has_floating:
                    continue
                for fixed in port.fixed_ips:
                    ip = fixed.get("ip_address")
                    if ip:
                        available_fixed_ip = ip
                        break
                if available_fixed_ip:
                    break

            # ❗ Nếu không có fixed IP trống → tạo port mới và attach
            if not available_fixed_ip:
                internal_net = conn.network.find_network("private")
                if not internal_net:
                    return Response({"detail": "Internal network not found."}, status=404)

                new_port = conn.network.create_port(
                    network_id=internal_net.id,
                    name=f"{vm_id}-auto-port"
                )
                conn.compute.create_server_interface(vm_id, port_id=new_port.id)

                # Lấy lại port để đảm bảo fixed IP được cập nhật
                attached_port = conn.network.get_port(new_port.id)
                if not attached_port.fixed_ips:
                    return Response({"detail": "New port has no fixed IP assigned."}, status=500)

                available_fixed_ip = attached_port.fixed_ips[0]["ip_address"]

            # Gán floating IP vào fixed IP
            action_url = f"/servers/{vm_id}/action"
            payload = {
                "addFloatingIp": {
                    "address": os_new_fip.floating_ip_address,
                    "fixed_address": available_fixed_ip
                }
            }
            conn.compute.post(action_url, json=payload)

            # Cập nhật DB
            new_ip.vm_id = vm_id
            new_ip.vm_name = server.name
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


class RemovingFloatingIPView(APIView):
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

            # Tìm IP trong DB
            try:
                ip_record = FloatingIPPool.objects.get(ip_address=ip_id, vm_id=vm_id)
            except FloatingIPPool.DoesNotExist:
                return Response({"detail": "Floating IP not associated with this VM."}, status=404)

            # Tìm Floating IP trong OpenStack
            os_fip = conn.network.find_ip(ip_id)
            if not os_fip:
                return Response({"detail": "Floating IP not found in OpenStack."}, status=404)

            # Gỡ IP khỏi VM
            try:
                conn.compute.remove_floating_ip_from_server(
                    server=vm_id,
                    address=os_fip.floating_ip_address
                )
            except Exception as detach_err:
                return Response({"detail": f"Error detaching floating IP: {str(detach_err)}"}, status=500)

            # Cập nhật DB
            ip_record.vm_id = None
            ip_record.vm_name = None
            ip_record.status = "reserved"
            ip_record.project_id = project_id
            ip_record.save()

            return Response({
                "detail": "Floating IP successfully detached from VPS.",
                "ip_address": ip_id
            }, status=200)

        except Exception as e:
            return Response({"detail": f"Unexpected error: {str(e)}"}, status=500)


class CreateNetworkAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        username = request.auth.get("username")
        project_id = request.auth.get("project_id")

        # Lấy token từ Redis
        redis_key = f"keystone_token:{username}:{project_id}"
        token = redis_client.get(redis_key)
        if not token:
            return Response({"error": "Token expired or missing"}, status=401)

        # Lấy dữ liệu từ request
        name = request.data.get("name")
        is_shared = request.data.get("shared", False)
        is_external = request.data.get("router:external", False)
        admin_state_up = request.data.get("admin_state_up", True)

        if not name:
            return Response({"error": "Network name is required"}, status=400)

        network_url = f"{settings.OPENSTACK_NETWORK_URL}/v2.0/networks"
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        payload = {
            "network": {
                "name": name,
                "admin_state_up": admin_state_up,
                "shared": is_shared,
                "router:external": is_external,
                "tenant_id": project_id  # or "project_id"
            }
        }

        try:
            response = requests.post(network_url, json=payload, headers=headers)
            if response.status_code not in [200, 201]:
                return Response(response.json(), status=response.status_code)

            return Response(response.json(), status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class ListAllIPView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"
        token_bytes = redis_client.get(token_key)

        if not token_bytes:
            return Response({"detail": "Token not found in Redis."}, status=401)

        try:
            token = token_bytes.decode()
            conn = connect_with_token_v5(token, project_id)

            # 1. Get all floating IPs
            floating_ips = []
            for fip in conn.network.ips(project_id=project_id):
                if fip.floating_ip_address:
                    floating_ips.append({
                        "ip": fip.floating_ip_address,
                        "fixed_ip": fip.fixed_ip_address,
                        "port_id": fip.port_id,
                        "status": fip.status,
                        "type": "floating",
                        "version": "IPv6" if ":" in fip.floating_ip_address else "IPv4"
                    })

            # 2. Get all fixed IPs from ports
            fixed_ips = []
            ports = conn.network.ports(device_owner="compute:nova", project_id=project_id)
            for port in ports:
                for fixed in port.fixed_ips:
                    ip = fixed.get("ip_address")
                    fixed_ips.append({
                        "ip": ip,
                        "port_id": port.id,
                        "device_id": port.device_id,
                        "type": "fixed",
                        "version": "IPv6" if ":" in ip else "IPv4"
                    })

            return Response({
                "floating_ips": floating_ips,
                "fixed_ips": fixed_ips
            }, status=200)

        except Exception as e:
            return Response({"detail": f"Unexpected error: {str(e)}"}, status=500)


class GetVMIPsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, vm_id):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"
        token_bytes = redis_client.get(token_key)

        if not token_bytes:
            return Response({"detail": "Token not found in Redis."}, status=401)

        try:
            token = token_bytes.decode()
            conn = connect_with_token_v5(token, project_id)

            server = conn.compute.get_server(vm_id)
            if not server:
                return Response({"detail": "VM not found."}, status=404)

            # Prepare result
            result = {
                "vm_id": vm_id,
                "vm_name": server.name,
                "ips": []
            }

            # Get floating IPs for this project
            floating_map = {}
            for fip in conn.network.ips(project_id=project_id):
                if fip.port_id:
                    floating_map[fip.port_id] = fip.floating_ip_address

            # List ports of the VM
            ports = conn.network.ports(device_id=vm_id)
            for port in ports:
                for fixed in port.fixed_ips:
                    ip_address = fixed.get("ip_address")
                    version = "IPv6" if ":" in ip_address else "IPv4"
                    floating_ip = floating_map.get(port.id)

                    result["ips"].append({
                        "fixed_ip": ip_address,
                        "version": version,
                        "floating_ip": floating_ip  # may be None
                    })

            return Response(result, status=200)

        except Exception as e:
            return Response({"detail": f"Unexpected error: {str(e)}"}, status=500)



class ChangePasswordVMView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, vm_id):
        username = request.user.username
        project_id = request.auth.get("project_id")
        token_key = f"keystone_token:{username}:{project_id}"
        token_bytes = redis_client.get(token_key)

        if not token_bytes:
            return Response({"detail": "Token not found in Redis."}, status=401)

        new_password = request.data.get("new_password")
        if not new_password:
            return Response({"detail": "Missing 'new_password' in request body."}, status=400)

        try:
            token = token_bytes.decode()
            conn = connect_with_token_v5(token, project_id)

            # Kiểm tra VM tồn tại
            server = conn.compute.get_server(vm_id)
            if not server:
                return Response({"detail": "VM not found."}, status=404)

            # Thực hiện thay đổi mật khẩu
            conn.compute.change_server_password(server=server, new_password=new_password)

            return Response({"message": "Password change requested successfully."}, status=202)

        except ResourceNotFound:
            return Response({"detail": "VM not found."}, status=404)
        except Exception as e:
            return Response({"detail": f"Unexpected error: {str(e)}"}, status=500)