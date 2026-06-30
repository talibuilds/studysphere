from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.utils import timezone
import random
from api.models import User, PasswordResetOTP
from api.serializers import UserProfileSerializer
from .serializers import (
    RegisterSerializer, 
    LoginSerializer, 
    ChangePasswordSerializer, 
    PasswordResetRequestSerializer, 
    PasswordResetVerifySerializer
)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'xp': user.xp,
                'level': user.level,
                'is_staff': user.is_staff,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """Get/update current user profile"""
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


import urllib.request
import urllib.parse
import json
import uuid

class GoogleLoginView(APIView):
    """Google login endpoint"""
    permission_classes = (AllowAny,)

    def post(self, request):
        credential = request.data.get('credential')
        if not credential:
            return Response({'error': 'No credential provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify token with Google
        try:
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                google_data = json.loads(response.read().decode())
            
            if 'error' in google_data:
                return Response({'error': 'Invalid Google token'}, status=status.HTTP_401_UNAUTHORIZED)
                
            email = google_data.get('email')
            if not email:
                return Response({'error': 'No email found in Google token'}, status=status.HTTP_400_BAD_REQUEST)
                
            first_name = google_data.get('given_name', '')
            last_name = google_data.get('family_name', '')
            
            # Check if user exists, else create
            user = User.objects.filter(email=email).first()
            if not user:
                username = email.split('@')[0]
                # Ensure username is unique
                if User.objects.filter(username=username).exists():
                    username = f"{username}_{str(uuid.uuid4())[:8]}"
                    
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    password=User.objects.make_random_password()
                )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'xp': user.xp,
                    'level': user.level,
                    'is_staff': user.is_staff,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
            
        except Exception as e:
            return Response({'error': f'Failed to authenticate with Google: {str(e)}'}, status=status.HTTP_401_UNAUTHORIZED)


class ChangePasswordView(generics.UpdateAPIView):
    """Endpoint for changing password"""
    serializer_class = ChangePasswordSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = self.get_object()
        if not user.check_password(serializer.validated_data.get("old_password")):
            return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(serializer.validated_data.get("new_password"))
        user.save()
        
        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Endpoint for requesting a password reset OTP"""
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get('email')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # For security reasons, don't reveal if user exists or not
            return Response(
                {"detail": "If your email is registered, we have sent a reset code."},
                status=status.HTTP_200_OK
            )

        # Generate a 6-digit OTP code
        otp = f"{random.randint(100000, 999999)}"

        # Save to database
        PasswordResetOTP.objects.create(user=user, otp=otp)

        # Send email via Vercel proxy to bypass Render SMTP block
        try:
            import requests
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Attempting to send OTP email to {email} via Vercel proxy")

            proxy_url = "https://studyspheres.vercel.app/api/send-email"
            payload = {
                "to": email,
                "subject": "StudySphere - Password Reset Verification Code",
                "text": f"Hi {user.username},\n\nYour password reset verification code is: {otp}\n\nThis code will expire in 15 minutes.\n\nBest,\nStudySphere Team",
                "api_secret": "studysphere_super_secret_proxy_key_123"
            }
            
            response = requests.post(proxy_url, json=payload, timeout=15)
            response.raise_for_status()
            logger.info(f"OTP email sent successfully to {email} via proxy")
            
        except Exception as e:
            import traceback
            logger = logging.getLogger(__name__)
            error_details = str(e)
            if hasattr(e, 'response') and e.response is not None:
                error_details += f" Response: {e.response.text}"
            logger.error(f"Failed to send OTP email via proxy: {error_details}")
            logger.error(traceback.format_exc())
            return Response(
                {"detail": f"Email delivery failed: {error_details}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {"detail": "If your email is registered, we have sent a reset code."},
            status=status.HTTP_200_OK
        )


class PasswordResetVerifyView(APIView):
    """Endpoint for verifying OTP and resetting password"""
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = PasswordResetVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get('email')
        otp = serializer.validated_data.get('otp')
        new_password = serializer.validated_data.get('new_password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid request parameters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get latest unused OTP for user
        otp_record = PasswordResetOTP.objects.filter(
            user=user,
            otp=otp,
            is_used=False
        ).order_by('-created_at').first()

        if not otp_record or otp_record.is_expired():
            return Response(
                {"otp": ["Invalid or expired verification code."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        # OTP is valid, reset password
        user.set_password(new_password)
        user.save()

        # Mark OTP as used
        otp_record.is_used = True
        otp_record.save()

        return Response(
            {"detail": "Password has been successfully reset."},
            status=status.HTTP_200_OK
        )
