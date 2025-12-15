"""
Tests for the training preferences API endpoints.

These tests verify:
- Preferences are auto-created on user creation
- GET returns correct defaults
- GET auto-creates if missing
- PUT updates fields correctly
- Validation works for all fields
- Unauthorized users cannot access endpoints
"""

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from account.enums import EquipmentType, ExerciseAttribute
from account.models import UserTrainingPreferences

User = get_user_model()


@override_settings(
    # Use a simple secret key for testing
    SECRET_KEY="test-secret-key-for-testing-only",
    # Disable secure cookies for testing
    JWT_COOKIE_SECURE=False,
)
class TrainingPreferencesAPITestCase(TestCase):
    """Base test case for training preferences API tests."""

    def setUp(self) -> None:
        self.client = APIClient()
        self.preferences_url = "/api/preferences/training/"

        # Test user credentials
        self.test_email = "test@example.com"
        self.test_password = "SecurePass123!"
        self.test_full_name = "Test User"

    def create_test_user(self) -> User:
        """Create a test user for authentication tests."""
        return User.objects.create_user(
            email=self.test_email,
            password=self.test_password,
            full_name=self.test_full_name,
        )

    def login_user(self, user: User) -> None:
        """Login a user and set cookies on client."""
        login_data = {
            "email": self.test_email,
            "password": self.test_password,
        }
        login_response = self.client.post("/api/auth/login/", login_data, format="json")
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        # Set cookies on client
        from django.conf import settings

        self.client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = (
            login_response.cookies[settings.JWT_ACCESS_COOKIE_NAME].value
        )


class AutoCreationTests(TrainingPreferencesAPITestCase):
    """Tests for auto-creation of preferences on user creation."""

    def test_preferences_created_on_user_creation(self) -> None:
        """Test that preferences are created when a user is created."""
        user = self.create_test_user()
        self.assertTrue(
            UserTrainingPreferences.objects.filter(user=user).exists()
        )
        preferences = UserTrainingPreferences.objects.get(user=user)
        self.assertEqual(preferences.sessions_per_week, 3)
        self.assertEqual(preferences.training_intensity, 5)
        self.assertEqual(preferences.session_time_limit, 60)
        self.assertEqual(preferences.excluded_equipment, [])
        self.assertEqual(preferences.excluded_exercise_attributes, [])


