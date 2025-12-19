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


class MovementPattern(models.TextChoices):
    """
    Movement-based exercise classification.
    Note: Push/Pull/Legs is a movement-based split, not anatomical grouping.
    """

    PUSH = "push", "Push"
    PULL = "pull", "Pull"
    SQUAT = "squat", "Squat"
    HINGE = "hinge", "Hinge"
    LUNGE = "lunge", "Lunge"
    CARRY = "carry", "Carry"
    ROTATION = "rotation", "Rotation"
    ANTI_ROTATION = "anti_rotation", "Anti-Rotation"
    LOCOMOTION = "locomotion", "Locomotion"


class WorkoutStatus(models.TextChoices):
    SCHEDULED = "scheduled", "Scheduled"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
