"""
Workout Taxonomy
================
3-layer hierarchy for categorizing exercises and workouts:

1. WorkoutRegion (coarse): Upper Body, Lower Body, Core, Full Body
2. MajorMuscleGroup (medium): Based on ACE consumer programming guidance
3. MuscleGroup (fine): Normie-recognizable muscle groups

References:
- ACE major muscle groups:
  https://www.acefitness.org/resources/everyone/blog/8650/
- ACSM resistance training:
  https://www.prescriptiontogetactive.com/static/pdfs/resistance-training-ACSM.pdf
- ETSU exercise guidelines:
  https://www.etsu.edu/exercise-is-medicine/guidelines.php
"""

from __future__ import annotations

from collections.abc import Iterable
from typing import TYPE_CHECKING

from django.db import models

if TYPE_CHECKING:
    pass


class WorkoutRegion(models.TextChoices):
    """Coarse-level workout categorization by body region."""

    UPPER_BODY = "upper_body", "Upper Body"
    LOWER_BODY = "lower_body", "Lower Body"
    CORE = "core", "Core"
    FULL_BODY = "full_body", "Full Body"


class MajorMuscleGroup(models.TextChoices):
    """
    Medium-level muscle group categorization.
    Based on American Council on Exercise (ACE) consumer programming guidance.
    """

    CHEST = "chest", "Chest"
    BACK = "back", "Back"
    SHOULDERS = "shoulders", "Shoulders"
    ARMS = "arms", "Arms"
    CORE = "core", "Core"
    HIPS = "hips", "Hips"
    LEGS = "legs", "Legs"


class MuscleGroup(models.TextChoices):
    """Fine-grained, normie-recognizable muscle groups for exercise tagging."""

    # Upper Body - Push
    CHEST = "chest", "Chest"
    FRONT_DELTS = "front_delts", "Front Delts"
    SIDE_DELTS = "side_delts", "Side Delts"
    TRICEPS = "triceps", "Triceps"
    # Upper Body - Pull
    LATS = "lats", "Lats"
    UPPER_BACK = "upper_back", "Upper Back"
    REAR_DELTS = "rear_delts", "Rear Delts"
    BICEPS = "biceps", "Biceps"
    FOREARMS = "forearms", "Forearms"
    GRIP = "grip", "Grip"
    # Core
    ABS = "abs", "Abs"
    OBLIQUES = "obliques", "Obliques"
    LOWER_BACK = "lower_back", "Lower Back"
    # Lower Body
    QUADS = "quads", "Quads"
    HAMSTRINGS = "hamstrings", "Hamstrings"
    GLUTES = "glutes", "Glutes"
    CALVES = "calves", "Calves"
    SHINS = "shins", "Shins"
    FEET = "feet", "Feet"
    HIP_FLEXORS = "hip_flexors", "Hip Flexors"
    ADDUCTORS = "adductors", "Adductors"
    ABDUCTORS = "abductors", "Abductors"


# Mapping dictionaries for taxonomy hierarchy

