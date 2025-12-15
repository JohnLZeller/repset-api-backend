from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, UserTrainingPreferences


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""

    list_display = [
        "email",
        "first_name",
        "last_name",
        "full_name",
        "is_active",
        "is_staff",
        "is_superuser",
        "created_at",
    ]
    list_filter = ["is_active", "is_staff", "is_superuser", "created_at"]
    search_fields = ["email", "full_name"]
    ordering = ["-created_at"]
    readonly_fields = [
        "created_at",
        "updated_at",
        "last_login",
        "first_name",
        "last_name",
    ]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal info",
            {"fields": ("full_name", "first_name", "last_name")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (
            "Important dates",
            {"fields": ("last_login", "created_at", "updated_at")},
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "full_name",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )

    filter_horizontal = ["groups", "user_permissions"]


@admin.register(UserTrainingPreferences)
class UserTrainingPreferencesAdmin(admin.ModelAdmin):
    """Admin interface for UserTrainingPreferences model."""

    list_display = [
        "user",
        "sessions_per_week",
        "training_intensity",
        "session_time_limit",
        "updated_at",
    ]
    list_filter = ["sessions_per_week", "training_intensity", "updated_at"]
    search_fields = ["user__email", "user__full_name"]
    readonly_fields = ["updated_at"]
    raw_id_fields = ["user"]
