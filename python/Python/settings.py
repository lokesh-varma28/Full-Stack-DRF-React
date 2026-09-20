"""
Django settings for Python project.

Production-ready configuration for:
- Django REST Framework
- PostgreSQL / SQLite
- JWT authentication
- Cloudinary
- Razorpay
- CORS / CSRF
- WhiteNoise
- Render deployment
"""

from pathlib import Path
from datetime import timedelta
import os

import dj_database_url
from dotenv import load_dotenv


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

# Local development:
# python/.env
#
# Render:
# Environment variables are supplied directly by Render.
load_dotenv(BASE_DIR / ".env")


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def _parse_list(value: str) -> list[str]:
    """
    Parse comma- or newline-separated environment values.

    Example:
        "example.com,api.example.com"
    """

    if not value:
        return []

    normalized = (
        value
        .replace("\r\n", "\n")
        .replace("\r", "\n")
        .replace("\n", ",")
    )

    items: list[str] = []

    for item in normalized.split(","):
        cleaned = item.strip()

        if cleaned and cleaned not in items:
            items.append(cleaned)

    return items


def _parse_origins(value: str) -> list[str]:
    """
    Parse CORS/CSRF origins.

    Example:
        "http://localhost:5173,https://apexstore.vercel.app"
    """

    if not value:
        return []

    normalized = (
        value
        .replace("\r\n", "\n")
        .replace("\r", "\n")
        .replace("\n", ",")
    )

    origins: list[str] = []

    for item in normalized.split(","):
        cleaned = item.strip().rstrip("/")

        if cleaned and cleaned not in origins:
            origins.append(cleaned)

    return origins


# ============================================================
# SECURITY
# ============================================================

DEBUG = (
    os.getenv("DEBUG", "True")
    .strip()
    .lower()
    in ("true", "1", "yes")
)


# IMPORTANT:
# Never use a known/insecure secret key in production.
SECRET_KEY = os.getenv("SECRET_KEY", "").strip()

if not SECRET_KEY:
    if DEBUG:
        # Development-only fallback.
        SECRET_KEY = "django-insecure-local-development-only-key"

    else:
        raise RuntimeError(
            "SECRET_KEY environment variable is required when DEBUG=False."
        )


# ============================================================
# ALLOWED HOSTS
# ============================================================

ALLOWED_HOSTS_ENV = os.getenv("ALLOWED_HOSTS", "").strip()

parsed_hosts = _parse_list(ALLOWED_HOSTS_ENV)

if parsed_hosts:
    ALLOWED_HOSTS = parsed_hosts

elif DEBUG:
    ALLOWED_HOSTS = [
        "127.0.0.1",
        "localhost",
    ]

else:
    raise RuntimeError(
        "ALLOWED_HOSTS environment variable is required when DEBUG=False."
    )


# ============================================================
# CORS & CSRF
# ============================================================

DEFAULT_LOCAL_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


# ------------------------------------------------------------
# CORS_ALLOWED_ORIGINS
# ------------------------------------------------------------

cors_env = os.getenv("CORS_ALLOWED_ORIGINS", "").strip()

configured_cors = _parse_origins(cors_env)

if DEBUG:
    CORS_ALLOWED_ORIGINS = list(
        dict.fromkeys(
            configured_cors + DEFAULT_LOCAL_ORIGINS
        )
    )
else:
    CORS_ALLOWED_ORIGINS = configured_cors


# ------------------------------------------------------------
# CSRF_TRUSTED_ORIGINS
# ------------------------------------------------------------

csrf_env = os.getenv("CSRF_TRUSTED_ORIGINS", "").strip()

configured_csrf = _parse_origins(csrf_env)

if DEBUG:
    CSRF_TRUSTED_ORIGINS = list(
        dict.fromkeys(
            configured_csrf + DEFAULT_LOCAL_ORIGINS
        )
    )
else:
    CSRF_TRUSTED_ORIGINS = configured_csrf


# ============================================================
# APPLICATIONS
# ============================================================

INSTALLED_APPS = [

    # --------------------------------------------------------
    # Third Party
    # --------------------------------------------------------

    "corsheaders",
    "rest_framework",
    "django_filters",

    # --------------------------------------------------------
    # Cloudinary
    # --------------------------------------------------------

    "cloudinary",

    # --------------------------------------------------------
    # JWT Token Blacklist
    # --------------------------------------------------------

    "rest_framework_simplejwt.token_blacklist",

    # --------------------------------------------------------
    # Django
    # --------------------------------------------------------

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # --------------------------------------------------------
    # Local Apps
    # --------------------------------------------------------

    "base.apps.BaseConfig",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [

    "django.middleware.security.SecurityMiddleware",

    # CORS must run before CommonMiddleware.
    "corsheaders.middleware.CorsMiddleware",

    # WhiteNoise serves static files in production.
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URL CONFIGURATION
# ============================================================

ROOT_URLCONF = "Python.urls"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",

        "DIRS": [
            BASE_DIR / "templates",
        ],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ============================================================
# WSGI
# ============================================================

WSGI_APPLICATION = "Python.wsgi.application"


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()


if DATABASE_URL:

    # Render PostgreSQL / production database
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }

else:

    # Local development database
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# ============================================================
# DJANGO REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {

    # --------------------------------------------------------
    # Authentication
    # --------------------------------------------------------

    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),

    # --------------------------------------------------------
    # Default Permission
    # --------------------------------------------------------

    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),

    # --------------------------------------------------------
    # Filtering
    # --------------------------------------------------------

    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],

    # --------------------------------------------------------
    # Throttling
    # --------------------------------------------------------

    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],

    "DEFAULT_THROTTLE_RATES": {
        "anon": "10/minute",
        "user": "20/minute",

        # Custom throttles used by the project.
        "product": "100/hour",
        "cart": "50/hour",
        "payment": "10/minute",
    },

    # --------------------------------------------------------
    # Pagination
    # --------------------------------------------------------

    "DEFAULT_PAGINATION_CLASS": (
        "base.pagination.CustomPagination"
    ),

    "PAGE_SIZE": 10,
}


