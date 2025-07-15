import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serialize } from 'cookie';
import { generateJWT } from '../../src/services/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  const origin = req.headers.origin || 'https://www.beerlympics.io';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  try {
    // Create a test user
    const testUser = {
      id: 'test-user-' + Date.now(),
      email: 'test@beerlympics.io',
      name: 'Test User',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
    };
    
    // Generate JWT token
    const token = generateJWT(testUser);
    
    // Set cookie with same options as real callback
    const cookieOptions: any = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };
    
    // Set domain for production
    if (process.env.NODE_ENV === 'production' && process.env.AUTH_URL) {
      const url = new URL(process.env.AUTH_URL);
      cookieOptions.domain = url.hostname.replace('www.', '.');
    }
    
    const cookie = serialize('auth-token', token, cookieOptions);
    res.setHeader('Set-Cookie', cookie);
    
    return res.status(200).json({
      success: true,
      user: testUser,
      cookieSet: true,
      cookieOptions,
      token: token.substring(0, 20) + '...'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Test callback failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}