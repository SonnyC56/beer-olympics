import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getApiUrl = (path: string) => {
    return import.meta.env.DEV 
      ? `http://localhost:3000${path}`
      : path;
  };

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/auth/me'), {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Also store in localStorage for client-side access
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        // Not authenticated
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Fall back to localStorage for development
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signIn = async (returnTo?: string) => {
    try {
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
    } catch (error) {
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
    } catch (error) {
      console.error('Sign out failed:', error);
      // Force logout locally
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}