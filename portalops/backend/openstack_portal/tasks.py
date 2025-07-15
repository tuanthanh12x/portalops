import json
import logging
from typing import Dict

from celery import shared_task

from utils.conn import connect_with_token
from utils.redis_client import redis_client

logger = logging.getLogger(__name__)


@shared_task
def fetch_and_cache_instance_options(username: str, token: str, project_id: str) -> Dict:
    """
    Fetch and cache instance options (regions, flavors, images, networks) from OpenStack.

    Args:
        username (str): Authenticated user's username
        token (str): Keystone authentication token
        project_id (str): User's selected OpenStack project ID

    Returns:
        dict: Instance options or error details
    """
    try:
        conn = connect_with_token(token, project_id)
    except Exception as e:
        logger.exception("OpenStack connection initialization failed.")
        return {"error": f"Connection initialization failed: {str(e)}"}

    if not conn:
        error_msg = "OpenStack connection could not be established."
        logger.error(error_msg)
        return {"error": error_msg}

    # 1. Availability Zones / Regions
    try:
        az_list = conn.compute.availability_zones()
        regions = [az.name for az in az_list if az.state.get('available', False)]
    except Exception as e:
        logger.warning(f"[{username}] Failed to fetch availability zones: {e}")
        regions = []

    # 2. Images
    images = {
        "distribution": [],
        "marketplace": [],
        "my_images": [],
        "iso": []
    }
    try:
        for img in conn.image.images():
            name = (img.name or "").lower()
            entry = {"id": img.id, "name": img.name}

            if "ubuntu" in name or "centos" in name:
                images["distribution"].append(entry)
            elif "win" in name or "market" in name:
                images["marketplace"].append(entry)
            elif "iso" in name or img.disk_format == "iso":
                images["iso"].append(entry)
            elif img.owner_id == project_id:
                images["my_images"].append(entry)
    except Exception as e:
        logger.warning(f"[{username}] Failed to fetch images: {e}")

    # 3. Flavors (Plans)
    plans = []
    try:
        for flavor in conn.compute.flavors():
            plans.append({
                "id": flavor.id,
                "label": f"{flavor.name} - {flavor.vcpus} CPU, {flavor.ram}MB RAM, {flavor.disk}GB SSD"
            })
    except Exception as e:
        logger.warning(f"[{username}] Failed to fetch flavors: {e}")

    # 4. Networks
    networks = []
    try:
        for net in conn.network.networks():
            networks.append({"id": net.id, "name": net.name})
    except Exception as e:
        logger.warning(f"[{username}] Failed to fetch networks: {e}")

    # Final structure
    data_to_cache = {
        "regions": regions,
        "plans": plans,
        "images": images,
        "networks": networks,
    }

    redis_key = f"instance_options:{username}:{project_id}"
    try:
        redis_client.set(redis_key, json.dumps(data_to_cache), ex=3000)  #50 minutes
        logger.info(f"[{username}] Cached instance options under key: {redis_key}")
    except Exception as e:
        logger.error(f"[{username}] Failed to cache instance options: {e}")
        return {"error": f"Failed to cache instance options: {str(e)}"}

    return data_to_cache
