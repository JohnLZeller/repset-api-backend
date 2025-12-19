from __future__ import annotations

from catalog.enums import MuscleGroup
from training.enums import WorkoutFocus

# Mapping of workout focuses to their primary muscle groups
# Uses string values (first element of TextChoices tuples)
WORKOUT_FOCUS_TO_MUSCLE_GROUPS: dict[str, list[str]] = {
    WorkoutFocus.CHEST: [
        MuscleGroup.CHEST,
        MuscleGroup.FRONT_DELTS,
        MuscleGroup.TRICEPS,
    ],
    WorkoutFocus.BACK: [
        MuscleGroup.LATS,
        MuscleGroup.UPPER_BACK,
        MuscleGroup.REAR_DELTS,
        MuscleGroup.BICEPS,
    ],
    WorkoutFocus.LEGS: [
        MuscleGroup.QUADS,
        MuscleGroup.HAMSTRINGS,
        MuscleGroup.GLUTES,
        MuscleGroup.CALVES,
    ],
    WorkoutFocus.ARMS: [
        MuscleGroup.BICEPS,
        MuscleGroup.TRICEPS,
        MuscleGroup.FOREARMS,
    ],
    WorkoutFocus.SHOULDERS: [
        MuscleGroup.FRONT_DELTS,
        MuscleGroup.SIDE_DELTS,
        MuscleGroup.REAR_DELTS,
    ],
    WorkoutFocus.CORE: [
        MuscleGroup.ABS,
        MuscleGroup.OBLIQUES,
        MuscleGroup.LOWER_BACK,
    ],
    WorkoutFocus.FULL_BODY: [
        # All major muscle groups
        MuscleGroup.CHEST,
        MuscleGroup.FRONT_DELTS,
        MuscleGroup.SIDE_DELTS,
        MuscleGroup.TRICEPS,
        MuscleGroup.LATS,
        MuscleGroup.UPPER_BACK,
        MuscleGroup.REAR_DELTS,
        MuscleGroup.BICEPS,
        MuscleGroup.ABS,
        MuscleGroup.OBLIQUES,
        MuscleGroup.LOWER_BACK,
        MuscleGroup.QUADS,
        MuscleGroup.HAMSTRINGS,
        MuscleGroup.GLUTES,
        MuscleGroup.CALVES,
    ],
    WorkoutFocus.CHEST_TRICEPS: [
        MuscleGroup.CHEST,
        MuscleGroup.FRONT_DELTS,
        MuscleGroup.TRICEPS,
    ],
    WorkoutFocus.BACK_BICEPS: [
        MuscleGroup.LATS,
        MuscleGroup.UPPER_BACK,
        MuscleGroup.REAR_DELTS,
        MuscleGroup.BICEPS,
    ],
    WorkoutFocus.PUSH: [
        # Push movements: chest, shoulders, triceps
        MuscleGroup.CHEST,
        MuscleGroup.FRONT_DELTS,
        MuscleGroup.SIDE_DELTS,
        MuscleGroup.TRICEPS,
    ],
    WorkoutFocus.PULL: [
        # Pull movements: back, rear delts, biceps
        MuscleGroup.LATS,
        MuscleGroup.UPPER_BACK,
        MuscleGroup.REAR_DELTS,
        MuscleGroup.BICEPS,
        MuscleGroup.FOREARMS,
    ],
}


def get_muscle_groups_for_focus(focus: str | WorkoutFocus) -> list[str]:
    """
    Get the list of muscle groups for a given workout focus.

    Args:
        focus: A WorkoutFocus choice value (string or enum member)

    Returns:
        List of MuscleGroup choice values (strings)
    """
    # Normalize focus to enum member for dictionary lookup
    if isinstance(focus, str):
        # Try to find matching enum member
        try:
            focus_enum = WorkoutFocus(focus)
        except ValueError:
            # If not a valid focus, return empty list
            return []
    else:
        focus_enum = focus

    muscle_groups = WORKOUT_FOCUS_TO_MUSCLE_GROUPS.get(focus_enum, [])
    # Convert enum members to their string values
    return [mg.value if hasattr(mg, "value") else str(mg) for mg in muscle_groups]
