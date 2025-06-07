import { generateAuthUrl } from '../../src/services/auth.js';
import { applySecurityHeaders, applyCorsHeaders } from '../../src/utils/middleware.js';

export default async function handler(req, res) {
  // Apply security headers
  applySecurityHeaders(res);
  applyCorsHeaders(res, req.headers.origin);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // If we're in development without Google OAuth configured, use mock auth
    if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
      const redirectUrl = new URL(process.env.AUTH_URL || 'http://localhost:5173');
      redirectUrl.pathname = '/auth/callback';
      redirectUrl.searchParams.set('token', 'mock-token-' + Date.now());
      redirectUrl.searchParams.set('user', JSON.stringify({
        id: 'google-user-' + Math.random().toString(36).substr(2, 9),
        email: 'player@gmail.com',
        name: 'Google User',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now()
      }));
      
      return res.status(200).json({
        url: redirectUrl.toString()
      });
    }
    
    // Generate real Google OAuth URL
    const authUrl = await generateAuthUrl();
    
    return res.status(200).json({
      url: authUrl
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return res.status(500).json({
      error: 'Failed to generate authentication URL'
    });
  }
}