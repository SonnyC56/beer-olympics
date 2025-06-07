import { verifyGoogleToken, generateJWT } from '../../src/services/auth.js';
import { serialize } from 'cookie';
import { applySecurityHeaders, applyCorsHeaders } from '../../src/utils/middleware.js';

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