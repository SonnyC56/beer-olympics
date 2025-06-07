import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/auth';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
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
        } else {
          throw new Error('Missing auth parameters');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/');
      }
    };
    
    handleCallback();
  }, [searchParams, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-xl">Completing sign in...</div>
    </div>
  );
}