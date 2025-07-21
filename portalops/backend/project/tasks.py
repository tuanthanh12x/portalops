from celery import shared_task
from .service import sync_floating_ips

@shared_task
def sync_floating_ips_task():
    sync_floating_ips()
    return "✔ Floating IP sync completed"