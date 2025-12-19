from __future__ import annotations

from django.db import models


class EquipmentModality(models.TextChoices):
    """How resistance is applied."""

    FREE_WEIGHTS = "free_weights", "Free Weights"
    MACHINES = "machines", "Machines"
    CABLES = "cables", "Cables"
    BODYWEIGHT = "bodyweight", "Bodyweight"
    BANDS_SUSPENSION = "bands_suspension", "Bands / Suspension"


class EquipmentStation(models.TextChoices):
    """Fixed stations or fixtures required."""

    RACK = "rack", "Rack"
    BENCH = "bench", "Bench"
    PULL_UP_BAR = "pull_up_bar", "Pull-up Bar"
    DIP_STATION = "dip_station", "Dip Station"
    FLOOR = "floor", "Floor"


class EquipmentType(models.TextChoices):
    """Equipment loading style."""

    SELECTORIZED = "selectorized", "Selectorized"
    PLATE_LOADED = "plate_loaded", "Plate Loaded"
    SMITH = "smith", "Smith Machine"


class ExerciseAttribute(models.TextChoices):
    HIGH_IMPACT = "high_impact", "High Impact"
    OVERHEAD = "overhead", "Overhead"
    SPOTTER_ADVISED = "spotter_advised", "Spotter Advised"
    TECHNICALLY_COMPLEX = "technically_complex", "Technically Complex"
    FLOOR_REQUIRED = "floor_required", "Floor Required"
    HIGH_JOINT_STRESS = "high_joint_stress", "High Joint Stress"


class WorkoutFocus(models.TextChoices):
    CHEST = "chest", "Chest"
    BACK = "back", "Back"
    LEGS = "legs", "Legs"
    ARMS = "arms", "Arms"
    SHOULDERS = "shoulders", "Shoulders"
    CORE = "core", "Core"
    FULL_BODY = "full_body", "Full Body"
    CHEST_TRICEPS = "chest_triceps", "Chest & Triceps"
    BACK_BICEPS = "back_biceps", "Back & Biceps"
    PUSH = "push", "Push"
    PULL = "pull", "Pull"


class WorkoutStatus(models.TextChoices):
    SCHEDULED = "scheduled", "Scheduled"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