MUSCLE_GROUP_TO_MAJOR_GROUP: dict[MuscleGroup, MajorMuscleGroup] = {
    # Chest
    MuscleGroup.CHEST: MajorMuscleGroup.CHEST,
    # Back
    MuscleGroup.LATS: MajorMuscleGroup.BACK,
    MuscleGroup.UPPER_BACK: MajorMuscleGroup.BACK,
    # Shoulders
    MuscleGroup.FRONT_DELTS: MajorMuscleGroup.SHOULDERS,
    MuscleGroup.SIDE_DELTS: MajorMuscleGroup.SHOULDERS,
    MuscleGroup.REAR_DELTS: MajorMuscleGroup.SHOULDERS,
    # Arms
    MuscleGroup.BICEPS: MajorMuscleGroup.ARMS,
    MuscleGroup.TRICEPS: MajorMuscleGroup.ARMS,
    MuscleGroup.FOREARMS: MajorMuscleGroup.ARMS,
    MuscleGroup.GRIP: MajorMuscleGroup.ARMS,
    # Core
    MuscleGroup.ABS: MajorMuscleGroup.CORE,
    MuscleGroup.OBLIQUES: MajorMuscleGroup.CORE,
    MuscleGroup.LOWER_BACK: MajorMuscleGroup.CORE,
    # Hips
    MuscleGroup.GLUTES: MajorMuscleGroup.HIPS,
    MuscleGroup.HIP_FLEXORS: MajorMuscleGroup.HIPS,
    MuscleGroup.ADDUCTORS: MajorMuscleGroup.HIPS,
    MuscleGroup.ABDUCTORS: MajorMuscleGroup.HIPS,
    # Legs
    MuscleGroup.QUADS: MajorMuscleGroup.LEGS,
    MuscleGroup.HAMSTRINGS: MajorMuscleGroup.LEGS,
    MuscleGroup.CALVES: MajorMuscleGroup.LEGS,
    MuscleGroup.SHINS: MajorMuscleGroup.LEGS,
    MuscleGroup.FEET: MajorMuscleGroup.LEGS,
}

MAJOR_GROUP_TO_REGION: dict[MajorMuscleGroup, WorkoutRegion] = {
    MajorMuscleGroup.CHEST: WorkoutRegion.UPPER_BODY,
    MajorMuscleGroup.BACK: WorkoutRegion.UPPER_BODY,
    MajorMuscleGroup.SHOULDERS: WorkoutRegion.UPPER_BODY,
    MajorMuscleGroup.ARMS: WorkoutRegion.UPPER_BODY,
    MajorMuscleGroup.CORE: WorkoutRegion.CORE,
    MajorMuscleGroup.HIPS: WorkoutRegion.LOWER_BODY,
    MajorMuscleGroup.LEGS: WorkoutRegion.LOWER_BODY,
}


# Helper functions


def major_group_for(muscle_group: MuscleGroup) -> MajorMuscleGroup:
    """Get the major muscle group for a given muscle group."""
    return MUSCLE_GROUP_TO_MAJOR_GROUP[muscle_group]


def region_for_major_group(major: MajorMuscleGroup) -> WorkoutRegion:
    """Get the workout region for a given major muscle group."""
    return MAJOR_GROUP_TO_REGION[major]


def regions_for_muscle_groups(
    groups: Iterable[MuscleGroup],
) -> set[WorkoutRegion]:
    """
    Get the set of workout regions for a collection of muscle groups.

    If both UPPER_BODY and LOWER_BODY are present, returns {FULL_BODY}.
    Otherwise returns the set of regions (CORE can coexist with others).
    """
    regions: set[WorkoutRegion] = set()
    for group in groups:
        major = major_group_for(group)
        region = region_for_major_group(major)
        regions.add(region)

    # If both upper and lower body are present, return FULL_BODY
    if WorkoutRegion.UPPER_BODY in regions and WorkoutRegion.LOWER_BODY in regions:
        return {WorkoutRegion.FULL_BODY}

    return regions


def primary_region_for_workout(groups: Iterable[MuscleGroup]) -> WorkoutRegion:
    """
    Get the primary workout region for a collection of muscle groups.

    Priority order:
    1. If FULL_BODY condition is met, return FULL_BODY
    2. If only one region present, return it
    3. Otherwise prioritize: UPPER_BODY > LOWER_BODY > CORE
    """
    regions = regions_for_muscle_groups(groups)

    if WorkoutRegion.FULL_BODY in regions:
        return WorkoutRegion.FULL_BODY

    if len(regions) == 1:
        return next(iter(regions))

    # Priority order: UPPER_BODY > LOWER_BODY > CORE
    if WorkoutRegion.UPPER_BODY in regions:
        return WorkoutRegion.UPPER_BODY
    if WorkoutRegion.LOWER_BODY in regions:
        return WorkoutRegion.LOWER_BODY
    return WorkoutRegion.CORE
