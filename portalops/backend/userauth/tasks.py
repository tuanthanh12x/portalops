
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_reset_password_email(email, uid, token):
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
    subject = "Reset Your Password - PortalOps"
    message = f"Click the link to reset your password:\n\n{reset_link}\n\nIf you didn’t request this, please ignore this email."
    from_email = settings.DEFAULT_FROM_EMAIL

    send_mail(subject, message, from_email, [email])
    return f"Password reset email sent to {email}"
