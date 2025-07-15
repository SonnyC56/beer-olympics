import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serialize } from 'cookie';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers with specific origin for credentials
  const origin = req.headers.origin || 'https://www.beerlympics.io';
  const allowedOrigins = ['https://www.beerlympics.io', 'https://beerlympics.io', 'http://localhost:5173'];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Test cookie settings
  const cookieOptions: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  };
  
  // In production, test domain setting
  if (process.env.NODE_ENV === 'production' && process.env.AUTH_URL) {
    const url = new URL(process.env.AUTH_URL);
    cookieOptions.domain = url.hostname.replace('www.', '.');
  }
  
  const testCookie = serialize('test-auth-token', 'test-value-' + Date.now(), cookieOptions);
  
  res.setHeader('Set-Cookie', testCookie);
  
  return res.status(200).json({
    message: 'Test cookie set',
    cookieOptions: {
      ...cookieOptions,
      domain: cookieOptions.domain || 'not-set'
    },
    authUrl: process.env.AUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    hostname: process.env.AUTH_URL ? new URL(process.env.AUTH_URL).hostname : 'unknown'
  });
}