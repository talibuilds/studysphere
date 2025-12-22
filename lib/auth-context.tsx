"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from './api';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    xp: number;
    level: number;
    image?: string;
    is_staff?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    loginWithGoogle: (credential: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('access_token');

            if (token) {
                try {
                    const userData = await authAPI.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to load user:', error);
                    // Clear invalid tokens
                    authAPI.logout();
                }
            }

            setIsLoading(false);
        };

        loadUser();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const { user } = await authAPI.login({ username, password });
            setUser(user);
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Login failed');
        }
    };

    const loginWithGoogle = async (credential: string) => {
        try {
            const { user } = await authAPI.googleLogin(credential);
            setUser(user);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Google login failed');
        }
    };

    const register = async (data: {
        username: string;
        email: string;
        password: string;
        password2: string;
        first_name: string;
        last_name: string;
    }) => {
        try {
            const { user } = await authAPI.register(data);
            setUser(user);
        } catch (error: any) {
            const errorMessage = error.response?.data?.username?.[0] ||
                error.response?.data?.email?.[0] ||
                error.response?.data?.password?.[0] ||
                'Registration failed';
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
        window.location.href = '/auth';
    };

    const refreshUser = async () => {
        try {
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
