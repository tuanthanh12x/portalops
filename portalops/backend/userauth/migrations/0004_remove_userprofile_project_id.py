# Generated by Django 5.2.1 on 2025-06-24 02:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('userauth', '0003_pending2fasession'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='project_id',
        ),
    ]
