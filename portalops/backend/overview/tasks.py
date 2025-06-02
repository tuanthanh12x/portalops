from celery import shared_task
import requests
import redis
import os

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

NOVA_URL = "http://172.93.187.251/compute/v2.1"

@shared_task
def cache_user_instances(username, token, project_id):
    redis_key = f"instances_cache:{username}:{project_id}"
    headers = {"X-Auth-Token": token}
    url = f"{NOVA_URL}/servers/detail"

    try:
        r = requests.get(url, headers=headers)
        r.raise_for_status()
        data = r.json()
    except requests.RequestException:
        return None

    servers = data.get("servers", [])
    result = []

    for s in servers:
        ip = ""
        for net in s.get("addresses", {}).values():
            if isinstance(net, list) and net:
                ip = next(
                    (addr["addr"] for addr in net if addr.get("version") == 4),
                    net[0].get("addr", "") if net else ""
                )
                break

        flavor_id = s.get("flavor", {}).get("id")
        plan = "Unknown"

        if flavor_id:
            flavor_url = f"{NOVA_URL}/flavors/{flavor_id}"
            try:
                flavor_res = requests.get(flavor_url, headers=headers)
                flavor_res.raise_for_status()
                flavor_info = flavor_res.json().get("flavor", {})
                vcpus = flavor_info.get("vcpus")
                ram = flavor_info.get("ram")  # MB
                disk = flavor_info.get("disk")  # GB
                name = flavor_info.get("name", "Unnamed Plan")
                plan = f"{name} ({vcpus} vCPU / {ram}MB / {disk}GB)"
            except Exception:
                plan = "Unknown"

        instance = {
            "id": s.get("id"),
            "name": s.get("name"),
            "status": "Online" if s.get("status") == "ACTIVE" else "Offline",
            "ip": ip,
            "plan": plan,
            "region": s.get("OS-EXT-AZ:availability_zone", ""),
            "created": s.get("created", "")[:10]
        }
        result.append(instance)

    redis_client.set(redis_key, str(result), ex=30)  # lưu cache 5 phút
    return result
