import { applySecurityHeaders, applyCorsHeaders, strictRateLimit } from '../src/utils/middleware.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);
  applyCorsHeaders(res, req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, level, context, timestamp, url } = req.body;

    // Basic validation
    if (!message || !level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log entry
    const logEntry = {
      message,
      level,
      context,
      timestamp: timestamp || new Date().toISOString(),
      url,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    // In production, you would send this to your logging service
    // For now, just log to console
    console.log('[CLIENT LOG]', logEntry);

    // You could also store in database for analysis
    // await storeLog(logEntry);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling log submission:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}