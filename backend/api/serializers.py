from rest_framework import serializers
from django.utils import timezone
from datetime import datetime
from .models import User, StudySession, StudyGroup, SessionRSVP, GroupMembership, Badge, SessionResource, SessionMessage


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'image', 'level', 'xp', 'created_at']
        read_only_fields = ['id', 'level', 'xp', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Detailed user profile with badges and groups"""
    badges = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'image', 'level', 'xp', 'is_staff', 'badges', 'groups', 'created_at']
        read_only_fields = ['id', 'level', 'xp', 'is_staff', 'created_at']
    
    def get_badges(self, obj):
        badges = obj.badges.all()
        return BadgeSerializer(badges, many=True).data
    
    def get_groups(self, obj):
        memberships = obj.joined_groups.filter(status='approved')
        return [{
            'id': group.id,
            'name': group.name,
            'members_count': group.members.count()
        } for group in memberships]


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for Badge model"""
    class Meta:
        model = Badge
        fields = ['id', 'name', 'icon', 'color', 'bg_color', 'earned_at']
        read_only_fields = ['id', 'earned_at']


class StudyGroupSerializer(serializers.ModelSerializer):
    """Serializer for StudyGroup with creator and member info"""
    creator_name = serializers.CharField(source='creator.username', read_only=True)
    members_count = serializers.SerializerMethodField()
    member_images = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    
    class Meta:
        model = StudyGroup
        fields = ['id', 'name', 'subject', 'description', 'creator', 'creator_name', 
                  'members_count', 'member_images', 'is_member', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'creator', 'status', 'created_at', 'updated_at']
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def get_member_images(self, obj):
        members = obj.members.all()[:3]
        return [member.image if member.image else f"https://api.dicebear.com/7.x/avataaars/svg?seed={member.username}" 
                for member in members]
    
    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False


class StudyGroupCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating study groups"""
    class Meta:
        model = StudyGroup
        fields = ['name', 'subject', 'description']


class StudySessionSerializer(serializers.ModelSerializer):
    """Serializer for StudySession with host and attendee info"""
    host_name = serializers.CharField(source='host.username', read_only=True)
    host_image = serializers.SerializerMethodField()
    group_name = serializers.CharField(source='group.name', read_only=True, allow_null=True)
    attendees_count = serializers.SerializerMethodField()
    attendees_list = serializers.SerializerMethodField()
    is_attending = serializers.SerializerMethodField()
    has_attended = serializers.SerializerMethodField()
    verification_code = serializers.SerializerMethodField()
    is_group_member = serializers.SerializerMethodField()
    
    class Meta:
        model = StudySession
        fields = ['id', 'title', 'course_code', 'description', 'date', 'time', 'location',
                  'host', 'host_name', 'host_image', 'group', 'group_name', 
                  'attendees_count', 'attendees_list', 'is_attending', 'has_attended', 'verification_code', 'is_group_member', 'created_at', 'updated_at']
        read_only_fields = ['id', 'host', 'created_at', 'updated_at']
        extra_kwargs = {
            'group': {'required': True, 'allow_null': False}
        }
    
    def get_is_group_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.group:
            return obj.group.members.filter(id=request.user.id).exists()
        return False
    
    def get_host_image(self, obj):
        if obj.host.image:
            return obj.host.image
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={obj.host.username}"
    
    def get_attendees_count(self, obj):
        return obj.attendees.count()
    
    def get_attendees_list(self, obj):
        attendees = obj.attendees.all()
        return [{
            'name': f"{attendee.first_name} {attendee.last_name}" if attendee.first_name else attendee.username,
            'image': attendee.image if attendee.image else f"https://api.dicebear.com/7.x/avataaars/svg?seed={attendee.username}"
        } for attendee in attendees]
    
    def get_is_attending(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(id=request.user.id).exists()
        return False

    def get_has_attended(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rsvp = SessionRSVP.objects.get(session=obj, user=request.user)
                return rsvp.attended
            except SessionRSVP.DoesNotExist:
                return False
        return False

    def get_verification_code(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user == obj.host:
            return obj.verification_code
        return None


class StudySessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating study sessions"""
    class Meta:
        model = StudySession
        fields = ['title', 'course_code', 'description', 'date', 'time', 'location', 'group']

    def validate(self, data):
        """Check that the session is not in the past"""
        date_str = data.get('date')
        time_str = data.get('time')

        if date_str and time_str:
            try:
                # Try to parse standard YYYY-MM-DD and HH:MM
                # Note: This assumes the frontend sends this format.
                # If using text inputs (like "Wednesday..."), this validation might need to be skipped or smarter.
                # But since we control the frontend form now, we expect ISO format.
                if '-' in date_str and ':' in time_str:
                     session_datetime = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
                     session_datetime = timezone.make_aware(session_datetime)
                     
                     if session_datetime < timezone.now():
                         raise serializers.ValidationError("Cannot create a study session for a date that has already passed.")
            except ValueError:
                # Iterate or ignore if format is different (e.g. legacy or free text)
                pass
        
        return data


class LeaderboardSerializer(serializers.ModelSerializer):
    """Serializer for leaderboard rankings"""
    badge = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'image', 'xp', 'level', 'badge']
    
    def get_badge(self, obj):
        latest_badge = obj.badges.first()
        if latest_badge:
            return latest_badge.name
        return 'Rising Star'  # Default badge


class SessionResourceSerializer(serializers.ModelSerializer):
    added_by_name = serializers.CharField(source='added_by.username', read_only=True)
    added_by_image = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = SessionResource
        fields = ['id', 'title', 'link', 'added_by_name', 'added_by_image', 'can_delete', 'is_owner', 'created_at']

    def get_added_by_image(self, obj):
        if obj.added_by.image:
            return obj.added_by.image
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={obj.added_by.username}"

    def get_can_delete(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user == obj.added_by or request.user == obj.session.host
        return False
        
    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user == obj.added_by
        return False


class SessionMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_image = serializers.SerializerMethodField()
    is_current_user = serializers.SerializerMethodField()
    
    class Meta:
        model = SessionMessage
        fields = ['id', 'text', 'sender_name', 'sender_image', 'is_current_user', 'created_at']

    def get_sender_image(self, obj):
        if obj.sender.image:
            return obj.sender.image
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={obj.sender.username}"

    def get_is_current_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user == obj.sender
        return False
