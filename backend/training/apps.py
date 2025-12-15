from django.apps import AppConfig


class TrainingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "training"

    def ready(self) -> None:
        """Import signals when the app is ready."""
        import training.signals  # noqa: F401

