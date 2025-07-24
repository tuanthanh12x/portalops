from celery import shared_task
import requests
import redis
import os

from django.conf import settings

# Redis connection setup
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

@shared_task
def cache_user_instances(username, token, project_id):
    """
    Fetches and caches the list of OpenStack instances for a specific user/project.
    Separates floating and fixed IPs. Stores data in Redis for 5 minutes.
    """
    redis_key = f"instances_cache:{username}:{project_id}"
    headers = {"X-Auth-Token": token}
    compute_url = settings.OPENSTACK_COMPUTE_URL

    try:
        servers_url = f"{compute_url}/servers/detail"
        response = requests.get(servers_url, headers=headers)
        response.raise_for_status()
        servers = response.json().get("servers", [])
    except requests.RequestException:
        return None

    result = []

    for server in servers:
        fixed_ips = []
        floating_ips = []

        # Separate floating vs. fixed IPs
        for network in server.get("addresses", {}).values():
            if isinstance(network, list):
                for addr in network:
                    if addr.get("version") == 4:
                        if addr.get("OS-EXT-IPS:type") == "floating":
                            floating_ips.append(addr.get("addr"))
                        elif addr.get("OS-EXT-IPS:type") == "fixed":
                            fixed_ips.append(addr.get("addr"))

        # Flavor (plan) info
        flavor_id = server.get("flavor", {}).get("id")
        plan = "Unknown"

        if flavor_id:
            try:
                flavor_url = f"{compute_url}/flavors/{flavor_id}"
                flavor_res = requests.get(flavor_url, headers=headers)
                flavor_res.raise_for_status()
                flavor = flavor_res.json().get("flavor", {})
                vcpus = flavor.get("vcpus")
                ram = flavor.get("ram")
                disk = flavor.get("disk")
                name = flavor.get("name", "Unnamed Plan")
                plan = f"{name} ({vcpus} vCPU / {ram}MB / {disk}GB)"
            except requests.RequestException:
                pass

        instance = {
            "id": server.get("id"),
            "name": server.get("name"),
            "status": "Online" if server.get("status") == "ACTIVE" else "Offline",
            "fixed_ips": fixed_ips,
            "floating_ips": floating_ips,
            "plan": plan,
            "region": server.get("OS-EXT-AZ:availability_zone", ""),
            "created": server.get("created", "")[:10]
        }

        result.append(instance)

    redis_client.set(redis_key, str(result), ex=300)
    return result