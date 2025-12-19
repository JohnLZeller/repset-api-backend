from __future__ import annotations

from django.contrib.postgres.fields import ArrayField
from django.db import models

from catalog.enums import MuscleGroup
from training.enums import MachineType  # Reuse existing enum


class Machine(models.Model):
    """Master catalog of machine types available across all gyms."""

    name = models.CharField(max_length=255)  # e.g., "Chest Press"
    brand = models.CharField(max_length=255)  # e.g., "Life Fitness"
    equipment_type = models.CharField(max_length=50, choices=MachineType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.brand} {self.name}"


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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name
