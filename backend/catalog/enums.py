from __future__ import annotations

from django.db import models


class MuscleGroup(models.TextChoices):
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
    # Core
    ABS = "abs", "Abs"
    OBLIQUES = "obliques", "Obliques"
    LOWER_BACK = "lower_back", "Lower Back"
    # Lower Body
    QUADS = "quads", "Quads"
    HAMSTRINGS = "hamstrings", "Hamstrings"
    GLUTES = "glutes", "Glutes"
    CALVES = "calves", "Calves"
    HIP_FLEXORS = "hip_flexors", "Hip Flexors"
    ADDUCTORS = "adductors", "Adductors"
    ABDUCTORS = "abductors", "Abductors"
