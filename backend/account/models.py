from __future__ import annotations

from typing import TYPE_CHECKING

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils import timezone

from account.enums import EquipmentType, ExerciseAttribute

if TYPE_CHECKING:
    from django.db.models.manager import Manager


class UserManager(BaseUserManager["User"]):
    """Custom user manager that uses email as the unique identifier."""

    def create_user(
        self,
        email: str,
        password: str | None = None,
        **extra_fields,
    ) -> User:
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(
        self,
        email: str,
        password: str | None = None,
        **extra_fields,
    ) -> User:
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model that uses email as the unique identifier."""

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects: Manager[User] = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        ordering = ["-created_at"]

    @property
    def first_name(self) -> str:
        """Return the first name from full_name."""
        if not self.full_name:
            return ""
        parts = self.full_name.strip().split(maxsplit=1)
        return parts[0] if parts else ""

    @property
    def last_name(self) -> str:
        """Return the last name from full_name."""
        if not self.full_name:
            return ""
        parts = self.full_name.strip().split(maxsplit=1)
        return parts[1] if len(parts) > 1 else ""

    def __str__(self) -> str:
        return f"User #{self.id}: {self.email}"


class UserTrainingPreferences(models.Model):
    """Training preferences for a user, using a blacklist model."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="training_preferences",
    )

    excluded_equipment = ArrayField(
        models.CharField(max_length=50, choices=EquipmentType.choices),
        default=list,
        blank=True,
    )

    excluded_exercise_attributes = ArrayField(
        models.CharField(max_length=50, choices=ExerciseAttribute.choices),
        default=list,
        blank=True,
    )

    sessions_per_week = models.SmallIntegerField(default=3)
    training_intensity = models.PositiveSmallIntegerField(default=5)
    session_time_limit = models.IntegerField(default=60)  # minutes

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Training Preferences"
        verbose_name_plural = "User Training Preferences"

    def __str__(self) -> str:
        return f"Training Preferences for {self.user.email}"
