from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from api.models import User
from api.serializers import UserProfileSerializer
from .serializers import RegisterSerializer, LoginSerializer, ChangePasswordSerializer


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
