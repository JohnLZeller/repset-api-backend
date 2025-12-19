from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from training.models import UserTrainingPreferences

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_training_preferences(
    sender: type[User],
    instance: User,
    created: bool,
    **kwargs: dict,
) -> None:
    """Create UserTrainingPreferences when a new user is created."""
    if created:
        UserTrainingPreferences.objects.create(user=instance)


