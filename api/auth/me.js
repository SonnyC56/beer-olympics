import { verifyJWT, parseAuthCookie } from '../../src/services/auth.js';
import { applySecurityHeaders, applyCorsHeaders } from '../../src/utils/middleware.js';

export default async function handler(req, res) {
  // Apply security headers
  applySecurityHeaders(res);
  applyCorsHeaders(res, req.headers.origin);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('Auth me check:', {
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasCookie: !!req.headers.cookie,
      hasAuth: !!req.headers.authorization
    });
    
    // Get token from cookie or Authorization header
    let token = parseAuthCookie(req.headers.cookie);
    
    if (!token && req.headers.authorization) {
      const bearer = req.headers.authorization.split(' ');
      if (bearer.length === 2 && bearer[0] === 'Bearer') {
        token = bearer[1];
      }
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Verify token
    const user = verifyJWT(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}