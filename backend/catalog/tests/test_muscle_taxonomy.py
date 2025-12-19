from django.test import TestCase

from catalog.enums import (
    MAJOR_GROUP_TO_REGION,
    MUSCLE_GROUP_TO_MAJOR_GROUP,
    MajorMuscleGroup,
    MuscleGroup,
    WorkoutRegion,
    major_group_for,
    primary_region_for_workout,
    region_for_major_group,
    regions_for_muscle_groups,
)


class MuscleTaxonomyMappingTests(TestCase):
    """Test mapping completeness and correctness."""

    def test_every_muscle_group_has_major_group_mapping(self):
        """Every MuscleGroup must exist in MUSCLE_GROUP_TO_MAJOR_GROUP."""
        for muscle_group in MuscleGroup:
            self.assertIn(
                muscle_group,
                MUSCLE_GROUP_TO_MAJOR_GROUP,
                f"{muscle_group} is missing from MUSCLE_GROUP_TO_MAJOR_GROUP",
            )

    def test_major_group_mapping_values_are_valid(self):
        """All mapping values must be valid MajorMuscleGroup members."""
        for muscle_group, major_group in MUSCLE_GROUP_TO_MAJOR_GROUP.items():
            self.assertIn(
                major_group,
                MajorMuscleGroup,
                f"{muscle_group} maps to invalid MajorMuscleGroup: {major_group}",
            )

    def test_every_major_group_has_region_mapping(self):
        """Every MajorMuscleGroup must exist in MAJOR_GROUP_TO_REGION."""
        for major_group in MajorMuscleGroup:
            self.assertIn(
                major_group,
                MAJOR_GROUP_TO_REGION,
                f"{major_group} is missing from MAJOR_GROUP_TO_REGION",
            )

    def test_region_mapping_values_are_valid(self):
        """All mapping values must be valid WorkoutRegion members."""
        for major_group, region in MAJOR_GROUP_TO_REGION.items():
            self.assertIn(
                region,
                WorkoutRegion,
                f"{major_group} maps to invalid WorkoutRegion: {region}",
            )

    def test_major_group_for_helper(self):
        """Test major_group_for() helper function."""
        self.assertEqual(major_group_for(MuscleGroup.CHEST), MajorMuscleGroup.CHEST)
        self.assertEqual(major_group_for(MuscleGroup.LATS), MajorMuscleGroup.BACK)
        self.assertEqual(
            major_group_for(MuscleGroup.FRONT_DELTS), MajorMuscleGroup.SHOULDERS
        )
        self.assertEqual(major_group_for(MuscleGroup.BICEPS), MajorMuscleGroup.ARMS)
        self.assertEqual(major_group_for(MuscleGroup.ABS), MajorMuscleGroup.CORE)
        self.assertEqual(major_group_for(MuscleGroup.GLUTES), MajorMuscleGroup.HIPS)
        self.assertEqual(major_group_for(MuscleGroup.QUADS), MajorMuscleGroup.LEGS)

    def test_region_for_major_group_helper(self):
        """Test region_for_major_group() helper function."""
        self.assertEqual(
            region_for_major_group(MajorMuscleGroup.CHEST),
            WorkoutRegion.UPPER_BODY,
        )
        self.assertEqual(
            region_for_major_group(MajorMuscleGroup.CORE),
            WorkoutRegion.CORE,
        )
        self.assertEqual(
            region_for_major_group(MajorMuscleGroup.LEGS),
            WorkoutRegion.LOWER_BODY,
        )


class MuscleTaxonomyInferenceTests(TestCase):
    """Test region inference logic."""

    def test_chest_and_quads_returns_full_body(self):
        """CHEST + QUADS should return {FULL_BODY}."""
        groups = [MuscleGroup.CHEST, MuscleGroup.QUADS]
        regions = regions_for_muscle_groups(groups)
        self.assertEqual(regions, {WorkoutRegion.FULL_BODY})

    def test_chest_and_biceps_returns_upper_body(self):
        """CHEST + BICEPS should return {UPPER_BODY}."""
        groups = [MuscleGroup.CHEST, MuscleGroup.BICEPS]
        regions = regions_for_muscle_groups(groups)
        self.assertEqual(regions, {WorkoutRegion.UPPER_BODY})

    def test_abs_returns_core(self):
        """ABS should return {CORE}."""
        groups = [MuscleGroup.ABS]
        regions = regions_for_muscle_groups(groups)
        self.assertEqual(regions, {WorkoutRegion.CORE})

    def test_glutes_and_hamstrings_returns_lower_body(self):
        """GLUTES + HAMSTRINGS should return {LOWER_BODY}."""
        groups = [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS]
        regions = regions_for_muscle_groups(groups)
        self.assertEqual(regions, {WorkoutRegion.LOWER_BODY})

    def test_chest_and_abs_returns_both_regions(self):
        """CHEST + ABS should return {UPPER_BODY, CORE}."""
        groups = [MuscleGroup.CHEST, MuscleGroup.ABS]
        regions = regions_for_muscle_groups(groups)
        self.assertEqual(regions, {WorkoutRegion.UPPER_BODY, WorkoutRegion.CORE})

    def test_primary_region_full_body(self):
        """primary_region_for_workout returns FULL_BODY when both upper and lower present."""
        groups = [MuscleGroup.CHEST, MuscleGroup.QUADS]
        region = primary_region_for_workout(groups)
        self.assertEqual(region, WorkoutRegion.FULL_BODY)

    def test_primary_region_single_region(self):
        """primary_region_for_workout returns the single region when only one present."""
        groups = [MuscleGroup.CHEST]
        region = primary_region_for_workout(groups)
        self.assertEqual(region, WorkoutRegion.UPPER_BODY)

    def test_primary_region_priority_order(self):
        """primary_region_for_workout follows priority: UPPER_BODY > LOWER_BODY > CORE."""
        # UPPER_BODY + CORE -> UPPER_BODY
        groups = [MuscleGroup.CHEST, MuscleGroup.ABS]
        region = primary_region_for_workout(groups)
        self.assertEqual(region, WorkoutRegion.UPPER_BODY)

        # LOWER_BODY + CORE -> LOWER_BODY
        groups = [MuscleGroup.QUADS, MuscleGroup.ABS]
        region = primary_region_for_workout(groups)
        self.assertEqual(region, WorkoutRegion.LOWER_BODY)

        # CORE only -> CORE
        groups = [MuscleGroup.ABS]
        region = primary_region_for_workout(groups)
        self.assertEqual(region, WorkoutRegion.CORE)
