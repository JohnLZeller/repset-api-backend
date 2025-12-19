from __future__ import annotations

from collections.abc import Iterable

from catalog.enums import (
    MajorMuscleGroup,
    MuscleGroup,
    WorkoutRegion,
    major_group_for,
    regions_for_muscle_groups,
)
from training.enums import MovementPattern


def derive_workout_label(
    muscle_groups: Iterable[MuscleGroup],
    movement_patterns: Iterable[MovementPattern] | None = None,
) -> str | None:
    """
    Generate a display label from muscle groups and movement patterns.

    Returns None if no clear label can be derived.

    Priority order:
    1. If movement pattern is PUSH and upper-body muscles dominate -> "Push"
    2. If movement pattern is PULL and upper-body muscles dominate -> "Pull"
    3. If muscle_groups include Chest + Triceps (no back/biceps) -> "Chest & Triceps"
    4. If muscle_groups include Back muscles + Biceps (no chest/triceps) -> "Back & Biceps"
    5. If regions include both UPPER_BODY and LOWER_BODY -> "Full Body"
    6. If only one major muscle group -> use that label (e.g., "Chest", "Back")
    7. Otherwise -> None
    """
    muscle_groups_list = list(muscle_groups)
    if not muscle_groups_list:
        return None

    # Get regions and major muscle groups
    regions = regions_for_muscle_groups(muscle_groups_list)
    major_groups = {major_group_for(mg) for mg in muscle_groups_list}

    # Rule 1 & 2: Check movement patterns for Push/Pull
    if movement_patterns:
        movement_patterns_list = list(movement_patterns)
        has_push = any(
            (mp == MovementPattern.PUSH)
            or (hasattr(mp, "value") and mp.value == "push")
            or (isinstance(mp, str) and mp == "push")
            for mp in movement_patterns_list
        )
        has_pull = any(
            (mp == MovementPattern.PULL)
            or (hasattr(mp, "value") and mp.value == "pull")
            or (isinstance(mp, str) and mp == "pull")
            for mp in movement_patterns_list
        )

        # Check if upper-body muscles dominate
        upper_body_majors = {
            MajorMuscleGroup.CHEST,
            MajorMuscleGroup.BACK,
            MajorMuscleGroup.SHOULDERS,
            MajorMuscleGroup.ARMS,
        }
        has_upper_body = bool(major_groups & upper_body_majors)
        has_lower_body = bool(
            major_groups & {MajorMuscleGroup.HIPS, MajorMuscleGroup.LEGS}
        )

        if has_push and has_upper_body and not has_lower_body:
            return "Push"
        if has_pull and has_upper_body and not has_lower_body:
            return "Pull"

    # Rule 3: Chest & Triceps (no back/biceps)
    has_chest = MuscleGroup.CHEST in muscle_groups_list
    has_triceps = MuscleGroup.TRICEPS in muscle_groups_list
    has_back = any(
        mg in muscle_groups_list for mg in [MuscleGroup.LATS, MuscleGroup.UPPER_BACK]
    )
    has_biceps = MuscleGroup.BICEPS in muscle_groups_list

    if has_chest and has_triceps and not has_back and not has_biceps:
        return "Chest & Triceps"

    # Rule 4: Back & Biceps (no chest/triceps)
    if has_back and has_biceps and not has_chest and not has_triceps:
        return "Back & Biceps"

    # Rule 5: Full Body
    if WorkoutRegion.FULL_BODY in regions:
        return "Full Body"

    # Rule 6: Single major muscle group
    if len(major_groups) == 1:
        major = next(iter(major_groups))
        return major.label

    # Rule 7: No clear label
    return None