# ============================================================
# SIMPLE JWT
# ============================================================

SIMPLE_JWT = {

    # --------------------------------------------------------
    # Access Token
    # --------------------------------------------------------

    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=15,
    ),

    # --------------------------------------------------------
    # Refresh Token
    # --------------------------------------------------------

    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=7,
    ),

    # --------------------------------------------------------
    # Refresh Token Rotation
    # --------------------------------------------------------

    "ROTATE_REFRESH_TOKENS": True,

    "BLACKLIST_AFTER_ROTATION": True,

    # --------------------------------------------------------
    # Authentication Header
    # --------------------------------------------------------

    "AUTH_HEADER_TYPES": (
        "Bearer",
    ),

    # --------------------------------------------------------
    # Update Last Login
    # --------------------------------------------------------

    "UPDATE_LAST_LOGIN": True,
}


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [

    {
        "NAME":
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator",
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"


# ============================================================
# MEDIA FILES
# ============================================================

# Product images are stored using Cloudinary.
MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# STORAGE
# ============================================================

STORAGES = {

    # --------------------------------------------------------
    # User-uploaded media
    # --------------------------------------------------------

    "default": {
        "BACKEND":
            "cloudinary_storage.storage.MediaCloudinaryStorage",
    },

    # --------------------------------------------------------
    # Static files
    # --------------------------------------------------------

    "staticfiles": {
        "BACKEND":
            "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}


# ============================================================
# EMAIL CONFIGURATION
# ============================================================

EMAIL_BACKEND = (
    "django.core.mail.backends.smtp.EmailBackend"
)

EMAIL_HOST = os.getenv(
    "EMAIL_HOST",
    "smtp.gmail.com",
).strip()

EMAIL_PORT = int(
    os.getenv(
        "EMAIL_PORT",
        "587",
    )
)

EMAIL_USE_TLS = (
    os.getenv(
        "EMAIL_USE_TLS",
        "True",
    )
    .strip()
    .lower()
    in ("true", "1", "yes")
)

EMAIL_HOST_USER = os.getenv(
    "EMAIL_HOST_USER",
    "",
).strip()

EMAIL_HOST_PASSWORD = os.getenv(
    "EMAIL_HOST_PASSWORD",
    "",
).strip()

DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL",
    EMAIL_HOST_USER,
).strip()


# ============================================================
# RAZORPAY
# ============================================================

RAZORPAY_KEY_ID = os.getenv(
    "RAZORPAY_KEY_ID",
    "",
).strip()

RAZORPAY_KEY_SECRET = os.getenv(
    "RAZORPAY_KEY_SECRET",
    "",
).strip()


# ============================================================
# CLOUDINARY
# ============================================================

CLOUDINARY_CLOUD_NAME = os.getenv(
    "CLOUDINARY_CLOUD_NAME",
    "",
).strip()

CLOUDINARY_API_KEY = os.getenv(
    "CLOUDINARY_API_KEY",
    "",
).strip()

CLOUDINARY_API_SECRET = os.getenv(
    "CLOUDINARY_API_SECRET",
    "",
).strip()


CLOUDINARY_STORAGE = {
    "CLOUD_NAME": CLOUDINARY_CLOUD_NAME,
    "API_KEY": CLOUDINARY_API_KEY,
    "API_SECRET": CLOUDINARY_API_SECRET,
}


# ============================================================
# SECURITY SETTINGS
# ============================================================

SECURE_CONTENT_TYPE_NOSNIFF = True

X_FRAME_OPTIONS = "DENY"

SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)


# ============================================================
# PRODUCTION HTTPS SETTINGS
# ============================================================

if not DEBUG:

    SECURE_SSL_REDIRECT = (
        os.getenv(
            "SECURE_SSL_REDIRECT",
            "True",
        )
        .strip()
        .lower()
        in ("true", "1", "yes")
    )

    SESSION_COOKIE_SECURE = True

    CSRF_COOKIE_SECURE = True

    # HSTS
    SECURE_HSTS_SECONDS = int(
        os.getenv(
            "SECURE_HSTS_SECONDS",
            "31536000",
        )
    )

    SECURE_HSTS_INCLUDE_SUBDOMAINS = (
        os.getenv(
            "SECURE_HSTS_INCLUDE_SUBDOMAINS",
            "True",
        )
        .strip()
        .lower()
        in ("true", "1", "yes")
    )

    SECURE_HSTS_PRELOAD = (
        os.getenv(
            "SECURE_HSTS_PRELOAD",
            "True",
        )
        .strip()
        .lower()
        in ("true", "1", "yes")
    )

else:

    # Explicit development values.
    SECURE_SSL_REDIRECT = False

    SESSION_COOKIE_SECURE = False

    CSRF_COOKIE_SECURE = False


# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = (
    "django.db.models.BigAutoField"
)