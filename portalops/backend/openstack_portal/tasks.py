import json

from celery import shared_task

from utils.conn import connect_with_token
from utils.redis_client import redis_client


@shared_task
def fetch_and_cache_instance_options(username, token, project_id):
    try:
        conn = connect_with_token(token, project_id)
        if not conn:
            return {"error": "Failed to initialize OpenStack connection"}
    except Exception as e:
        return {"error": f"Connection failed: {str(e)}"}

    # 1. Regions
    try:
        az_list = conn.compute.availability_zones()
        regions = [az.name for az in az_list if az.state['available']]
    except Exception:
        regions = []

    # 2. Images
    images = {
        "distribution": [],
        "marketplace": [],
        "my_images": [],
        "iso": []
    }
    try:
        img_list = list(conn.image.images())
        for img in img_list:
            name = img.name.lower()
            entry = {"id": img.id, "name": img.name}

            if "ubuntu" in name or "centos" in name:
                images["distribution"].append(entry)
            elif "win" in name or "market" in name:
                images["marketplace"].append(entry)
            elif "iso" in name or img.disk_format == "iso":
                images["iso"].append(entry)
            elif project_id and img.owner_id == project_id:
                images["my_images"].append(entry)
    except Exception:
        pass

    # 3. Flavors
    plans = []
    try:
        for flavor in conn.compute.flavors():
            plans.append({
                "id": flavor.id,
                "label": f"{flavor.name} - {flavor.vcpus} CPU, {flavor.ram}MB RAM, {flavor.disk}GB SSD"
            })
    except Exception:
        pass

    # 4. Networks
    networks = []
    try:
        for net in conn.network.networks():
            networks.append({"id": net.id, "name": net.name})
    except Exception:
        pass

    # Final cache data
    data_to_cache = {
        "regions": regions,
        "plans": plans,
        "images": images,
        "networks": networks,
    }

    redis_key = f"instance_options:{username}:{project_id}"
    try:
        redis_client.set(redis_key, json.dumps(data_to_cache), ex=3600)
    except Exception as e:
        return {"error": f"Failed to cache instance options: {str(e)}"}

    return data_to_cache
