import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      nodeVersion: process.version
    }
  });
}