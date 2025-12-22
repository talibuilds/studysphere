from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, StudySession, StudyGroup, SessionRSVP, GroupMembership, Badge


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    list_display = ['username', 'email', 'first_name', 'last_name', 'xp', 'level', 'is_staff']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'level']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('StudySphere Info', {'fields': ('image', 'xp', 'level')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('StudySphere Info', {'fields': ('image', 'xp', 'level')}),
    )


@admin.register(StudyGroup)
class StudyGroupAdmin(admin.ModelAdmin):
    """StudyGroup admin"""
    list_display = ['name', 'subject', 'creator', 'status', 'members_count', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'subject', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def members_count(self, obj):
        return obj.members.count()
    members_count.short_description = 'Members'


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    """StudySession admin"""
    list_display = ['title', 'course_code', 'host', 'location', 'date', 'attendees_count', 'created_at']
    list_filter = ['created_at', 'date']
    search_fields = ['title', 'course_code', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def attendees_count(self, obj):
        return obj.attendees.count()
    attendees_count.short_description = 'Attendees'


@admin.register(SessionRSVP)
class SessionRSVPAdmin(admin.ModelAdmin):
    """SessionRSVP admin"""
    list_display = ['user', 'session', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'session__title']


@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    """GroupMembership admin"""
    list_display = ['user', 'group', 'joined_at']
    list_filter = ['joined_at']
    search_fields = ['user__username', 'group__name']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    """Badge admin"""
    list_display = ['name', 'user', 'earned_at']
    list_filter = ['name', 'earned_at']
    search_fields = ['user__username', 'name']
