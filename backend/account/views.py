from __future__ import annotations

from typing import TYPE_CHECKING, Any

from django.conf import settings
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from account.serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)

if TYPE_CHECKING:
    from rest_framework.request import Request


def set_jwt_cookies(
    response: Response,
    access_token: str,
    refresh_token: str,
) -> Response:
    """
    Set JWT access and refresh tokens as HttpOnly cookies on the response.

    Args:
        response: The DRF Response object to add cookies to.
        access_token: The JWT access token string.
        refresh_token: The JWT refresh token string.

    Returns:
        The response with cookies set.
    """
    # Set access token cookie
    response.set_cookie(
        key=settings.JWT_ACCESS_COOKIE_NAME,
        value=access_token,
        httponly=settings.JWT_COOKIE_HTTPONLY,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
    )

    # Set refresh token cookie
    response.set_cookie(
        key=settings.JWT_REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=settings.JWT_COOKIE_HTTPONLY,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
    )

    return response


def clear_jwt_cookies(response: Response) -> Response:
    """
    Clear JWT cookies from the response.

    Args:
        response: The DRF Response object to clear cookies from.

    Returns:
        The response with cookies cleared.
    """
    response.delete_cookie(
        key=settings.JWT_ACCESS_COOKIE_NAME,
        samesite=settings.JWT_COOKIE_SAMESITE,
    )
    response.delete_cookie(
        key=settings.JWT_REFRESH_COOKIE_NAME,
        samesite=settings.JWT_COOKIE_SAMESITE,
    )
    return response


class RegisterView(APIView):
    """
    POST /api/auth/register/

    Create a new user account and optionally log them in by issuing JWT cookies.
    """

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Prepare response with user data
        user_data = UserSerializer(user).data
        response = Response(
            {
                "message": "Registration successful.",
                "user": user_data,
            },
            status=status.HTTP_201_CREATED,
        )

        # Set JWT cookies
        return set_jwt_cookies(response, access_token, refresh_token)


class LoginView(APIView):
    """
    POST /api/auth/login/

    Authenticate a user with email and password, and issue JWT cookies.
    """

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Prepare response with user data
        user_data = UserSerializer(user).data
        response = Response(
            {
                "message": "Login successful.",
                "user": user_data,
            },
            status=status.HTTP_200_OK,
        )

        # Set JWT cookies
        return set_jwt_cookies(response, access_token, refresh_token)


class LogoutView(APIView):
    """
    POST /api/auth/logout/

    Log out the current user by blacklisting their refresh token and clearing cookies.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        # Get the refresh token from cookies
        refresh_token = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)

        response = Response(
            {"message": "Logout successful."},
            status=status.HTTP_200_OK,
        )

        # Blacklist the refresh token if it exists
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (InvalidToken, TokenError):
                # Token is already invalid or blacklisted - that's fine
                pass

        # Clear JWT cookies
        return clear_jwt_cookies(response)


class CookieTokenRefreshView(APIView):
    """
    POST /api/auth/refresh/

    Refresh the access token using the refresh token from cookies.
    This endpoint reads the refresh token from an HttpOnly cookie,
    validates it, and issues a new access token (also via cookie).

    If token rotation is enabled, a new refresh token is also issued.
    """

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        # Get the refresh token from cookies
        refresh_token = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)

        if not refresh_token:
            return Response(
                {"error": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            # Validate and rotate the refresh token
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            response = Response(
                {"message": "Token refreshed successfully."},
                status=status.HTTP_200_OK,
            )

            # If rotation is enabled, get the new refresh token
            if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS", False):
                # Get the user from the token
                from django.contrib.auth import get_user_model

                User = get_user_model()
                user_id = refresh.payload.get("user_id")
                user = User.objects.get(id=user_id)

                # Blacklist the old token if blacklisting is enabled
                if settings.SIMPLE_JWT.get("BLACKLIST_AFTER_ROTATION", False):
                    try:
                        refresh.blacklist()
                    except AttributeError:
                        # Blacklist app not installed
                        pass

                # Create a new refresh token for the user
                new_refresh = RefreshToken.for_user(user)
                new_refresh_token = str(new_refresh)
                access_token = str(new_refresh.access_token)
            else:
                new_refresh_token = refresh_token

            return set_jwt_cookies(response, access_token, new_refresh_token)

        except (InvalidToken, TokenError) as e:
            response = Response(
                {"error": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            return clear_jwt_cookies(response)


class CurrentUserView(APIView):
    """
    GET /api/auth/me/

    Return the currently authenticated user's information.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfileView(APIView):
    """
    GET /api/profile/

    Example protected endpoint that returns the user's profile.
    Demonstrates how to create authenticated endpoints.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        user = request.user
        return Response(
            {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "is_staff": user.is_staff,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat(),
            },
            status=status.HTTP_200_OK,
        )


class CSRFTokenView(APIView):
    """
    GET /api/auth/csrf/

    Set the CSRF cookie and return the token value.
    The frontend can call this endpoint to obtain a CSRF token
    before making unsafe requests (POST, PUT, DELETE, etc.).
    """

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        # This will set the CSRF cookie
        csrf_token = get_token(request)
        return Response(
            {"csrfToken": csrf_token},
            status=status.HTTP_200_OK,
        )
