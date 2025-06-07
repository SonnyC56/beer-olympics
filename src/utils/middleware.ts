import rateLimit from 'express-rate-limit';

// Rate limiting configurations
export const createRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: options.message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
  });
};

// Specific rate limits for different endpoints
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

export const apiRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
});

export const publicRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
});

export const strictRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute for sensitive operations
});

// Security headers
export const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent iframe embedding (clickjacking protection)
  'X-Frame-Options': 'DENY',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Vite needs unsafe-eval in dev
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: http:",
    "connect-src 'self' ws: wss: https:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; '),
  
  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
  ].join(', '),
};

// Helper to apply security headers to a response
export function applySecurityHeaders(res: any) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

// Helper to apply CORS headers
export function applyCorsHeaders(res: any, origin?: string) {
  const allowedOrigins = [
    process.env.VITE_APP_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'https://localhost:3000',
  ];
  
  const requestOrigin = origin || process.env.VITE_APP_URL || 'http://localhost:5173';
  const isAllowed = allowedOrigins.includes(requestOrigin);
  
  res.setHeader('Access-Control-Allow-Origin', isAllowed ? requestOrigin : allowedOrigins[0]);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

// IP extraction helper for rate limiting
export function getClientIp(req: any): string {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  );
}

// API key validation
export function validateApiKey(req: any): boolean {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.VITE_API_KEY;
  
  if (!validApiKey) {
    // If no API key is configured, allow all requests (development mode)
    return true;
  }
  
  return apiKey === validApiKey;
}