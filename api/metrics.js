import { applySecurityHeaders, applyCorsHeaders } from '../src/utils/middleware.js';

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
    const { name, duration, context, timestamp, url } = req.body;

    // Basic validation
    if (!name || typeof duration !== 'number') {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Performance metric entry
    const metricEntry = {
      name,
      duration,
      context,
      timestamp: timestamp || new Date().toISOString(),
      url,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    // Log performance metrics
    console.log('[PERFORMANCE METRIC]', metricEntry);

    // In production, you would:
    // 1. Store metrics in time-series database
    // 2. Create dashboards for performance monitoring
    // 3. Set up alerts for performance degradation
    // 4. Track trends over time

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling metric submission:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}