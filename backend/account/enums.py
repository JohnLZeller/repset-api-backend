from __future__ import annotations

from django.db import models


class EquipmentType(models.TextChoices):
    """Equipment types that can be excluded from training preferences."""

    BARBELL = "barbell", "Barbell"
    DUMBBELL = "dumbbell", "Dumbbell"
    PLATED = "plated", "Plated"
    SELECTORIZED = "selectorized", "Selectorized"
    SPOTTER_RECOMMENDED = "spotter_recommended", "Spotter Recommended"
    SUSPENSION = "suspension", "Suspension"
    BODYWEIGHT = "bodyweight", "Bodyweight"


class ExerciseAttribute(models.TextChoices):
    """Exercise attributes that can be excluded from training preferences."""

    REQUIRES_PARTNER = "requires_partner", "Requires Partner"
    HIGH_IMPACT = "high_impact", "High Impact"
    REQUIRES_SPOTTER = "requires_spotter", "Requires Spotter"
    REQUIRES_PLATFORM = "requires_platform", "Requires Platform"
    REQUIRES_RACK = "requires_rack", "Requires Rack"
    REQUIRES_BENCH = "requires_bench", "Requires Bench"
    REQUIRES_CABLE_MACHINE = "requires_cable_machine", "Requires Cable Machine"
    REQUIRES_PULL_UP_BAR = "requires_pull_up_bar", "Requires Pull-up Bar"

