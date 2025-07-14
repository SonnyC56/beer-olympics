import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Test endpoint to debug environment variables
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const envCheck = {
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasAuthUrl: !!process.env.AUTH_URL,
    authUrl: process.env.AUTH_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
    // Don't log actual values, just first few chars for verification
    googleClientIdPreview: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'NOT SET',
    timestamp: new Date().toISOString()
  };
  
  return res.status(200).json(envCheck);
}