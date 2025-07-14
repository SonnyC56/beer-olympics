import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Enhanced debugging
    const envCheck = {
      hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      authUrl: process.env.AUTH_URL,
      nodeEnv: process.env.NODE_ENV,
      googleIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
      googleSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('AUTH'))
    };
    
    console.log('Auth env check:', envCheck);
    
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
    
    // Initialize OAuth2Client inside the handler
    const redirectUri = `${process.env.AUTH_URL || 'http://localhost:5173'}/auth/callback`;
    
    console.log('Attempting to create OAuth client with:', {
      clientIdSet: !!process.env.GOOGLE_CLIENT_ID,
      clientSecretSet: !!process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: redirectUri
    });
    
    try {
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );
      
      // Generate real Google OAuth URL
      const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        prompt: 'consent',
      });
      
      console.log('Successfully generated OAuth URL');
      
      return res.status(200).json({
        url: authUrl
      });
    } catch (oauthError) {
      console.error('OAuth2Client error:', oauthError);
      throw new Error(`OAuth initialization failed: ${oauthError instanceof Error ? oauthError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return res.status(500).json({
      error: 'Failed to generate authentication URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}