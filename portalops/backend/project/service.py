from utils.conn import get_admin_connection
from ipaddress import ip_address

from .models import IPStatus, FloatingIPPool


def sync_floating_ips():


    conn = get_admin_connection()

    floating_ips = {
        fip.floating_ip_address: fip
        for fip in conn.network.ips()
    }

    external_nets = [
        net for net in conn.network.networks()
        if net.is_router_external
    ]

    for net in external_nets:
        subnets = conn.network.subnets(network_id=net.id)
        for subnet in subnets:
            for pool in subnet.allocation_pools:
                start_ip = ip_address(pool['start'])
                end_ip = ip_address(pool['end'])

                current_ip = start_ip
                while current_ip <= end_ip:
                    ip_str = str(current_ip)
                    fip_data = floating_ips.get(ip_str)

                    if fip_data:
                        status = IPStatus.ALLOCATED if fip_data.port_id else IPStatus.AVAILABLE
                        project_id = fip_data.project_id
                        vm_id = fip_data.port_id
                    else:
                        status = IPStatus.AVAILABLE
                        project_id = None
                        vm_id = None

                    FloatingIPPool.objects.update_or_create(
                        ip_address=ip_str,
                        defaults={
                            "subnet_id": subnet.id,
                            "network_id": net.id,
                            "project_id": project_id,
                            "vm_id": vm_id,
                            "status": status,
                        }
                    )
                    current_ip += 1