class GETTests(TrainingPreferencesAPITestCase):
    """Tests for GET /api/preferences/training/ endpoint."""

    def test_get_returns_defaults(self) -> None:
        """Test GET returns correct default values."""
        user = self.create_test_user()
        self.login_user(user)

        response = self.client.get(self.preferences_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["sessions_per_week"], 3)
        self.assertEqual(response.data["training_intensity"], 5)
        self.assertEqual(response.data["session_time_limit"], 60)
        self.assertEqual(response.data["excluded_equipment"], [])
        self.assertEqual(response.data["excluded_exercise_attributes"], [])
        self.assertIn("updated_at", response.data)

    def test_get_auto_creates_if_missing(self) -> None:
        """Test GET auto-creates preferences if they don't exist."""
        user = self.create_test_user()
        # Delete preferences if they exist (from signal)
        UserTrainingPreferences.objects.filter(user=user).delete()
        self.login_user(user)

        response = self.client.get(self.preferences_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            UserTrainingPreferences.objects.filter(user=user).exists()
        )

    def test_get_requires_authentication(self) -> None:
        """Test GET endpoint requires authentication."""
        response = self.client.get(self.preferences_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PUTTests(TrainingPreferencesAPITestCase):
    """Tests for PUT /api/preferences/training/ endpoint."""

    def test_put_updates_all_fields(self) -> None:
        """Test PUT updates all fields correctly."""
        user = self.create_test_user()
        self.login_user(user)

        data = {
            "excluded_equipment": [EquipmentType.BARBELL, EquipmentType.DUMBBELL],
            "excluded_exercise_attributes": [
                ExerciseAttribute.REQUIRES_PARTNER,
                ExerciseAttribute.HIGH_IMPACT,
            ],
            "sessions_per_week": 5,
            "training_intensity": 8,
            "session_time_limit": 90,
        }

        response = self.client.put(self.preferences_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            set(response.data["excluded_equipment"]),
            {EquipmentType.BARBELL, EquipmentType.DUMBBELL},
        )
        self.assertEqual(
            set(response.data["excluded_exercise_attributes"]),
            {
                ExerciseAttribute.REQUIRES_PARTNER,
                ExerciseAttribute.HIGH_IMPACT,
            },
        )
        self.assertEqual(response.data["sessions_per_week"], 5)
        self.assertEqual(response.data["training_intensity"], 8)
        self.assertEqual(response.data["session_time_limit"], 90)

        # Verify in database
        preferences = UserTrainingPreferences.objects.get(user=user)
        self.assertEqual(
            set(preferences.excluded_equipment),
            {EquipmentType.BARBELL, EquipmentType.DUMBBELL},
        )
        self.assertEqual(preferences.sessions_per_week, 5)
        self.assertEqual(preferences.training_intensity, 8)
        self.assertEqual(preferences.session_time_limit, 90)

    def test_put_requires_authentication(self) -> None:
        """Test PUT endpoint requires authentication."""
        data = {
            "sessions_per_week": 4,
        }
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ValidationTests(TrainingPreferencesAPITestCase):
    """Tests for validation of preference fields."""

    def setUp(self) -> None:
        super().setUp()
        self.user = self.create_test_user()
        self.login_user(self.user)

    def test_validate_training_intensity_range(self) -> None:
        """Test training_intensity must be between 1 and 10."""
        # Test too low
        data = {"training_intensity": 0}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test too high
        data = {"training_intensity": 11}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test valid range
        for intensity in [1, 5, 10]:
            data = {"training_intensity": intensity}
            response = self.client.put(self.preferences_url, data, format="json")
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_validate_sessions_per_week_positive(self) -> None:
        """Test sessions_per_week must be positive."""
        data = {"sessions_per_week": 0}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {"sessions_per_week": -1}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {"sessions_per_week": 1}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_validate_session_time_limit_positive(self) -> None:
        """Test session_time_limit must be positive."""
        data = {"session_time_limit": 0}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {"session_time_limit": -1}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {"session_time_limit": 1}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_validate_excluded_equipment_choices(self) -> None:
        """Test excluded_equipment must contain valid choices."""
        data = {"excluded_equipment": ["invalid_equipment"]}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {"excluded_equipment": [EquipmentType.BARBELL]}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_validate_excluded_exercise_attributes_choices(self) -> None:
        """Test excluded_exercise_attributes must contain valid choices."""
        data = {"excluded_exercise_attributes": ["invalid_attribute"]}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {
            "excluded_exercise_attributes": [ExerciseAttribute.REQUIRES_PARTNER]
        }
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserIsolationTests(TrainingPreferencesAPITestCase):
    """Tests that users can only access their own preferences."""

    def test_user_can_only_access_own_preferences(self) -> None:
        """Test that a user can only access their own preferences."""
        user1 = self.create_test_user()
        user2 = User.objects.create_user(
            email="user2@example.com",
            password="SecurePass123!",
        )

        # Login as user1
        login_data = {
            "email": self.test_email,
            "password": self.test_password,
        }
        login_response = self.client.post("/api/auth/login/", login_data, format="json")
        from django.conf import settings

        self.client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = (
            login_response.cookies[settings.JWT_ACCESS_COOKIE_NAME].value
        )

        # Get preferences - should return user1's preferences
        response = self.client.get(self.preferences_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Update preferences
        data = {"sessions_per_week": 7}
        response = self.client.put(self.preferences_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify user1's preferences were updated
        prefs1 = UserTrainingPreferences.objects.get(user=user1)
        self.assertEqual(prefs1.sessions_per_week, 7)

        # Verify user2's preferences were not affected
        prefs2 = UserTrainingPreferences.objects.get(user=user2)
        self.assertEqual(prefs2.sessions_per_week, 3)  # default

