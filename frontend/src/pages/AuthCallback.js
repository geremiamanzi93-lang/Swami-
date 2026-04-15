import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthCallback = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const hasProcessed = useRef(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Use useRef to prevent double processing in StrictMode
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const processAuth = async () => {
            try {
                // Extract session_id from URL hash
                const hash = window.location.hash;
                const sessionIdMatch = hash.match(/session_id=([^&]+)/);
                
                if (!sessionIdMatch) {
                    throw new Error('Session ID non trovato');
                }

                const sessionId = sessionIdMatch[1];

                // Exchange session_id for user data
                const response = await axios.post(
                    `${API}/auth/session`,
                    { session_id: sessionId },
                    { withCredentials: true }
                );

                const userData = response.data;
                
                // Store session_token in localStorage for persistence across page reloads
                // Backend returns session_token in the response body
                if (userData.session_token) {
                    localStorage.setItem('session_token', userData.session_token);
                }
                
                // Remove session_token from user object before setting in state
                const { session_token, ...userWithoutToken } = userData;
                
                setUser(userWithoutToken);
                
                // Navigate to dashboard
                navigate('/dashboard', { replace: true, state: { user: userWithoutToken } });
            } catch (err) {
                console.error('Auth callback error:', err);
                setError('Autenticazione fallita. Riprova.');
                setTimeout(() => navigate('/', { replace: true }), 2000);
            }
        };

        processAuth();
    }, [navigate, setUser]);

    return (
        <div 
            className="min-h-screen bg-[#F9F6F0] flex items-center justify-center"
            data-testid="auth-callback"
        >
            <div className="text-center">
                {error ? (
                    <div className="text-red-600 font-medium">{error}</div>
                ) : (
                    <>
                        <Loader2 className="w-12 h-12 animate-spin text-[#749274] mx-auto mb-4" />
                        <p className="text-[#4A3018] font-medium">Accesso in corso...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
