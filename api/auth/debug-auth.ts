import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Check cookies
  const cookies = req.headers.cookie?.split(';').map(c => c.trim()) || [];
  const authCookie = cookies.find(c => c.startsWith('auth-token='));
  
  return res.status(200).json({
    message: 'Auth debug info',
    env: {
      authUrl: process.env.AUTH_URL || 'not-set',
      viteAppUrl: process.env.VITE_APP_URL || 'not-set',
      hasAuthSecret: !!process.env.AUTH_SECRET,
      nodeEnv: process.env.NODE_ENV || 'not-set'
    },
    request: {
      origin: req.headers.origin || 'no-origin',
      hasCookie: !!req.headers.cookie,
      hasAuthCookie: !!authCookie,
      userAgent: req.headers['user-agent']
    },
    timestamp: new Date().toISOString()
  });
}