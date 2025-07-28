
from celery import shared_task
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.conf import settings
from django.http import request
from openstack import connection

from utils.token import get_admin_token_for_project


@shared_task
def send_reset_password_email(email, uid, token):
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
    subject = "Reset Your Password - PortalOps"
    message = f"Click the link to reset your password:\n\n{reset_link}\n\nIf you didn’t request this, please ignore this email."
    from_email = settings.DEFAULT_FROM_EMAIL

    send_mail(subject, message, from_email, [email])
    return f"Password reset email sent to {email}"



import requests
from celery import shared_task
from django.conf import settings
from .models import UserProfile


@shared_task
def update_user_vm_counts():
    compute_url = settings.OPENSTACK_COMPUTE_URL

    for profile in UserProfile.objects.select_related("user"):
        project_id = profile.project_id
        user_id = profile.openstack_user_id
        if not project_id:
            continue

        try:
            token = get_admin_token_for_project(project_id)
            headers = {"X-Auth-Token": token}
            servers_url = f"{compute_url}/servers/detail"
            params = {"all_tenants": 0}

            res = requests.get(servers_url, headers=headers, params=params)
            res.raise_for_status()

            servers = res.json().get("servers", [])
            user_vm_count = sum(1 for s in servers if s.get("user_id") == user_id)

            profile.vm_count = user_vm_count
            profile.save(update_fields=["vm_count"])

        except Exception as e:
            continue



def get_nova_client():
    return connection.Connection(
        auth_url=settings.OPENSTACK_AUTH_URL,
        project_domain_name=settings.PROJECT_DOMAIN_NAME,
        user_domain_name=settings.USER_DOMAIN_NAME,
        username=settings.OPENSTACK_ADMIN_NAME,
        password=settings.OPENSTACK_ADMIN_PASSWORD,
        project_name='admin',
        compute_api_version='2.1',
    )






User = get_user_model()


@shared_task
def create_openstack_project_and_user(user_id, raw_password):
    try:
        user = User.objects.get(id=user_id)

        conn = connection.Connection(
            auth_url=settings.OPENSTACK_AUTH_URL,
            username=settings.OPENSTACK_ADMIN_NAME,
            password=settings.OPENSTACK_ADMIN_PASSWORD,
            project_name='admin',
            user_domain_name=settings.USER_DOMAIN_NAME,
            project_domain_name=settings.PROJECT_DOMAIN_NAME,
        )

        project_name = f"{user.username}_project"
        new_project = conn.identity.create_project(
            name=project_name,
            domain_id="default",
            description=f"Project for user {user.username}"
        )

        os_user = conn.identity.create_user(
            name=user.username,
            password=raw_password,
            domain_id="default",
            default_project_id=new_project.id,
            email=user.email,
            enabled=True
        )

        admin_role = conn.identity.find_role("admin")
        conn.identity.assign_project_role_to_user(
            project=new_project.id,
            user=os_user.id,
            role=admin_role.id
        )

        return f"Successfully created OpenStack user and project for {user.username}"

    except Exception as e:
        print(f"[❌ OpenStack Error] {e}")
        return str(e)


@shared_task
def create_openstack_user(user_id, raw_password):
    try:
        user = User.objects.select_related('userprofile').get(id=user_id)

        conn = connection.Connection(
            auth_url=settings.OPENSTACK_AUTH_URL,
            username=settings.OPENSTACK_ADMIN_NAME,
            password=settings.OPENSTACK_ADMIN_PASSWORD,
            project_name='admin',
            user_domain_name=settings.USER_DOMAIN_NAME,
            project_domain_name=settings.PROJECT_DOMAIN_NAME,
        )

        os_user = conn.identity.create_user(
            name=user.username,
            password=raw_password,
            domain_id="default",
            email=user.email,
            enabled=True
        )

        user.userprofile.openstack_user_id = os_user.id
        user.userprofile.save(update_fields=["openstack_user_id"])

        return {
            "status": "success",
            "openstack_user_id": os_user.id,
            "message": f"✅ Created OpenStack user for {user.username}"
        }

    except ObjectDoesNotExist:
        return {
            "status": "error",
            "message": f"❌ User with id {user_id} does not exist"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"❌ OpenStack Error: {str(e)}"
        }

@shared_task
def create_openstack_project(user_id):
    try:
        user = User.objects.get(id=user_id)

        conn = connection.Connection(
            auth_url=settings.OPENSTACK_AUTH_URL,
            username=settings.OPENSTACK_ADMIN_NAME,
            password=settings.OPENSTACK_ADMIN_PASSWORD,
            project_name='admin',
            user_domain_name=settings.USER_DOMAIN_NAME,
            project_domain_name=settings.PROJECT_DOMAIN_NAME,
        )

        project_name = f"{user.username}_project"

        new_project = conn.identity.create_project(
            name=project_name,
            domain_id="default",
            description=f"Project for user {user.username}"
        )

        return {
            "status": "success",
            "project_id": new_project.id,
            "message": f"Created project '{project_name}' successfully."
        }

    except Exception as e:
        print(f"[❌ OpenStack Project Creation Error] {e}")
        return {
            "status": "error",
            "message": str(e)
        }