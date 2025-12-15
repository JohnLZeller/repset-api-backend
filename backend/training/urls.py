from django.urls import path

from training.views import TrainingPreferencesView

urlpatterns = [
    path("preferences/training/", TrainingPreferencesView.as_view(), name="training_preferences"),
]

