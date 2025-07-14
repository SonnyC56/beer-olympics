import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

// Parse auth cookie inline
function parseAuthCookie(cookieString: string | undefined): string | null {
  if (!cookieString) return null;
  
  const cookies = cookieString.split(';').map(c => c.trim());
  const authCookie = cookies.find(c => c.startsWith('auth-token='));
  
  if (!authCookie) return null;
  
  return authCookie.split('=')[1];
}

// Verify JWT inline
function verifyJWT(token: string): any | null {
  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET!) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      image: decoded.image,
    };
  } catch (error) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
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
      hasAuth: !!req.headers.authorization,
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin
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
    console.error('Auth verification error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      hasAuthSecret: !!process.env.AUTH_SECRET
    });
    return res.status(500).json({ 
      error: 'Authentication service error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
}