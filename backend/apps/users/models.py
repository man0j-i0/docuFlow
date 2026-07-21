from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

from apps.core.models import TimeStampModel, UUIDModel


class UserManager(BaseUserManager):
    """Django's default manager assumes a username field, so we replace it."""

    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)   # hashes; never assign user.password directly
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, password, **extra_fields)


class User(UUIDModel, TimeStampModel, AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        REVIEWER = "reviewer", "Reviewer"
        AUDITOR = "auditor", "Auditor"

    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.REVIEWER)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.email} ({self.role})"

    # Convenience predicates — used by the DRF permission classes in PR 3.
    @property
    def is_admin(self) -> bool:
        return self.role == self.Role.ADMIN

    @property
    def is_reviewer(self) -> bool:
        return self.role == self.Role.REVIEWER

    @property
    def is_auditor(self) -> bool:
        return self.role == self.Role.AUDITOR
