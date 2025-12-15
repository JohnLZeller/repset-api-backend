from django.urls import path

from account.views import (
    CookieTokenRefreshView,
    CSRFTokenView,
    CurrentUserView,
    LoginView,
    LogoutView,
    ProfileView,
    RegisterView,
    TrainingPreferencesView,
)

urlpatterns = [
    # Authentication endpoints
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", CurrentUserView.as_view(), name="current_user"),
    path("auth/csrf/", CSRFTokenView.as_view(), name="csrf_token"),
    # Profile endpoint
    path("profile/", ProfileView.as_view(), name="profile"),
    # Training preferences endpoint
    path("preferences/training/", TrainingPreferencesView.as_view(), name="training_preferences"),
]
