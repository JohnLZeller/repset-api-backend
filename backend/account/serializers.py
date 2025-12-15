from __future__ import annotations

from typing import Any

from django.contrib.auth import (
    authenticate,
    get_user_model,
    password_validation,
)
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

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


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing user password.

    Validates that:
    - Current password is correct
    - New password meets Django's password validation requirements
    - New password and confirmation match
    - New password differs from current password
    """

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate_current_password(self, value: str) -> str:
        """Verify that current_password matches the authenticated user's password."""
        user = self.context.get("user")
        if user is None:
            raise serializers.ValidationError("User not found in context.")

        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")

        return value

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """
        Validate new password confirmation and strength.

        - Ensure new_password and new_password_confirm match
        - Ensure new_password is not the same as current_password
        - Run Django password validators against new_password
        """
        current_password = attrs.get("current_password")
        new_password = attrs.get("new_password")
        new_password_confirm = attrs.get("new_password_confirm")
        user = self.context.get("user")

        # Check that new password and confirmation match
        if new_password != new_password_confirm:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )

        # Ensure new password differs from current password
        if current_password == new_password:
            raise serializers.ValidationError(
                {"new_password": "New password cannot be the same as current password."}
            )

        # Validate password strength using Django's built-in validators
        # Pass user instance for similarity checks (e.g., email similarity)
        try:
            password_validation.validate_password(new_password, user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})

        return attrs


class UpdateProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile information (email and full_name).

    Validates that:
    - Email is unique (case-insensitive) if changed
    - Email format is valid
    - Full name is within length limits
    """

    class Meta:
        model = User
        fields = ["email", "full_name"]
        extra_kwargs = {
            "email": {"required": True},
            "full_name": {"required": False, "allow_blank": True},
        }

    def validate_email(self, value: str) -> str:
        """Ensure email is unique (case-insensitive) if changed."""
        email = value.lower()
        user = self.instance

        # Check if email is being changed
        if user and user.email.lower() == email:
            # Email hasn't changed, no need to check uniqueness
            return email

        # Email is being changed, check if new email already exists
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")

        return email

    def update(self, instance: User, validated_data: dict[str, Any]) -> User:
        """Update the user instance with validated data."""
        instance.email = validated_data.get("email", instance.email)
        instance.full_name = validated_data.get("full_name", instance.full_name)
        instance.save()
        return instance
