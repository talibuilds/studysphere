"""Custom permissions for API endpoints"""
from rest_framework import permissions


class IsHostOrReadOnly(permissions.BasePermission):
    """Allow only session host to edit/delete"""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to host
        return obj.host == request.user


class IsCreatorOrReadOnly(permissions.BasePermission):
    """Allow only group creator to edit/delete"""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to creator
        return obj.creator == request.user


class IsAdminUser(permissions.BasePermission):
    """Allow only admin/staff users"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff
