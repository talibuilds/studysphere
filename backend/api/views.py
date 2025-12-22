from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.utils import timezone
from datetime import timedelta, datetime
from django.db.models import Count, Q

from .models import User, StudySession, StudyGroup, SessionRSVP, GroupMembership
from .serializers import (
    StudySessionSerializer, StudySessionCreateSerializer,
    StudyGroupSerializer, StudyGroupCreateSerializer,
    LeaderboardSerializer, UserProfileSerializer
)
from .permissions import IsHostOrReadOnly, IsCreatorOrReadOnly, IsAdminUser
from .utils import award_xp, XP_REWARDS


class StudySessionViewSet(viewsets.ModelViewSet):
    """ViewSet for StudySession CRUD and RSVP"""
    queryset = StudySession.objects.all().select_related('host', 'group').prefetch_related('attendees')
    permission_classes = [IsAuthenticatedOrReadOnly, IsHostOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StudySessionCreateSerializer
        return StudySessionSerializer
    
    def perform_create(self, serializer):
        session = serializer.save(host=self.request.user)
        # Award XP for creating a session
        award_xp(self.request.user, XP_REWARDS['create_session'])
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def rsvp(self, request, pk=None):
        """RSVP to a session"""
        session = self.get_object()
        
        # Check if already RSVP'd
        if SessionRSVP.objects.filter(user=request.user, session=session).exists():
            return Response(
                {'detail': 'You have already RSVP\'d to this session'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if session is in the past
        # Try to parse date/time to check validity
        if session.date and session.time:
            try:
                # Handle ISO format YYYY-MM-DD
                if '-' in session.date and ':' in session.time:
                     # Check if time has range "8:00 - 10:00" -> take first part
                     time_part = session.time.split('-')[0].strip() if '-' in session.time else session.time
                     
                     # Simple ISO parsing attempt
                     session_datetime_str = f"{session.date} {time_part}"
                     # Use flexible parsing if possible, but strptime is strict. 
                     # Given our Create Session enforces YYYY-MM-DD and HH:MM, this should cover new sessions.
                     # We can try multiple formats if needed.
                     
                     try:
                         dt = datetime.strptime(session_datetime_str, "%Y-%m-%d %H:%M")
                     except ValueError:
                         # Try AM/PM format just in case
                         dt = datetime.strptime(session_datetime_str, "%Y-%m-%d %I:%M %p")

                     dt = timezone.make_aware(dt)
                     
                     if dt < timezone.now():
                         return Response(
                             {'detail': 'Cannot RSVP to a past session'},
                             status=status.HTTP_400_BAD_REQUEST
                         )
            except Exception as e:
                # If parsing fails, we log it but don't block (to avoid breaking legacy/mock data RSVPs)
                print(f"Date parsing error for session {session.id}: {e}")
                pass
        
        # Create RSVP
        SessionRSVP.objects.create(user=request.user, session=session)
        
        # Award XP for RSVPing
        award_xp(request.user, XP_REWARDS['rsvp_session'])
        
        return Response(
            {'detail': 'Successfully RSVP\'d to session', 'xp_earned': XP_REWARDS['rsvp_session']},
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def cancel_rsvp(self, request, pk=None):
        """Cancel RSVP to a session"""
        session = self.get_object()
        
        try:
            rsvp = SessionRSVP.objects.get(user=request.user, session=session)
            rsvp.delete()
            return Response({'detail': 'RSVP cancelled'}, status=status.HTTP_200_OK)
        except SessionRSVP.DoesNotExist:
            return Response(
                {'detail': 'You have not RSVP\'d to this session'},
                status=status.HTTP_400_BAD_REQUEST
            )


class StudyGroupViewSet(viewsets.ModelViewSet):
    """ViewSet for StudyGroup CRUD and membership"""
    permission_classes = [IsAuthenticatedOrReadOnly, IsCreatorOrReadOnly]
    
    def get_queryset(self):
        # Only show approved groups to non-staff users
        if self.request.user.is_staff:
            return StudyGroup.objects.all().select_related('creator').prefetch_related('members')
        return StudyGroup.objects.filter(status='approved').select_related('creator').prefetch_related('members')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StudyGroupCreateSerializer
        return StudyGroupSerializer
    
    def perform_create(self, serializer):
        group = serializer.save(creator=self.request.user, status='pending')
        # Automatically add creator as member
        GroupMembership.objects.create(user=self.request.user, group=group)
        # Award XP for creating a group
        award_xp(self.request.user, XP_REWARDS['create_group'])
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        """Join a study group"""
        group = self.get_object()
        
        # Check if group is approved
        if group.status != 'approved':
            return Response(
                {'detail': 'This group is not yet approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already a member
        if GroupMembership.objects.filter(user=request.user, group=group).exists():
            return Response(
                {'detail': 'You are already a member of this group'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create membership
        GroupMembership.objects.create(user=request.user, group=group)
        
        # Award XP for joining a group
        award_xp(request.user, XP_REWARDS['join_group'])
        
        return Response(
            {'detail': 'Successfully joined group', 'xp_earned': XP_REWARDS['join_group']},
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def leave(self, request, pk=None):
        """Leave a study group"""
        group = self.get_object()
        
        try:
            membership = GroupMembership.objects.get(user=request.user, group=group)
            membership.delete()
            return Response({'detail': 'Successfully left group'}, status=status.HTTP_200_OK)
        except GroupMembership.DoesNotExist:
            return Response(
                {'detail': 'You are not a member of this group'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        """Get all sessions for this group"""
        group = self.get_object()
        sessions = StudySession.objects.filter(group=group).select_related('host').prefetch_related('attendees')
        serializer = StudySessionSerializer(sessions, many=True, context={'request': request})
        return Response(serializer.data)


class LeaderboardViewSet(viewsets.ViewSet):
    """ViewSet for leaderboard rankings"""
    
    def list(self, request):
        """Get leaderboard data"""
        period = request.query_params.get('period', 'week')
        
        if period == 'week':
            # Get users who earned XP in the last week
            week_ago = timezone.now() - timedelta(days=7)
            # For simplicity, just show top users by XP (would need activity tracking for true weekly)
            users = User.objects.all().order_by('-xp')[:10]
        else:
            # All-time leaderboard
            users = User.objects.all().order_by('-xp')[:10]
        
        serializer = LeaderboardSerializer(users, many=True)
        
        # Add rank to each user
        data = serializer.data
        for idx, user_data in enumerate(data, 1):
            user_data['rank'] = idx
        
        return Response(data)


class DashboardViewSet(viewsets.ViewSet):
    """ViewSet for dashboard data"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get dashboard data for current user"""
        user = request.user
        
        # Get upcoming sessions user is attending
        upcoming_sessions = StudySession.objects.filter(
            attendees=user
        ).select_related('host', 'group')[:3]
        
        sessions_serializer = StudySessionSerializer(
            upcoming_sessions, 
            many=True, 
            context={'request': request}
        )
        
        # Get user stats
        stats = {
            'sessions_attended': SessionRSVP.objects.filter(user=user).count(),
            'groups_joined': GroupMembership.objects.filter(user=user).count(),
            'sessions_hosted': StudySession.objects.filter(host=user).count(),
            'xp': user.xp,
            'level': user.level,
        }
        
        return Response({
            'upcoming_sessions': sessions_serializer.data,
            'stats': stats,
        })


class AdminViewSet(viewsets.ViewSet):
    """ViewSet for admin operations"""
    permission_classes = [IsAdminUser]
    
    def list(self, request):
        """Get all group requests"""
        groups = StudyGroup.objects.all().select_related('creator').annotate(
            members_count=Count('members')
        )
        
        pending = groups.filter(status='pending')
        approved = groups.filter(status='approved')
        rejected = groups.filter(status='rejected')
        
        data = {
            'pending': StudyGroupSerializer(pending, many=True).data,
            'approved': StudyGroupSerializer(approved, many=True).data,
            'rejected': StudyGroupSerializer(rejected, many=True).data,
            'stats': {
                'total_groups': groups.count(),
                'approved_groups': approved.count(),
                'rejected_groups': rejected.count(),
                'total_sessions': StudySession.objects.count(),
                'active_sessions': StudySession.objects.filter(
                    attendees__isnull=False
                ).distinct().count(),
            }
        }
        
        return Response(data)
    
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """Approve a group request"""
        try:
            group = StudyGroup.objects.get(pk=pk)
            group.status = 'approved'
            group.save()
            return Response({'detail': 'Group approved'}, status=status.HTTP_200_OK)
        except StudyGroup.DoesNotExist:
            return Response({'detail': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        """Reject a group request"""
        try:
            group = StudyGroup.objects.get(pk=pk)
            group.status = 'rejected'
            group.save()
            return Response({'detail': 'Group rejected'}, status=status.HTTP_200_OK)
        except StudyGroup.DoesNotExist:
            return Response({'detail': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
