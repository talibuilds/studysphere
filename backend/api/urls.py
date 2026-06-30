from rest_framework import routers
from django.urls import path, include
from .views import (
    StudySessionViewSet,
    StudyGroupViewSet,
    LeaderboardViewSet,
    DashboardViewSet,
    AdminViewSet,
    AdminUserViewSet,
    AdminSessionViewSet
)

router = routers.DefaultRouter()
router.register(r'sessions', StudySessionViewSet, basename='session')
router.register(r'groups', StudyGroupViewSet, basename='group')
router.register(r'leaderboard', LeaderboardViewSet, basename='leaderboard')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'admin/groups', AdminViewSet, basename='admin')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/sessions', AdminSessionViewSet, basename='admin-sessions')

urlpatterns = [
    path('', include(router.urls)),
]
