from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, 
    LoginView, 
    CurrentUserView, 
    GoogleLoginView, 
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetVerifyView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('google/', GoogleLoginView.as_view(), name='google-login'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/verify/', PasswordResetVerifyView.as_view(), name='password-reset-verify'),
]
