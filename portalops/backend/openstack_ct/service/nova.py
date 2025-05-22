import requests
from django.conf import settings
from datetime import datetime
from utils.redis_client import redis_client


def get_project_usage(username, project_id):
    token_key = f"keystone_token:{username}"
    token = redis_client.get(token_key)
    if not token:
        raise ValueError("Token expired or missing")

    token = token.decode()
    nova_url = "http://172.93.187.251/compute/v2.1"

    today = datetime.utcnow()
    start = today.replace(day=1).isoformat()
    end = today.isoformat()

    url = f"{nova_url}/os-simple-tenant-usage/{project_id}"
    params = {
        "start": start,
        "end": end
    }
    headers = {"X-Auth-Token": token}

    r = requests.get(url, headers=headers, params=params)
    r.raise_for_status()

    usage = r.json().get("tenant_usage", {})
    return {
        "total_vcpus": usage.get("total_vcpus_usage", 0),
        "total_ram_mb": usage.get("total_memory_mb_usage", 0),
        "total_storage_gb": usage.get("total_local_gb_usage", 0)
    }
