from django.urls import path

from account.views import (
    ChangePasswordView,
    CookieTokenRefreshView,
    CSRFTokenView,
    CurrentUserView,
    LoginView,
    LogoutView,
    ProfileView,
    RegisterView,
)

urlpatterns = [
    # Authentication endpoints
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", CurrentUserView.as_view(), name="current_user"),
    path("auth/csrf/", CSRFTokenView.as_view(), name="csrf_token"),
    path("auth/password/change/", ChangePasswordView.as_view(), name="change_password"),
    # Profile endpoint
    path("profile/", ProfileView.as_view(), name="profile"),
]
