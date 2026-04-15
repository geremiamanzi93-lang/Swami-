import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve essere usato dentro AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            // Try cookie-based auth first, then localStorage fallback
            const storedToken = localStorage.getItem('session_token');
            const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
            
            const response = await axios.get(`${API}/auth/me`, {
                withCredentials: true,
                headers
            });
            setUser(response.data);
            return response.data;
        } catch (error) {
            setUser(null);
            // If auth fails, clear stale token
            localStorage.removeItem('session_token');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // CRITICAL: If returning from OAuth callback, skip the /me check.
        // AuthCallback will exchange the session_id and establish the session first.
        if (window.location.hash?.includes('session_id=')) {
            setLoading(false);
            return;
        }
        checkAuth();
    }, [checkAuth]);

    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const login = () => {
        const redirectUrl = window.location.origin + '/dashboard';
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    const logout = async () => {
        try {
            const storedToken = localStorage.getItem('session_token');
            const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
            await axios.post(`${API}/auth/logout`, {}, { withCredentials: true, headers });
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('session_token');
        setUser(null);
    };

    const updateProfile = async (profileData) => {
        try {
            const storedToken = localStorage.getItem('session_token');
            const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
            const response = await axios.put(`${API}/profile/me`, profileData, {
                withCredentials: true,
                headers
            });
            setUser(response.data);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // Helper to get auth headers for API calls
    const getAuthHeaders = useCallback(() => {
        const storedToken = localStorage.getItem('session_token');
        return storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            setUser, 
            loading, 
            login, 
            logout, 
            checkAuth,
            updateProfile,
            getAuthHeaders,
            isAuthenticated: !!user 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
