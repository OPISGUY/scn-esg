from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self) -> None:
        # Import signal handlers that seed default demo users after migrations
        from . import signals  # noqa: F401
