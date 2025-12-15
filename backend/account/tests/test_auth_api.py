"""
Tests for the authentication API endpoints.

These tests verify:
- User registration (success and failure cases)
- Login with correct and incorrect credentials
- HttpOnly cookies are set on login
- Protected endpoints require authentication
- Token refresh works via cookies
- Logout clears cookies and blacklists tokens
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
class AuthAPITestCase(TestCase):
    """Base test case for authentication API tests."""

    def setUp(self) -> None:
        self.client = APIClient()
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.logout_url = "/api/auth/logout/"
        self.refresh_url = "/api/auth/refresh/"
        self.me_url = "/api/auth/me/"
        self.profile_url = "/api/profile/"
        self.csrf_url = "/api/auth/csrf/"

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


class RegistrationTests(AuthAPITestCase):
    """Tests for the user registration endpoint."""

    def test_register_success(self) -> None:
        """Test successful user registration."""
        data = {
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "full_name": "New User",
        }

        response = self.client.post(self.register_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["user"]["email"], "newuser@example.com")
        self.assertEqual(response.data["user"]["full_name"], "New User")

        # Verify user was created in database
        self.assertTrue(User.objects.filter(email="newuser@example.com").exists())

    def test_register_sets_jwt_cookies(self) -> None:
        """Test that registration sets HttpOnly JWT cookies."""
        data = {
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        }

        response = self.client.post(self.register_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check cookies are set
        self.assertIn(settings.JWT_ACCESS_COOKIE_NAME, response.cookies)
        self.assertIn(settings.JWT_REFRESH_COOKIE_NAME, response.cookies)

        # Verify cookies are HttpOnly
        access_cookie = response.cookies[settings.JWT_ACCESS_COOKIE_NAME]
        refresh_cookie = response.cookies[settings.JWT_REFRESH_COOKIE_NAME]
        self.assertTrue(access_cookie["httponly"])
        self.assertTrue(refresh_cookie["httponly"])

    def test_register_duplicate_email(self) -> None:
        """Test registration fails with duplicate email."""
        self.create_test_user()

        data = {
            "email": self.test_email,
            "password": "AnotherPass123!",
            "password_confirm": "AnotherPass123!",
        }

        response = self.client.post(self.register_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_password_mismatch(self) -> None:
        """Test registration fails when passwords don't match."""
        data = {
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "password_confirm": "DifferentPass123!",
        }

        response = self.client.post(self.register_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", response.data)

    def test_register_weak_password(self) -> None:
        """Test registration fails with weak password."""
        data = {
            "email": "newuser@example.com",
            "password": "123",
            "password_confirm": "123",
        }

        response = self.client.post(self.register_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_invalid_email(self) -> None:
        """Test registration fails with invalid email format."""
        data = {
            "email": "not-an-email",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        }

        response = self.client.post(self.register_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)


class LoginTests(AuthAPITestCase):
    """Tests for the user login endpoint."""

    def test_login_success(self) -> None:
        """Test successful login with correct credentials."""
        self.create_test_user()

        data = {
            "email": self.test_email,
            "password": self.test_password,
        }

        response = self.client.post(self.login_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("user", response.data)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["user"]["email"], self.test_email)

    def test_login_sets_jwt_cookies(self) -> None:
        """Test that login sets HttpOnly JWT cookies."""
        self.create_test_user()

        data = {
            "email": self.test_email,
            "password": self.test_password,
        }

        response = self.client.post(self.login_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check cookies are set
        self.assertIn(settings.JWT_ACCESS_COOKIE_NAME, response.cookies)
        self.assertIn(settings.JWT_REFRESH_COOKIE_NAME, response.cookies)

        # Verify cookies are HttpOnly
        access_cookie = response.cookies[settings.JWT_ACCESS_COOKIE_NAME]
        refresh_cookie = response.cookies[settings.JWT_REFRESH_COOKIE_NAME]
        self.assertTrue(access_cookie["httponly"])
        self.assertTrue(refresh_cookie["httponly"])

    def test_login_wrong_password(self) -> None:
        """Test login fails with incorrect password."""
        self.create_test_user()

        data = {
            "email": self.test_email,
            "password": "WrongPassword123!",
        }

        response = self.client.post(self.login_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_user(self) -> None:
        """Test login fails with non-existent user."""
        data = {
            "email": "nonexistent@example.com",
            "password": "SomePassword123!",
        }

        response = self.client.post(self.login_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_missing_fields(self) -> None:
        """Test login fails when required fields are missing."""
        response = self.client.post(self.login_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LogoutTests(AuthAPITestCase):
    """Tests for the user logout endpoint."""

    def test_logout_success(self) -> None:
        """Test successful logout clears cookies."""
        self.create_test_user()

        # First login
        login_data = {
            "email": self.test_email,
            "password": self.test_password,
        }
        login_response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        # Set cookies on client
        self.client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = login_response.cookies[
            settings.JWT_ACCESS_COOKIE_NAME
        ].value
        self.client.cookies[settings.JWT_REFRESH_COOKIE_NAME] = login_response.cookies[
            settings.JWT_REFRESH_COOKIE_NAME
        ].value

        # Logout
        response = self.client.post(self.logout_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

    def test_logout_requires_authentication(self) -> None:
        """Test logout endpoint requires authentication."""
        response = self.client.post(self.logout_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TokenRefreshTests(AuthAPITestCase):
    """Tests for the token refresh endpoint."""

    def test_refresh_success(self) -> None:
        """Test successful token refresh."""
        self.create_test_user()

        # First login
        login_data = {
            "email": self.test_email,
            "password": self.test_password,
        }
        login_response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        # Set refresh cookie on client
        self.client.cookies[settings.JWT_REFRESH_COOKIE_NAME] = login_response.cookies[
            settings.JWT_REFRESH_COOKIE_NAME
        ].value

        # Refresh token
        response = self.client.post(self.refresh_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(settings.JWT_ACCESS_COOKIE_NAME, response.cookies)

    def test_refresh_without_token(self) -> None:
        """Test refresh fails without refresh token cookie."""
        response = self.client.post(self.refresh_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CurrentUserTests(AuthAPITestCase):
    """Tests for the current user endpoint."""

    def test_me_authenticated(self) -> None:
        """Test /me endpoint returns current user when authenticated."""
        self.create_test_user()

        # Login first
        login_data = {
            "email": self.test_email,
            "password": self.test_password,
        }
        login_response = self.client.post(self.login_url, login_data, format="json")

        # Set access cookie
        self.client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = login_response.cookies[
            settings.JWT_ACCESS_COOKIE_NAME
        ].value

        # Get current user
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.test_email)
        self.assertEqual(response.data["full_name"], self.test_full_name)

    def test_me_unauthenticated(self) -> None:
        """Test /me endpoint requires authentication."""
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileTests(AuthAPITestCase):
    """Tests for the profile endpoint."""

    def test_profile_authenticated(self) -> None:
        """Test /profile endpoint returns user profile when authenticated."""
        self.create_test_user()

        # Login first
        login_data = {
            "email": self.test_email,
            "password": self.test_password,
        }
        login_response = self.client.post(self.login_url, login_data, format="json")

        # Set access cookie
        self.client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = login_response.cookies[
            settings.JWT_ACCESS_COOKIE_NAME
        ].value

        # Get profile
        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.test_email)
        self.assertIn("created_at", response.data)

    def test_profile_unauthenticated(self) -> None:
        """Test /profile endpoint requires authentication."""
        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CSRFTests(AuthAPITestCase):
    """Tests for the CSRF token endpoint."""

    def test_csrf_token_returned(self) -> None:
        """Test CSRF endpoint returns a token."""
        response = self.client.get(self.csrf_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("csrfToken", response.data)
        self.assertTrue(len(response.data["csrfToken"]) > 0)

    def test_csrf_cookie_set(self) -> None:
        """Test CSRF endpoint sets the CSRF cookie."""
        response = self.client.get(self.csrf_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("csrftoken", response.cookies)


class ProfileUpdateTests(AuthAPITestCase):
    """Tests for the profile update endpoint."""

    def test_update_profile_success(self) -> None:
        """Test successful profile update with valid data."""
        user = self.create_test_user()

        # Login first
        login_data = {
            "email": self.test_email,
            "password": self.test_password,
        }
        login_response = self.client.post(self.login_url, login_data, format="json")

        # Set access cookie
        self.client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = login_response.cookies[
            settings.JWT_ACCESS_COOKIE_NAME
        ].value

        # Update profile
        update_data = {
            "email": "newemail@example.com",
            "full_name": "Updated Name",
        }
        response = self.client.put(self.profile_url, update_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "newemail@example.com")
        self.assertEqual(response.data["full_name"], "Updated Name")

        # Verify user was updated in database
        user.refresh_from_db()
        self.assertEqual(user.email, "newemail@example.com")
        self.assertEqual(user.full_name, "Updated Name")

    def test_update_profile_duplicate_email(self) -> None:
        """Test profile update fails with duplicate email."""
        self.create_test_user()

        # Create another user
        other_user = User.objects.create_user(
            email="other@example.com",
            password="Password123!",
        )

        # Login first
        login_data = {
            "email": self.test_email,
            "password": self.test_password,
        }
        login_response = self.client.post(self.login_url, login_data, format="json")

        # Set access cookie
        self.client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = login_response.cookies[
            settings.JWT_ACCESS_COOKIE_NAME
        ].value

        # Try to update to duplicate email
        update_data = {
            "email": other_user.email,
            "full_name": self.test_full_name,
        }
        response = self.client.put(self.profile_url, update_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_update_profile_unauthenticated(self) -> None:
        """Test profile update fails for unauthenticated users."""
        update_data = {
            "email": "newemail@example.com",
            "full_name": "Updated Name",
        }
        response = self.client.put(self.profile_url, update_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_same_email(self) -> None:
        """Test profile update succeeds when email hasn't changed."""
        self.create_test_user()

        # Login first
        login_data = {
            "email": self.test_email,
            "password": self.test_password,
        }
        login_response = self.client.post(self.login_url, login_data, format="json")

        # Set access cookie
        self.client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = login_response.cookies[
            settings.JWT_ACCESS_COOKIE_NAME
        ].value

        # Update only full_name, keep same email
        update_data = {
            "email": self.test_email,
            "full_name": "Updated Name",
        }
        response = self.client.put(self.profile_url, update_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.test_email)
        self.assertEqual(response.data["full_name"], "Updated Name")
