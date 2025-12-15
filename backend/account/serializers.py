from __future__ import annotations

from typing import Any

from django.contrib.auth import (
    authenticate,
    get_user_model,
    password_validation,
)
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from account.enums import EquipmentType, ExerciseAttribute
from account.models import UserTrainingPreferences

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer for the User model."""

    first_name = serializers.ReadOnlyField()
    last_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate_email(self, value: str) -> str:
        """Ensure email is unique (case-insensitive)."""
        email = value.lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """Validate password confirmation and password strength."""
        password = attrs.get("password")
        password_confirm = attrs.get("password_confirm")

        if password != password_confirm:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )

        # Validate password strength using Django's built-in validators
        try:
            password_validation.validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        return attrs

    def create(self, validated_data: dict[str, Any]) -> User:
        """Create a new user with the validated data."""
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            email=validated_data["email"],
            password=password,
            full_name=validated_data.get("full_name", ""),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """Authenticate the user with email and password."""
        email = attrs.get("email", "").lower()
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        user = authenticate(
            request=self.context.get("request"),
            email=email,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")

        attrs["user"] = user
        return attrs


class TrainingPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for UserTrainingPreferences model."""

    updated_at = serializers.ReadOnlyField()

    class Meta:
        model = UserTrainingPreferences
        fields = [
            "excluded_equipment",
            "excluded_exercise_attributes",
            "sessions_per_week",
            "training_intensity",
            "session_time_limit",
            "updated_at",
        ]

    def validate_training_intensity(self, value: int) -> int:
        """Validate training_intensity is between 1 and 10."""
        if not (1 <= value <= 10):
            raise serializers.ValidationError(
                "Training intensity must be between 1 and 10."
            )
        return value

    def validate_sessions_per_week(self, value: int) -> int:
        """Validate sessions_per_week is positive."""
        if value <= 0:
            raise serializers.ValidationError(
                "Sessions per week must be a positive number."
            )
        return value

    def validate_session_time_limit(self, value: int) -> int:
        """Validate session_time_limit is positive."""
        if value <= 0:
            raise serializers.ValidationError(
                "Session time limit must be a positive number."
            )
        return value

    def validate_excluded_equipment(self, value: list[str]) -> list[str]:
        """Validate excluded_equipment contains valid choices."""
        valid_choices = {choice[0] for choice in EquipmentType.choices}
        for item in value:
            if item not in valid_choices:
                raise serializers.ValidationError(
                    f"'{item}' is not a valid equipment type."
                )
        return value

    def validate_excluded_exercise_attributes(self, value: list[str]) -> list[str]:
        """Validate excluded_exercise_attributes contains valid choices."""
        valid_choices = {choice[0] for choice in ExerciseAttribute.choices}
        for item in value:
            if item not in valid_choices:
                raise serializers.ValidationError(
                    f"'{item}' is not a valid exercise attribute."
                )
        return value
