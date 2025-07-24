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
    redis_key = f"instances_cache:{username}:{project_id}"
    headers = {"X-Auth-Token": token}
    compute_url = settings.OPENSTACK_COMPUTE_URL

    try:
        servers_url = f"{compute_url}/servers/detail"
        response = requests.get(servers_url, headers=headers)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException:
        return None

    servers = data.get("servers", [])
    result = []

    for server in servers:
        ip_list = []
        for net in server.get("addresses", {}).values():
            if isinstance(net, list):
                for addr in net:
                    if addr.get("version") == 4:
                        ip_list.append(addr.get("addr"))

        flavor_id = server.get("flavor", {}).get("id")
        plan = "Unknown"

        if flavor_id:
            try:
                flavor_url = f"{compute_url}/flavors/{flavor_id}"
                flavor_res = requests.get(flavor_url, headers=headers)
                flavor_res.raise_for_status()
                flavor = flavor_res.json().get("flavor", {})
                vcpus = flavor.get("vcpus")
                ram = flavor.get("ram")  # MB
                disk = flavor.get("disk")  # GB
                name = flavor.get("name", "Unnamed Plan")
                plan = f"{name} ({vcpus} vCPU / {ram}MB / {disk}GB)"
            except Exception:
                plan = "Unknown"

        instance = {
            "id": server.get("id"),
            "name": server.get("name"),
            "status": "Online" if server.get("status") == "ACTIVE" else "Offline",
            "ips": ip_list,
            "plan": plan,
            "region": server.get("OS-EXT-AZ:availability_zone", ""),
            "created": server.get("created", "")[:10]
        }
        result.append(instance)

    redis_client.set(redis_key, str(result), ex=300)  # cache for 5 minutes
    return result

