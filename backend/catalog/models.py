from __future__ import annotations

from django.contrib.postgres.fields import ArrayField
from django.db import models

from catalog.enums import MuscleGroup
from training.enums import (
    EquipmentModality,
    EquipmentStation,
    EquipmentType,
    ExerciseAttribute,
)


class Equipment(models.Model):
    """Master catalog of equipment types available across all gyms."""

    name = models.CharField(max_length=255)  # e.g., "Power Rack"
    brand = models.CharField(max_length=255)  # e.g., "Titan Fitness"
    modality = models.CharField(max_length=50, choices=EquipmentModality.choices)
    station = models.CharField(
        max_length=50,
        choices=EquipmentStation.choices,
        blank=True,
        null=True,
    )  # Optional - not all equipment requires a station
    equipment_type = models.CharField(max_length=50, choices=EquipmentType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.brand}, {self.name} ({self.equipment_type})"


class Exercise(models.Model):
    """Master catalog of exercises."""

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    primary_muscles = ArrayField(
        models.CharField(max_length=50, choices=MuscleGroup.choices),
        default=list,
    )
    secondary_muscles = ArrayField(
        models.CharField(max_length=50, choices=MuscleGroup.choices),
        default=list,
    )
    attributes = ArrayField(
        models.CharField(max_length=50, choices=ExerciseAttribute.choices),
        default=list,
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name
