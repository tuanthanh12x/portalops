
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.http import request

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