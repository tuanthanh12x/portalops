from celery import shared_task
import requests
import json
from django.conf import settings
import redis

redis_client = redis.StrictRedis(host='redis', port=6379, db=0, decode_responses=True)

@shared_task
def fetch_and_cache_instance_options(username, token, project_id):
    headers = {"X-Auth-Token": token}

    nova_url = "http://172.93.187.251/compute/v2.1"
    glance_url = "http://172.93.187.251/image/v2"
    neutron_url = f"http://172.93.187.251/networking/v2.0"

    # 1. Regions
    try:
        az_res = requests.get(f"{nova_url}/os-availability-zone", headers=headers)
        az_res.raise_for_status()
        az_data = az_res.json()
        regions = [
            az["zoneName"] for az in az_data.get("availabilityZoneInfo", [])
            if az.get("zoneState", {}).get("available", False)
        ]
    except Exception:
        regions = []

    # 2. Images
    try:
        img_res = requests.get(f"{glance_url}/images", headers=headers)
        img_res.raise_for_status()
        img_list = img_res.json().get("images", [])
    except Exception:
        img_list = []

    images = {
        "distribution": [],
        "marketplace": [],
        "my_images": [],
        "iso": []
    }

    for img in img_list:
        name = img.get("name", "").lower()
        entry = {"id": img.get("id"), "name": img.get("name")}

        if "ubuntu" in name or "centos" in name:
            images["distribution"].append(entry)
        elif "win" in name or "market" in name:
            images["marketplace"].append(entry)
        elif "iso" in name or img.get("disk_format") == "iso":
            images["iso"].append(entry)
        elif img.get("owner") == project_id:
            images["my_images"].append(entry)

    # 3. Flavors
    try:
        flavor_res = requests.get(f"{nova_url}/flavors/detail", headers=headers)
        flavor_res.raise_for_status()
        flavor_list = flavor_res.json().get("flavors", [])
    except Exception:
        flavor_list = []

    plans = []
    for flavor in flavor_list:
        plans.append({
            "id": flavor.get("id"),
            "label": f"{flavor.get('name')} - {flavor.get('vcpus')} CPU, {flavor.get('ram')}MB RAM, {flavor.get('disk')}GB SSD"
        })

    # 4. Networks
    try:
        net_res = requests.get(f"{neutron_url}/networks", headers=headers)
        net_res.raise_for_status()
        networks_data = net_res.json().get("networks", [])
        networks = [{"id": net.get("id"), "name": net.get("name")} for net in networks_data]
    except Exception:
        networks = []

    data_to_cache = {
        "regions": regions,
        "plans": plans,
        "images": images,
        "networks": networks,
    }

    redis_key = f"instance_options:{username}"
    redis_client.set(redis_key, json.dumps(data_to_cache), ex=3600)  # Lưu cache 1 giờ

    return data_to_cache
