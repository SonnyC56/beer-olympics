import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/auth';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for errors from OAuth provider
        const error = searchParams.get('auth_error');
        if (error) {
          console.error('Auth error:', error);
          navigate('/?error=' + error);
          return;
        }
        
        // For mock auth (development)
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        
        if (token && userParam) {
          // Parse user data
          const user = JSON.parse(userParam);
          
          // Store user data
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', token);
          
          // Redirect to home or previous page
          const returnUrl = localStorage.getItem('authReturnUrl') || '/';
          localStorage.removeItem('authReturnUrl');
          
          // Force reload to update auth state
          window.location.href = returnUrl;
          return;
        }
        
        // For real OAuth, the server should have set a cookie
        // Refresh the user to get the authenticated user data
        await refreshUser();
        
        // Redirect to the intended destination or home
        const state = searchParams.get('state');
        const returnUrl = state || localStorage.getItem('authReturnUrl') || '/';
        localStorage.removeItem('authReturnUrl');
        
        navigate(returnUrl);
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/?error=auth_failed');
      }
    };
    
    handleCallback();
  }, [searchParams, navigate, refreshUser]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <div className="text-xl text-white">Completing sign in...</div>
      </div>
    </div>
  );
}