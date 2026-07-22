from django.core.management.base import BaseCommand
from apps.users.models import User
SEED_PASSWORD = "devpass123"  # dev-only convenience; documented in README

SEED_USERS = [
    ("admin@docuflow.local", "Admin User", User.Role.ADMIN),
    ("reviewer@docuflow.local", "Reviewer User", User.Role.REVIEWER),
    ("auditor@docuflow.local", "Auditor USer", User.Role.AUDITOR),
]


class Command(BaseCommand):
    help = "Create one user per role for local development. Idempotent."
    
    def handle(self, *args, **options):
        for email, full_name, role in SEED_USERS:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={"full_name": full_name, "role": role},
            )
            if created:
                user.set_password(SEED_PASSWORD)
                # Admin gets staff access so /admin works with the seeded login.
                if role == User.Role.ADMIN:
                    user.is_staff = True
                    user.is_superuser = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f"created {email} ({role})"))
            else:
                self.stdout.write(f"exists {email} ({role})")

        self.stdout.write(self.style.SUCCESS(f"\nAll seed users share password: {SEED_PASSWORD}"))

                     