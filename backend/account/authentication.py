from __future__ import annotations

from typing import TYPE_CHECKING

from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

if TYPE_CHECKING:
    from rest_framework.request import Request
    from rest_framework_simplejwt.tokens import Token

    from account.models import User


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that reads the access token from HttpOnly cookie.

    This provides better security for browser-based clients by preventing
    JavaScript access to the token, protecting against XSS attacks.
    """

    def authenticate(self, request: Request) -> tuple[User, Token] | None:
        """
        Authenticate the request using the JWT access token from cookies.

        Returns a tuple of (user, validated_token) if authentication succeeds,
        or None if no token is present.

        Raises InvalidToken if the token is present but invalid.
        """
        # Get the access token from the cookie
        raw_token = request.COOKIES.get(settings.JWT_ACCESS_COOKIE_NAME)

        if raw_token is None:
            # No token present - let other authentication classes handle it
            return None

        # Validate the token
        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            # Token is invalid - raise the exception to return 401
            raise

        # Get the user from the token
        user = self.get_user(validated_token)

        return user, validated_token
