import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { code, error } = req.query;
  const codeParam = Array.isArray(code) ? code[0] : code;
  
  if (error) {
    const frontendUrl = process.env.VITE_APP_URL || process.env.AUTH_URL || 'https://www.beerlympics.io';
    return res.redirect(302, `${frontendUrl}/?auth_error=${error}`);
  }
  
  if (!codeParam) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }
  
  try {
    // Initialize OAuth client inline to avoid module-level issues
    const redirectUri = `${process.env.AUTH_URL || 'http://localhost:5173'}/api/auth/callback`;
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    
    // Exchange code for tokens
    const { tokens } = await client.getToken(codeParam);
    client.setCredentials(tokens);
    
    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('No payload in ID token');
    }
    
    // Create user object
    const user = {
      id: payload.sub,
      email: payload.email!,
      name: payload.name || payload.email!.split('@')[0],
      image: payload.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.sub}`,
    };
    
    // Generate JWT token
    const token = jwt.sign(user, process.env.AUTH_SECRET!, {
      expiresIn: '7d',
    });
    
    // Set HTTP-only cookie
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };
    
    // In production, set the domain
    if (process.env.NODE_ENV === 'production' && process.env.AUTH_URL) {
      const url = new URL(process.env.AUTH_URL);
      cookieOptions.domain = url.hostname.replace('www.', '.');
    }
    
    const cookie = serialize('auth-token', token, cookieOptions);
    res.setHeader('Set-Cookie', cookie);
    
    // Redirect to frontend
    const frontendUrl = process.env.VITE_APP_URL || process.env.AUTH_URL || 'https://www.beerlympics.io';
    const redirectTo = req.query.state || '/';
    return res.redirect(302, `${frontendUrl}${redirectTo}`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.VITE_APP_URL || process.env.AUTH_URL || 'https://www.beerlympics.io';
    const errorMessage = error instanceof Error ? error.message : 'callback_failed';
    return res.redirect(302, `${frontendUrl}/?auth_error=${encodeURIComponent(errorMessage)}`);
  }
}