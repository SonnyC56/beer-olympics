import { serialize } from 'cookie';
import { applySecurityHeaders, applyCorsHeaders } from '../../src/utils/middleware.js';

export default async function handler(req, res) {
  // Apply security headers
  applySecurityHeaders(res);
  applyCorsHeaders(res, req.headers.origin);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Clear the auth cookie
  const cookie = serialize('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });
  
  res.setHeader('Set-Cookie', cookie);
  
  return res.status(200).json({ success: true });
}