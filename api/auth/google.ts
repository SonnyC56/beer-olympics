import { generateAuthUrl } from '../../src/services/auth';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    console.log('Auth env check:', {
      hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      authUrl: process.env.AUTH_URL,
      nodeEnv: process.env.NODE_ENV
    });
    
    // If we're in development without Google OAuth configured, use mock auth
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const redirectUrl = new URL(process.env.AUTH_URL || 'http://localhost:5173');
      redirectUrl.pathname = '/auth/callback';
      redirectUrl.searchParams.set('token', 'mock-token-' + Date.now());
      redirectUrl.searchParams.set('user', JSON.stringify({
        id: 'google-user-' + Math.random().toString(36).substring(2, 11),
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