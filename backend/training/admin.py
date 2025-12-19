from django.contrib import admin

from training.models import (
    UserTrainingPreferences,
    Workout,
    WorkoutExercise,
    WorkoutSet,
)


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


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    """Admin interface for Workout model."""

    list_display = [
        "user",
        "workout_number",
        "focus",
        "status",
        "started_at",
        "completed_at",
        "created_at",
    ]
    list_filter = ["focus", "status", "created_at"]
    search_fields = ["user__email", "user__full_name"]
    readonly_fields = ["created_at", "updated_at"]
    raw_id_fields = ["user"]


@admin.register(WorkoutExercise)
class WorkoutExerciseAdmin(admin.ModelAdmin):
    """Admin interface for WorkoutExercise model."""

    list_display = ["workout", "exercise", "gym_machine", "order"]
    list_filter = ["exercise", "gym_machine__gym"]
    search_fields = ["workout__user__email", "exercise__name", "gym_machine__machine_number"]
    raw_id_fields = ["workout", "exercise", "gym_machine"]


@admin.register(WorkoutSet)
class WorkoutSetAdmin(admin.ModelAdmin):
    """Admin interface for WorkoutSet model."""

    list_display = [
        "workout_exercise",
        "set_number",
        "target_weight_lbs",
        "target_reps",
        "actual_weight_lbs",
        "actual_reps",
        "is_completed",
    ]
    list_filter = ["is_completed", "workout_exercise__workout__status"]
    search_fields = [
        "workout_exercise__workout__user__email",
        "workout_exercise__exercise__name",
    ]
    raw_id_fields = ["workout_exercise"]
