import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import type { User } from '../types';

// Build the redirect URL properly
const buildRedirectURL = () => {
  const baseUrl = process.env.AUTH_URL || 'http://localhost:5173';
  return `${baseUrl}/auth/callback`;
};

const client = new OAuth2Client(
  process.env.AUTH_GOOGLE_ID,
  process.env.AUTH_GOOGLE_SECRET,
  buildRedirectURL()
);

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export async function generateAuthUrl(): Promise<string> {
  try {
    console.log('Generating auth URL with:', {
      clientId: process.env.AUTH_GOOGLE_ID ? 'SET' : 'NOT SET',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ? 'SET' : 'NOT SET',
      redirectUri: buildRedirectURL(),
      authUrl: process.env.AUTH_URL
    });
    
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      prompt: 'consent',
    });
    
    console.log('Generated OAuth URL:', url);
    return url;
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw new Error(`Failed to generate OAuth URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function verifyGoogleToken(code: string): Promise<User> {
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.AUTH_GOOGLE_ID!,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }
    
    return {
      id: `google-${payload.sub}`,
      email: payload.email!,
      name: payload.name || payload.email!,
      image: payload.picture,
    };
  } catch (error) {
    throw new Error('Failed to verify Google token');
  }
}

export function generateJWT(user: User): string {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
    process.env.AUTH_SECRET!,
    { 
      expiresIn: '7d',
      issuer: 'beer-olympics',
    }
  );
}

export function verifyJWT(token: string): User | null {
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

export function parseAuthCookie(cookieString: string | undefined): string | null {
  if (!cookieString) return null;
  
  const cookies = cookieString.split(';').map(c => c.trim());
  const authCookie = cookies.find(c => c.startsWith('auth-token='));
  
  if (!authCookie) return null;
  
  return authCookie.split('=')[1];
}