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
    const { message, stack, context, timestamp, userAgent, url } = req.body;

    // Basic validation
    if (!message) {
      return res.status(400).json({ error: 'Missing error message' });
    }

    // Error entry
    const errorEntry = {
      message,
      stack,
      context,
      timestamp: timestamp || new Date().toISOString(),
      url,
      userAgent,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      severity: 'error',
    };

    // In production, you would send this to your error tracking service
    // For now, log to console with more visibility
    console.error('🚨 [CLIENT ERROR]', errorEntry);

    // You could also:
    // 1. Store in database for analysis
    // 2. Send to Sentry or similar service
    // 3. Send alerts for critical errors
    // 4. Aggregate error metrics

    // Example: Send to external service
    if (process.env.NODE_ENV === 'production') {
      // await sendToErrorTrackingService(errorEntry);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling error submission:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}