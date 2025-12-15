from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.db import models

from training.enums import (
    EquipmentModality,
    EquipmentStation,
    ExerciseAttribute,
    MachineType,
)

User = get_user_model()


class UserTrainingPreferences(models.Model):
    """Training preferences for a user, using a blacklist model."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="training_preferences",
    )

    excluded_equipment_modalities = ArrayField(
        models.CharField(max_length=50, choices=EquipmentModality.choices),
        default=list,
        blank=True,
    )

    excluded_equipment_stations = ArrayField(
        models.CharField(max_length=50, choices=EquipmentStation.choices),
        default=list,
        blank=True,
    )

    excluded_machine_types = ArrayField(
        models.CharField(max_length=50, choices=MachineType.choices),
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
    max_session_mins = models.IntegerField(default=60)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "account_usertrainingpreferences"
        verbose_name = "User Training Preferences"
        verbose_name_plural = "User Training Preferences"

    def __str__(self) -> str:
        return f"Training Preferences for {self.user.email}"

