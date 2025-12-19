"""
Tests for the change password API endpoint.

These tests verify:
- Authenticated users can change their password with correct current password
- Incorrect current password is rejected
- New password and confirmation must match
- New password cannot be the same as current password
- Weak passwords are rejected by Django validators
- Unauthenticated requests are rejected
- New JWT tokens are issued after password change
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


@override_settings(
    # Use a simple secret key for testing
    SECRET_KEY="test-secret-key-for-testing-only",
    # Disable secure cookies for testing
    JWT_COOKIE_SECURE=False,
)
class ChangePasswordTestCase(TestCase):
    """Tests for the change password endpoint."""

    def setUp(self) -> None:
        self.client = APIClient()
        self.change_password_url = "/api/auth/password/change/"
        self.login_url = "/api/auth/login/"

        # Test user credentials
        self.test_email = "test@example.com"
        self.test_password = "SecurePass123!"
        self.new_password = "NewSecurePass456!"
        self.test_full_name = "Test User"

        # Create and authenticate test user
        self.user = User.objects.create_user(
            email=self.test_email,
            password=self.test_password,
            full_name=self.test_full_name,
        )

    def login_user(self) -> None:
        """Log in the test user and set JWT cookies on the client."""
        login_response = self.client.post(
            self.login_url,
            {"email": self.test_email, "password": self.test_password},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        # Set cookies on client
        self.client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = login_response.cookies[
            settings.JWT_ACCESS_COOKIE_NAME
        ].value
        self.client.cookies[settings.JWT_REFRESH_COOKIE_NAME] = login_response.cookies[
            settings.JWT_REFRESH_COOKIE_NAME
        ].value

    def test_change_password_success(self) -> None:
        """Test successful password change with valid current password."""
        self.login_user()

        data = {
            "current_password": self.test_password,
            "new_password": self.new_password,
            "new_password_confirm": self.new_password,
        }

        response = self.client.post(self.change_password_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "Password changed successfully.")

        # Verify new JWT cookies are issued
        self.assertIn(settings.JWT_ACCESS_COOKIE_NAME, response.cookies)
        self.assertIn(settings.JWT_REFRESH_COOKIE_NAME, response.cookies)

        # Verify the password was actually changed by attempting login with new password
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.new_password))

        # Verify old password no longer works
        self.assertFalse(self.user.check_password(self.test_password))

    def test_change_password_wrong_current_password(self) -> None:
        """Test password change fails with incorrect current password."""
        self.login_user()

        data = {
            "current_password": "WrongPassword123!",
            "new_password": self.new_password,
            "new_password_confirm": self.new_password,
        }

        response = self.client.post(self.change_password_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("current_password", response.data)

        # Verify password was not changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.test_password))

    def test_change_password_mismatch(self) -> None:
        """Test password change fails when new passwords don't match."""
        self.login_user()

        data = {
            "current_password": self.test_password,
            "new_password": self.new_password,
            "new_password_confirm": "DifferentPassword789!",
        }

        response = self.client.post(self.change_password_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password_confirm", response.data)

        # Verify password was not changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.test_password))

    def test_change_password_same_as_old(self) -> None:
        """Test password change fails when new password is same as current."""
        self.login_user()

        data = {
            "current_password": self.test_password,
            "new_password": self.test_password,
            "new_password_confirm": self.test_password,
        }

        response = self.client.post(self.change_password_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)

    def test_change_password_weak_password(self) -> None:
        """Test password change fails with weak password (Django validators)."""
        self.login_user()

        data = {
            "current_password": self.test_password,
            "new_password": "123",  # Too short and too common
            "new_password_confirm": "123",
        }

        response = self.client.post(self.change_password_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Should have errors related to password strength
        self.assertIn("new_password", response.data)

    def test_change_password_common_password(self) -> None:
        """Test password change fails with common password."""
        self.login_user()

        data = {
            "current_password": self.test_password,
            "new_password": "password123",  # Common password
            "new_password_confirm": "password123",
        }

        response = self.client.post(self.change_password_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)

    def test_change_password_unauthenticated(self) -> None:
        """Test password change fails for unauthenticated users."""
        # Don't log in - make request without authentication

        data = {
            "current_password": self.test_password,
            "new_password": self.new_password,
            "new_password_confirm": self.new_password,
        }

        response = self.client.post(self.change_password_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password_missing_fields(self) -> None:
        """Test password change fails when required fields are missing."""
        self.login_user()

        # Missing new_password_confirm
        data = {
            "current_password": self.test_password,
            "new_password": self.new_password,
        }

        response = self.client.post(self.change_password_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_can_login_with_new_password(self) -> None:
        """Test that user can log in with new password after changing it."""
        self.login_user()

        data = {
            "current_password": self.test_password,
            "new_password": self.new_password,
            "new_password_confirm": self.new_password,
        }

        response = self.client.post(self.change_password_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Clear cookies and try to login with new password
        self.client.cookies.clear()

        login_response = self.client.post(
            self.login_url,
            {"email": self.test_email, "password": self.new_password},
            format="json",
        )

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("user", login_response.data)


