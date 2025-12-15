from django.contrib import admin

from training.models import UserTrainingPreferences


@admin.register(UserTrainingPreferences)
class UserTrainingPreferencesAdmin(admin.ModelAdmin):
    """Admin interface for UserTrainingPreferences model."""

    list_display = [
        "user",
        "sessions_per_week",
        "training_intensity",
        "max_session_mins",
        "updated_at",
    ]
    list_filter = ["sessions_per_week", "training_intensity", "updated_at"]
    search_fields = ["user__email", "user__full_name"]
    readonly_fields = ["updated_at"]
    raw_id_fields = ["user"]

    fieldsets = (
        (
            "User",
            {"fields": ("user",)},
        ),
        (
            "Exclusions",
            {
                "fields": (
                    "excluded_equipment_modalities",
                    "excluded_equipment_stations",
                    "excluded_machine_types",
                    "excluded_exercise_attributes",
                ),
            },
        ),
        (
            "Training Schedule",
            {
                "fields": (
                    "sessions_per_week",
                    "training_intensity",
                    "max_session_mins",
                ),
            },
        ),
        (
            "Metadata",
            {"fields": ("updated_at",)},
        ),
    )
