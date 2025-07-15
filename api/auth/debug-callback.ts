import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Log what would happen in callback
  return res.status(200).json({
    message: 'Callback debug info',
    env: {
      authUrl: process.env.AUTH_URL || 'not-set',
      viteAppUrl: process.env.VITE_APP_URL || 'not-set',
      nodeEnv: process.env.NODE_ENV || 'not-set',
      hasGoogleCreds: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET
    },
    callbackRedirect: {
      withViteAppUrl: process.env.VITE_APP_URL ? `${process.env.VITE_APP_URL}/` : 'not-set',
      withAuthUrl: process.env.AUTH_URL ? `${process.env.AUTH_URL}/` : 'not-set',
      fallback: 'https://www.beerlympics.io/'
    },
    cookieDomain: process.env.AUTH_URL ? new URL(process.env.AUTH_URL).hostname.replace('www.', '.') : 'not-set',
    timestamp: new Date().toISOString()
  });
}