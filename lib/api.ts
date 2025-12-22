/**
 * API Client for StudySphere Backend
 * Base URL: http://localhost:8000/api
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    localStorage.setItem('access_token', access);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/auth';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API   

export const authAPI = {
    register: async (userData: {
        username: string;
        email: string;
        password: string;
        password2: string;
        first_name: string;
        last_name: string;
    }) => {
        const response = await apiClient.post('/auth/register/', userData);
        const { tokens, user } = response.data;

        // Store tokens
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);

        return { tokens, user };
    },

    login: async (credentials: { username: string; password: string }) => {
        const response = await apiClient.post('/auth/login/', credentials);
        const { tokens, user } = response.data;

        // Store tokens
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);

        return { tokens, user };
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me/');
        return response.data;
    },

    updateProfile: async (userData: any) => {
        const response = await apiClient.put('/auth/me/', userData);
        return response.data;
    },

    googleLogin: async (credential: string) => {
        const response = await apiClient.post('/auth/google/', { credential });
        const { tokens, user } = response.data;

        // Store tokens
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);

        return { tokens, user };
    },
};


// Sessions API


export const sessionsAPI = {
    getAll: async () => {
        const response = await apiClient.get('/sessions/');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get(`/sessions/${id}/`);
        return response.data;
    },

    create: async (sessionData: any) => {
        const response = await apiClient.post('/sessions/', sessionData);
        return response.data;
    },

    update: async (id: string, sessionData: any) => {
        const response = await apiClient.put(`/sessions/${id}/`, sessionData);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/sessions/${id}/`);
        return response.data;
    },

    rsvp: async (id: string) => {
        const response = await apiClient.post(`/sessions/${id}/rsvp/`);
        return response.data;
    },

    markAttendance: async (id: string, verificationCode: string) => {
        const response = await apiClient.post(`/sessions/${id}/mark-attendance/`, {
            verification_code: verificationCode
        });
        return response.data;
    },

    cancelRSVP: async (id: string) => {
        const response = await apiClient.delete(`/sessions/${id}/cancel_rsvp/`);
        return response.data;
    },

    getResources: async (id: string) => {
        const response = await apiClient.get(`/sessions/${id}/resources/`);
        return response.data;
    },

    addResource: async (id: string, resourceData: { title: string; link: string }) => {
        const response = await apiClient.post(`/sessions/${id}/add_resource/`, resourceData);
        return response.data;
    },

    deleteResource: async (sessionId: string, resourceId: number) => {
        const response = await apiClient.delete(`/sessions/${sessionId}/delete-resource/${resourceId}/`);
        return response.data;
    },
};


// Groups API


export const groupsAPI = {
    getAll: async () => {
        const response = await apiClient.get('/groups/');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get(`/groups/${id}/`);
        return response.data;
    },

    create: async (groupData: any) => {
        const response = await apiClient.post('/groups/', groupData);
        return response.data;
    },

    update: async (id: string, groupData: any) => {
        const response = await apiClient.put(`/groups/${id}/`, groupData);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/groups/${id}/`);
        return response.data;
    },

    join: async (id: string) => {
        const response = await apiClient.post(`/groups/${id}/join/`);
        return response.data;
    },

    leave: async (id: string) => {
        const response = await apiClient.delete(`/groups/${id}/leave/`);
        return response.data;
    },

    getSessions: async (id: string) => {
        const response = await apiClient.get(`/groups/${id}/sessions/`);
        return response.data;
    },
};


// Dashboard API


export const dashboardAPI = {
    getData: async () => {
        const response = await apiClient.get('/dashboard/');
        return response.data;
    },
};


// Leaderboard API


export const leaderboardAPI = {
    get: async (period: 'week' | 'all' = 'week') => {
        const response = await apiClient.get(`/leaderboard/?period=${period}`);
        return response.data;
    },
};

// Admin API


export const adminAPI = {
    getGroups: async () => {
        const response = await apiClient.get('/admin/groups/');
        return response.data;
    },

    approveGroup: async (id: string) => {
        const response = await apiClient.patch(`/admin/groups/${id}/approve/`);
        return response.data;
    },

    rejectGroup: async (id: string) => {
        const response = await apiClient.patch(`/admin/groups/${id}/reject/`);
        return response.data;
    },
};


// Messages API

export const messagesAPI = {
    getSessionMessages: async (sessionId: string) => {
        const response = await apiClient.get(`/sessions/${sessionId}/messages/`);
        return response.data;
    },

    sendSessionMessage: async (sessionId: string, text: string) => {
        const response = await apiClient.post(`/sessions/${sessionId}/send_message/`, { text });
        return response.data;
    },
};

export default apiClient;
