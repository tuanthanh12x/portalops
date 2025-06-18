import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from utils.redis_client import redis_client

def login_with_keystone(username: str, password: str, project_name: str) -> dict:
    if not all([username, password, project_name]):
        raise ValueError("Username, password, and project_name are required")

    keystone_url = settings.OPENSTACK_AUTH_URL + '/auth/tokens'
    payload = {
        "auth": {
            "identity": {
                "methods": ["password"],
                "password": {
                    "user": {
                        "name": username,
                        "domain": {"id": "default"},
                        "password": password,
                    }
                }
            },
            "scope": {
                "project": {
                    "name": project_name,
                    "domain": {"id": "default"},
                }
            }
        }
    }

    try:
        resp = requests.post(keystone_url, json=payload)
        resp.raise_for_status()
    except requests.exceptions.RequestException:
        raise ConnectionError("Keystone unreachable")

    if resp.status_code != 201:
        raise PermissionError("Invalid credentials")

    keystone_token = resp.headers.get('X-Subject-Token')
    user_info = resp.json()['token']
    project_id = user_info['project']['id']
    roles = [r['name'] for r in user_info.get('roles', [])]

    # Cache token in Redis
    redis_key = f"keystone_token:{username}:{project_id}"
    redis_client.set(redis_key, keystone_token, ex=3600)

    # Get or create Django user
    User = get_user_model()
    user, _ = User.objects.get_or_create(username=username)

    # Create JWT
    refresh = RefreshToken.for_user(user)
    refresh['username'] = username
    refresh['project_id'] = project_id
    refresh['roles'] = roles
    refresh['keystone_token'] = keystone_token

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }