from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Extended User model with XP and level tracking"""
    image = models.URLField(max_length=500, blank=True, null=True)
    level = models.IntegerField(default=1)
    xp = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username


class StudyGroup(models.Model):
    """Study groups for collaborative learning"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    name = models.CharField(max_length=200)
    subject = models.CharField(max_length=100)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    members = models.ManyToManyField(User, through='GroupMembership', related_name='joined_groups')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'study_groups'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class StudySession(models.Model):
    """Study sessions organized by users"""
    title = models.CharField(max_length=200)
    course_code = models.CharField(max_length=50)
    description = models.TextField()
    date = models.CharField(max_length=100)  # Store as string for flexibility
    time = models.CharField(max_length=100)  # Store as string like "8:00 AM - 10:00 AM"
    location = models.CharField(max_length=200)
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_sessions')
    group = models.ForeignKey(StudyGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name='sessions')
    attendees = models.ManyToManyField(User, through='SessionRSVP', related_name='attending_sessions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'study_sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.course_code} - {self.title}"


class SessionRSVP(models.Model):
    """Many-to-many relationship for session attendance"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'session_rsvps'
        unique_together = ['user', 'session']

    def __str__(self):
        return f"{self.user.username} -> {self.session.title}"


class GroupMembership(models.Model):
    """Many-to-many relationship for group membership"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_memberships'
        unique_together = ['user', 'group']

    def __str__(self):
        return f"{self.user.username} -> {self.group.name}"


class Badge(models.Model):
    """User achievements and badges"""
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50)
    color = models.CharField(max_length=50)
    bg_color = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'badges'
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.user.username} - {self.name}"
