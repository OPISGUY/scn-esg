from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

class Command(BaseCommand):
    help = 'Resets the passwords for the default test users to known, secure values.'

    def handle(self, *args, **options):
        User = get_user_model()

        test_users = {
            "admin@scn.com": "AdminPassword123!",
            "test@scn.com": "TestPassword123!",
            "business@scn.com": "BusinessPassword123!"
        }

        self.stdout.write(self.style.SUCCESS("Starting password reset for test users..."))

        for email, password in test_users.items():
            try:
                user = User.objects.get(email=email)
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Successfully reset password for {email}"))
            except User.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"User {email} not found. Creating user."))
                try:
                    User.objects.create_user(
                        username=email,
                        email=email,
                        password=password,
                        first_name=email.split('@')[0].capitalize(),
                        last_name="User",
                        is_staff=True if 'admin' in email else False,
                        is_superuser=True if 'admin' in email else False,
                        is_active=True,
                        is_email_verified=True, # Assume verified for this reset script
                    )
                    self.stdout.write(self.style.SUCCESS(f"Successfully created and set password for {email}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to create user {email}: {e}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"An error occurred for user {email}: {e}"))

        self.stdout.write(self.style.SUCCESS("Password reset script finished."))