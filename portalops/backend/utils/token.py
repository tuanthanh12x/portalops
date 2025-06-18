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