import logging
from typing import Iterable

from django.apps import apps
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from django.db import ProgrammingError, OperationalError
from django.db.models.signals import post_migrate
from django.dispatch import receiver

logger = logging.getLogger(__name__)


DEMO_USERS: Iterable[dict[str, object]] = (
    {
        "email": "demo@scn.com",
        "password": "Demo1234!",
        "first_name": "Demo",
        "last_name": "Admin",
        "role": "admin",
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "email": "test@scn.com",
        "password": "Test1234!",
        "first_name": "Test",
        "last_name": "User",
        "role": "sustainability_manager",
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "email": "business@scn.com",
        "password": "Business123!",
        "first_name": "Business",
        "last_name": "User",
        "role": "decision_maker",
        "is_staff": False,
        "is_superuser": False,
    },
)


def _should_seed_demo_users() -> bool:
    """Determine whether demo users should be created."""
    return getattr(settings, "ENABLE_DEMO_USERS", True)


def _should_reset_passwords() -> bool:
    """Determine whether demo user passwords should be reset on each migrate."""
    return getattr(settings, "RESET_DEMO_PASSWORDS", True)


@receiver(post_migrate)
def ensure_demo_users(sender, **kwargs) -> None:
    """Seed or refresh default demo users after migrations.

    We hook into the ``companies`` app post-migrate signal to ensure the
    ``Company`` table exists before assigning relationships.
    """

    app_config = kwargs.get("app_config")
    if not app_config or app_config.name != "companies":
        return

    if not _should_seed_demo_users():
        logger.info("Demo user seeding skipped because ENABLE_DEMO_USERS is False")
        return

    try:
        Company = apps.get_model("companies", "Company")
        User = get_user_model()
    except (LookupError, ImproperlyConfigured) as exc:
        # ImproperlyConfigured is raised if apps aren't ready, LookupError if the
        # model registry can't find the target model yet.
        logger.warning("Unable to load required models for demo user seeding: %s", exc)
        return

    try:
        company_defaults = {
            "industry": "Technology",
            "employees": 500,
        }
        demo_company, _ = Company.objects.get_or_create(
            name=getattr(settings, "DEMO_COMPANY_NAME", "SCN Demo Company"),
            defaults=company_defaults,
        )
    except (ProgrammingError, OperationalError) as exc:
        # Database tables may not exist yet (for example during the first migrate
        # on a brand-new database). We'll bail out gracefully in that scenario and
        # let a subsequent migrate run complete the seeding.
        logger.warning("Skipping demo user seeding because the companies table is missing: %s", exc)
        return

    reset_passwords = _should_reset_passwords()

    for config in DEMO_USERS:
        email = config["email"]
        defaults = {
            "username": email,
            "first_name": config.get("first_name", ""),
            "last_name": config.get("last_name", ""),
            "role": config.get("role", "viewer"),
        }

        user, created = User.objects.get_or_create(email=email, defaults=defaults)
        updated = False

        if created:
            logger.info("Created demo user %s", email)
        else:
            # Ensure existing user metadata stays in sync with defaults for
            # consistency across redeployments.
            for field, expected in defaults.items():
                if getattr(user, field) != expected:
                    setattr(user, field, expected)
                    updated = True

        if reset_passwords or created:
            user.set_password(config["password"])
            updated = True

        if config.get("is_staff", False) and not user.is_staff:
            user.is_staff = True
            updated = True

        if config.get("is_superuser", False) and not user.is_superuser:
            user.is_superuser = True
            updated = True

        if not user.is_active:
            user.is_active = True
            updated = True

        if user.company_id is None:
            user.company = demo_company
            updated = True

        if not user.is_email_verified:
            user.is_email_verified = True
            updated = True

        if not user.is_onboarding_complete:
            user.is_onboarding_complete = True
            updated = True

        if user.dashboard_preferences is None:
            user.dashboard_preferences = {}
            updated = True

        if updated:
            user.save()
            logger.info("Synchronized demo user %s", email)

    logger.info("Demo user seeding complete")
