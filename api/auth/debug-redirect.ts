import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const authUrl = process.env.AUTH_URL || 'not-set';
  const redirectUri = `${authUrl}/auth/callback`;
  
  return res.status(200).json({
    message: 'Redirect URI debug info',
    authUrl: authUrl,
    redirectUri: redirectUri,
    timestamp: new Date().toISOString()
  });
}