import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../types';

const client = new OAuth2Client(
  process.env.AUTH_GOOGLE_ID,
  process.env.AUTH_GOOGLE_SECRET,
  process.env.AUTH_URL + '/auth/callback'
);

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export async function generateAuthUrl(): Promise<string> {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    prompt: 'consent',
  });
  return url;
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