from __future__ import annotations

from django.db import models


class Gym(models.Model):
    """A physical gym location."""

    name = models.CharField(max_length=255)
    street_address = models.CharField(max_length=255)
    street_address_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class GymEquipment(models.Model):
    """A specific equipment instance at a gym."""

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name="equipment")
    equipment = models.ForeignKey(
        "catalog.Equipment",
        on_delete=models.CASCADE,
        related_name="gym_instances",
    )
    equipment_display_number = models.CharField(
        max_length=50
    )  # Gym-specific identifier

    class Meta:
        unique_together = ["gym", "equipment_display_number"]

    def __str__(self) -> str:
        return f"{self.gym.name} - #{self.equipment_display_number} ({self.equipment.name})"
