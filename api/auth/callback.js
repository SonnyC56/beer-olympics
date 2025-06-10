import { verifyGoogleToken, generateJWT } from '../../src/services/auth.js';
import { serialize } from 'cookie';
import { applySecurityHeaders, applyCorsHeaders } from '../../src/utils/middleware.js';
import { upsertDocument } from '../../src/services/couchbase.js';

export default async function handler(req, res) {
  // Apply security headers
  applySecurityHeaders(res);
  applyCorsHeaders(res, req.headers.origin);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { code, error } = req.query;
  
  if (error) {
    // Redirect to home with error
    return res.redirect(302, `${process.env.VITE_APP_URL}/?auth_error=${error}`);
  }
  
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }
  
  try {
    // Verify the Google token and get user info
    const user = await verifyGoogleToken(code);
    
    // Log successful login
    console.log('🎉 User logged in:', {
      id: user.id,
      email: user.email,
      name: user.name,
      timestamp: new Date().toISOString()
    });
    
    // Store/update user in Couchbase
    try {
      await upsertDocument(`user::${user.id}`, {
        ...user,
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Store login event
      const loginEventId = `login::${user.id}::${Date.now()}`;
      await upsertDocument(loginEventId, {
        userId: user.id,
        email: user.email,
        name: user.name,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      });
    } catch (dbError) {
      console.error('Failed to store user login in database:', dbError);
      // Continue with login even if DB storage fails
    }
    
    // Generate JWT token
    const token = generateJWT(user);
    
    // Set HTTP-only cookie
    const cookie = serialize('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    res.setHeader('Set-Cookie', cookie);
    
    // Redirect to dashboard or original destination
    const redirectTo = req.query.state || '/';
    return res.redirect(302, `${process.env.VITE_APP_URL}${redirectTo}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect(302, `${process.env.VITE_APP_URL}/?auth_error=callback_failed`);
  }
}