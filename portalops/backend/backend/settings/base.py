import os
from pathlib import Path

from corsheaders.defaults import default_headers
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
BASE_DIR = Path(__file__).resolve().parent.parent
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = True

ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True
APPEND_SLASH = False

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'shared',
    'project',
    'drf_spectacular',
    'userauth',
    'openstack_portal',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
AUTH_USER_MODEL = 'auth.User'
ROOT_URLCONF = 'backend.urls'

WSGI_APPLICATION = 'backend.wsgi.application'
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")



DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
        'OPTIONS': {
            'sslmode': config('DB_SSLMODE'),
        },
    }
}

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

DYNAMIC_TIMEZONE = config('DYNAMIC_TIMEZONE', default='UTC')

USE_I18N = True

USE_TZ = True


STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ]
}
from datetime import timedelta


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
}

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = list(default_headers) + [
    'X-CSRFToken',
]

import yaml
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
OPENSTACK_CONFIG_PATH = BASE_DIR / "openstackAPI.yaml"

try:
    with open(OPENSTACK_CONFIG_PATH, "r") as f:
        OPENSTACK_CONFIG = yaml.safe_load(f)
except FileNotFoundError:
    raise FileNotFoundError(f"OpenStack config file not found at {OPENSTACK_CONFIG_PATH}")
except yaml.YAMLError as e:
    raise RuntimeError(f"Error parsing OpenStack config: {str(e)}")
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f"redis://{REDIS_HOST}:{REDIS_PORT}/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
#
# from celery.schedules import crontab
# CELERY_IMPORTS = ("userauth.tasks",)
# CELERY_BEAT_SCHEDULE = {
#     "update-vm-counts-every-30min": {
#         "task": "userauth.tasks.sync_vm_count_for_all_users",
#         "schedule": crontab(minute="*/30"),
#     },
# }


OPENSTACK_ADMIN_NAME= config("OPENSTACK_ADMIN_NAME")
OPENSTACK_ADMIN_PASSWORD = config("OPENSTACK_ADMIN_PASSWORD")
OPENSTACK_ADMIN_PROJECT_ID = config("OPENSTACK_ADM_PROJECT_ID")
OPENSTACK_AUTH = OPENSTACK_CONFIG.get("auth", {})
OPENSTACK_SERVICES = OPENSTACK_CONFIG.get("services", {})


OPENSTACK_AUTH_URL = config("OPENSTACK_AUTH_URL")
USER_DOMAIN_NAME = config("OPENSTACK_USER_DOMAIN_NAME", default="Default")
PROJECT_DOMAIN_NAME = config("OPENSTACK_PROJECT_DOMAIN_NAME", default="Default")

OPENSTACK_IMAGE_URL = config("OPENSTACK_IMAGE_URL").rstrip("/")
OPENSTACK_COMPUTE_URL = config("OPENSTACK_COMPUTE_URL").rstrip("/")
OPENSTACK_NETWORK_URL = config("OPENSTACK_NETWORK_URL").rstrip("/")
OPENSTACK_BLOCK_STORAGE_URL = config("OPENSTACK_STORAGE_URL").rstrip("/")

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT', cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = config('EMAIL_USE_TLS', cast=bool)

FRONTEND_URL = config('FRONTEND_URL')