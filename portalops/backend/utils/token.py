import requests
from django.conf import settings


def get_admin_token_for_project(project_id):
    url = f"{settings.OPENSTACK_AUTH_URL}/auth/tokens"

    payload = {
        "auth": {
            "identity": {
                "methods": ["password"],
                "password": {
                    "user": {
                        "name": settings.OPENSTACK_ADMIN_NAME,
                        "domain": {"name": settings.OPENSTACK_USER_DOMAIN_NAME},
                        "password": settings.OPENSTACK_ADMIN_PASS
                    }
                }
            },
            "scope": {
                "project": {
                    "id": project_id
                }
            }
        }
    }

    headers = {"Content-Type": "application/json"}

    res = requests.post(url, json=payload, headers=headers)
    res.raise_for_status()
    return res.headers["X-Subject-Token"]



def get_admin_token():
    payload = {
        "auth": {
            "identity": {
                "methods": ["password"],
                "password": {
                    "user": {
                        "name": settings.OPENSTACK_ADMIN_NAME,
                        "domain": { "name": settings.USER_DOMAIN_NAME },
                        "password": settings.OPENSTACK_ADMIN_PASSWORD
                    }
                }
            },
            "scope": {
                "project": {
                    "name": settings.OPENSTACK_ADMIN_NAME,  # or admin project name
                    "domain": { "name": settings.PROJECT_DOMAIN_NAME }
                }
            }
        }
    }

    response = requests.post(
        f"{settings.OPENSTACK_AUTH_URL.rstrip('/')}/auth/tokens",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    if response.status_code != 201:
        raise Exception(f"Failed to get admin token: {response.text}")

    token = response.headers.get("X-Subject-Token")
    if not token:
        raise Exception("Token not found in response headers")

    return token