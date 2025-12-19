from __future__ import annotations

from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from training.models import UserTrainingPreferences
from training.serializers import TrainingPreferencesSerializer

if TYPE_CHECKING:
    from rest_framework.request import Request


class TrainingPreferencesView(APIView):
    """
    GET /api/preferences/training/
    PUT /api/preferences/training/

    Get or update the authenticated user's training preferences.
    Auto-creates preferences if they don't exist.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        """Return the authenticated user's training preferences."""
        preferences, created = UserTrainingPreferences.objects.get_or_create(
            user=request.user
        )
        serializer = TrainingPreferencesSerializer(preferences)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request: Request) -> Response:
        """Update the authenticated user's training preferences."""
        preferences, created = UserTrainingPreferences.objects.get_or_create(
            user=request.user
        )
        serializer = TrainingPreferencesSerializer(
            preferences, data=request.data, partial=False
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


