import { verifyGoogleToken, generateJWT } from '../../src/services/auth';
import { serialize } from 'cookie';
import { applySecurityHeaders, applyCorsHeaders } from '../../src/utils/middleware';
import { upsertDocument, getDocument } from '../../src/services/couchbase';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply security headers
  applySecurityHeaders(res);
  applyCorsHeaders(res, req.headers.origin);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { code, error } = req.query;
  const codeParam = Array.isArray(code) ? code[0] : code;
  
  if (error) {
    // Redirect to home with error
    return res.redirect(302, `${process.env.VITE_APP_URL}/?auth_error=${error}`);
  }
  
  if (!codeParam) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }
  
  try {
    console.log('OAuth callback received:', {
      hasCode: !!codeParam,
      codeLength: codeParam?.length,
      authUrl: process.env.AUTH_URL,
      hasGoogleCreds: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET
    });
    
    // Verify the Google token and get user info
    const user = await verifyGoogleToken(codeParam);
    
    // Log successful login
    console.log('🎉 User logged in:', {
      id: user.id,
      email: user.email,
      name: user.name,
      timestamp: new Date().toISOString()
    });
    
    // Store/update user in Couchbase
    try {
      // Create or update user profile with proper labeling
      const currentTime = new Date().toISOString();
      const userDoc: Record<string, unknown> = {
        _type: 'user',                    // Document type label
        ...user,
        lastLogin: currentTime,
        updatedAt: currentTime,
        // Add default fields for new users
        preferences: {
          notifications: true,
          theme: 'light'
        },
        stats: {
          tournamentsJoined: 0,
          tournamentsWon: 0,
          totalMatches: 0
        }
      };
      
      // Check if user exists to preserve createdAt
      try {
        const existingUser = await getDocument(`user::${user.id}`);
        if (existingUser) {
          // Preserve existing data
          userDoc.createdAt = (existingUser as Record<string, unknown>).createdAt;
          userDoc.preferences = (existingUser as Record<string, unknown>).preferences || userDoc.preferences;
          userDoc.stats = (existingUser as Record<string, unknown>).stats || userDoc.stats;
        }
      } catch {
        // User doesn't exist, set createdAt
        userDoc.createdAt = currentTime;
      }
      
      await upsertDocument(`user::${user.id}`, userDoc);
      
      // Store login event with proper labeling
      const loginEventId = `login::${user.id}::${Date.now()}`;
      await upsertDocument(loginEventId, {
        _type: 'login_event',             // Document type label
        userId: user.id,
        email: user.email,
        name: user.name,
        timestamp: currentTime,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        successful: true
      });
    } catch (dbError) {
      console.error('Failed to store user login in database:', dbError);
      // Continue with login even if DB storage fails
    }
    
    // Generate JWT token
    const token = generateJWT(user);
    
    // Set HTTP-only cookie
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };
    
    // In production, set the domain to allow subdomain access
    if (process.env.NODE_ENV === 'production' && process.env.AUTH_URL) {
      const url = new URL(process.env.AUTH_URL);
      // Use .beerlympics.io to work with both www and non-www
      cookieOptions.domain = url.hostname.replace('www.', '.');
    }
    
    const cookie = serialize('auth-token', token, cookieOptions);
    
    res.setHeader('Set-Cookie', cookie);
    
    // Redirect to dashboard or original destination
    const redirectTo = req.query.state || '/';
    const frontendUrl = process.env.VITE_APP_URL || process.env.AUTH_URL || 'https://www.beerlympics.io';
    return res.redirect(302, `${frontendUrl}${redirectTo}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
    const frontendUrl = process.env.VITE_APP_URL || process.env.AUTH_URL || 'https://www.beerlympics.io';
    const errorMessage = error instanceof Error ? error.message : 'callback_failed';
    return res.redirect(302, `${frontendUrl}/?auth_error=${encodeURIComponent(errorMessage)}`);
  }
}