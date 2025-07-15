import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const getApiUrl = (path) => {
        return import.meta.env.DEV
            ? `http://localhost:3000${path}`
            : path;
    };
    const refreshUser = useCallback(async () => {
        try {
            // For development without backend, use localStorage mock auth
            if (import.meta.env.DEV) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    }
                    catch {
                        setUser(null);
                        localStorage.removeItem('user');
                    }
                }
                else {
                    setUser(null);
                }
                setLoading(false);
                return;
            }
            const response = await fetch(getApiUrl('/api/auth/me'), {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                // Also store in localStorage for client-side access
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            else {
                // Not authenticated
                setUser(null);
                localStorage.removeItem('user');
            }
        }
        catch (error) {
            console.error('Auth check failed:', error);
            // Fall back to localStorage for development
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                }
                catch {
                    setUser(null);
                    localStorage.removeItem('user');
                }
            }
            else {
                setUser(null);
            }
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);
    const signIn = async (returnTo) => {
        try {
            // For development without backend, use mock auth
            if (import.meta.env.DEV) {
                const mockUser = {
                    id: '123',
                    email: 'demo@beerolympics.fun',
                    name: 'Demo User',
                    image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=demo',
                };
                setUser(mockUser);
                localStorage.setItem('user', JSON.stringify(mockUser));
                // Navigate to returnTo or dashboard
                if (returnTo) {
                    window.location.href = returnTo;
                }
                return;
            }
            const response = await fetch(getApiUrl('/api/auth/google'), {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`Failed to get auth URL: ${response.status}`);
            }
            const { url } = await response.json();
            // Add state parameter for return URL
            const authUrl = new URL(url);
            if (returnTo) {
                authUrl.searchParams.set('state', returnTo);
            }
            // Redirect to OAuth provider
            window.location.href = authUrl.toString();
        }
        catch (error) {
            console.error('Sign in failed:', error);
            throw error;
        }
    };
    const signOut = async () => {
        try {
            const response = await fetch(getApiUrl('/api/auth/logout'), {
                method: 'POST',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Logout failed');
            }
            setUser(null);
            localStorage.removeItem('user');
            // Redirect to home
            window.location.href = '/';
        }
        catch (error) {
            console.error('Sign out failed:', error);
            // Force logout locally
            setUser(null);
            localStorage.removeItem('user');
        }
    };
    return (_jsx(AuthContext.Provider, { value: { user, loading, signIn, signOut, refreshUser }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
