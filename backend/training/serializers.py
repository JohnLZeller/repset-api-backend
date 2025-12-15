from __future__ import annotations

from rest_framework import serializers

from training.enums import (
    EquipmentModality,
    EquipmentStation,
    ExerciseAttribute,
    MachineType,
)
from training.models import UserTrainingPreferences


class TrainingPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for UserTrainingPreferences model."""

    updated_at = serializers.ReadOnlyField()

    class Meta:
        model = UserTrainingPreferences
        fields = [
            "excluded_equipment_modalities",
            "excluded_equipment_stations",
            "excluded_machine_types",
            "excluded_exercise_attributes",
            "sessions_per_week",
            "training_intensity",
            "max_session_mins",
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

    def validate_max_session_mins(self, value: int) -> int:
        """Validate max_session_mins is positive."""
        if value <= 0:
            raise serializers.ValidationError(
                "Maximum session minutes must be a positive number."
            )
        return value

    def validate_excluded_equipment_modalities(
        self, value: list[str]
    ) -> list[str]:
        """Validate excluded_equipment_modalities contains valid choices."""
        valid_choices = {choice[0] for choice in EquipmentModality.choices}
        for item in value:
            if item not in valid_choices:
                raise serializers.ValidationError(
                    f"'{item}' is not a valid equipment modality."
                )
        return value

    def validate_excluded_equipment_stations(
        self, value: list[str]
    ) -> list[str]:
        """Validate excluded_equipment_stations contains valid choices."""
        valid_choices = {choice[0] for choice in EquipmentStation.choices}
        for item in value:
            if item not in valid_choices:
                raise serializers.ValidationError(
                    f"'{item}' is not a valid equipment station."
                )
        return value

    def validate_excluded_machine_types(self, value: list[str]) -> list[str]:
        """Validate excluded_machine_types contains valid choices."""
        valid_choices = {choice[0] for choice in MachineType.choices}
        for item in value:
            if item not in valid_choices:
                raise serializers.ValidationError(
                    f"'{item}' is not a valid machine type."
                )
        return value

    def validate_excluded_exercise_attributes(
        self, value: list[str]
    ) -> list[str]:
        """Validate excluded_exercise_attributes contains valid choices."""
        valid_choices = {choice[0] for choice in ExerciseAttribute.choices}
        for item in value:
            if item not in valid_choices:
                raise serializers.ValidationError(
                    f"'{item}' is not a valid exercise attribute."
                )
        return value

