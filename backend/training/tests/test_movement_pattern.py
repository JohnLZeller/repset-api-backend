from django.test import TestCase

from catalog.enums import MuscleGroup
from training.enums import MovementPattern
from training.mappings import derive_workout_label


class MovementPatternTests(TestCase):
    """Test MovementPattern enum stability."""

    def test_all_expected_movement_patterns_exist(self):
        """Verify all expected movement patterns are defined."""
        expected_patterns = {
            "push",
            "pull",
            "squat",
            "hinge",
            "lunge",
            "carry",
            "rotation",
            "anti_rotation",
            "locomotion",
        }
        actual_patterns = {mp.value for mp in MovementPattern}
        self.assertEqual(actual_patterns, expected_patterns)


class DerivedLabelTests(TestCase):
    """Test derive_workout_label() function."""

    def test_chest_and_triceps_returns_chest_triceps(self):
        """Chest + Triceps should return 'Chest & Triceps'."""
        groups = [MuscleGroup.CHEST, MuscleGroup.TRICEPS]
        label = derive_workout_label(groups)
        self.assertEqual(label, "Chest & Triceps")

    def test_back_and_biceps_returns_back_biceps(self):
        """Back muscles + Biceps should return 'Back & Biceps'."""
        groups = [MuscleGroup.LATS, MuscleGroup.BICEPS]
        label = derive_workout_label(groups)
        self.assertEqual(label, "Back & Biceps")

    def test_chest_and_quads_returns_full_body(self):
        """Chest + Quads should return 'Full Body'."""
        groups = [MuscleGroup.CHEST, MuscleGroup.QUADS]
        label = derive_workout_label(groups)
        self.assertEqual(label, "Full Body")

    def test_chest_with_push_returns_push(self):
        """Chest with PUSH movement pattern should return 'Push'."""
        groups = [MuscleGroup.CHEST]
        patterns = [MovementPattern.PUSH]
        label = derive_workout_label(groups, patterns)
        self.assertEqual(label, "Push")

    def test_back_with_pull_returns_pull(self):
        """Back muscles with PULL movement pattern should return 'Pull'."""
        groups = [MuscleGroup.LATS, MuscleGroup.UPPER_BACK]
        patterns = [MovementPattern.PULL]
        label = derive_workout_label(groups, patterns)
        self.assertEqual(label, "Pull")

    def test_single_major_muscle_group_returns_label(self):
        """Single major muscle group should return its label."""
        groups = [MuscleGroup.CHEST]
        label = derive_workout_label(groups)
        self.assertEqual(label, "Chest")

        groups = [MuscleGroup.LATS, MuscleGroup.UPPER_BACK]
        label = derive_workout_label(groups)
        self.assertEqual(label, "Back")

    def test_push_with_lower_body_does_not_return_push(self):
        """PUSH with lower body muscles should not return 'Push'."""
        groups = [MuscleGroup.QUADS]
        patterns = [MovementPattern.PUSH]
        label = derive_workout_label(groups, patterns)
        # Should not be "Push" since lower body dominates
        self.assertNotEqual(label, "Push")

    def test_pull_with_lower_body_does_not_return_pull(self):
        """PULL with lower body muscles should not return 'Pull'."""
        groups = [MuscleGroup.QUADS]
        patterns = [MovementPattern.PULL]
        label = derive_workout_label(groups, patterns)
        # Should not be "Pull" since lower body dominates
        self.assertNotEqual(label, "Pull")

    def test_chest_triceps_with_back_does_not_return_chest_triceps(self):
        """Chest + Triceps + Back should not return 'Chest & Triceps'."""
        groups = [MuscleGroup.CHEST, MuscleGroup.TRICEPS, MuscleGroup.LATS]
        label = derive_workout_label(groups)
        self.assertNotEqual(label, "Chest & Triceps")

    def test_empty_groups_returns_none(self):
        """Empty muscle groups should return None."""
        groups = []
        label = derive_workout_label(groups)
        self.assertIsNone(label)

    def test_complex_combination_returns_full_body(self):
        """Complex combination with upper and lower body should return 'Full Body'."""
        groups = [
            MuscleGroup.CHEST,
            MuscleGroup.LATS,
            MuscleGroup.QUADS,
            MuscleGroup.ABS,
        ]
        label = derive_workout_label(groups)
        # Should return "Full Body" due to rule 5 (both upper and lower body)
        self.assertEqual(label, "Full Body")
