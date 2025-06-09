import json
import logging
from celery import shared_task
from utils.conn import connect_with_token
from utils.redis_client import redis_client

logger = logging.getLogger(__name__)

@shared_task
def fetch_and_cache_instance_options(username: str, token: str, project_id: str) -> dict:
    """
    Fetches OpenStack instance options and caches them in Redis.

    Parameters:
    - username: The username of the requester
    - token: Keystone authentication token
    - project_id: OpenStack project ID

    Returns:
    - dict containing instance options or an error message
    """
    try:
        conn = connect_with_token(token, project_id)
        if not conn:
            error_msg = "Failed to initialize OpenStack connection"
            logger.error(error_msg)
            return {"error": error_msg}
    except Exception as e:
        logger.exception("Connection failed")
        return {"error": f"Connection failed: {str(e)}"}

    # 1. Regions
    try:
        az_list = conn.compute.availability_zones()
        regions = [az.name for az in az_list if az.state.get('available', False)]
    except Exception as e:
        logger.warning(f"Failed to fetch regions: {e}")
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
            name = img.name.lower() if img.name else ""
            entry = {"id": img.id, "name": img.name}

            if "ubuntu" in name or "centos" in name:
                images["distribution"].append(entry)
            elif "win" in name or "market" in name:
                images["marketplace"].append(entry)
            elif "iso" in name or img.disk_format == "iso":
                images["iso"].append(entry)
            elif project_id and img.owner_id == project_id:
                images["my_images"].append(entry)
    except Exception as e:
        logger.warning(f"Failed to fetch images: {e}")

    # 3. Flavors (Plans)
    plans = []
    try:
        for flavor in conn.compute.flavors():
            plans.append({
                "id": flavor.id,
                "label": f"{flavor.name} - {flavor.vcpus} CPU, {flavor.ram}MB RAM, {flavor.disk}GB SSD"
            })
    except Exception as e:
        logger.warning(f"Failed to fetch flavors: {e}")

    # 4. Networks
    networks = []
    try:
        for net in conn.network.networks():
            networks.append({"id": net.id, "name": net.name})
    except Exception as e:
        logger.warning(f"Failed to fetch networks: {e}")

    data_to_cache = {
        "regions": regions,
        "plans": plans,
        "images": images,
        "networks": networks,
    }

    redis_key = f"instance_options:{username}:{project_id}"
    try:
        redis_client.set(redis_key, json.dumps(data_to_cache), ex=300)
    except Exception as e:
        logger.error(f"Failed to cache instance options: {e}")
        return {"error": f"Failed to cache instance options: {str(e)}"}

    return data_to_cache
