import rateLimit from 'express-rate-limit';
import redisService, { CACHE_TTL } from '../services/redis';
import { getApiCacheKey } from './cache-keys';

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

// Cache middleware for API responses
export interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: any) => string;
  condition?: (req: any) => boolean;
  skipCache?: (req: any) => boolean;
}

export function createCacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = CACHE_TTL.DEFAULT,
    keyGenerator = (req) => getApiCacheKey(req.method, req.path, req.query),
    condition = (req) => req.method === 'GET',
    skipCache = () => false,
  } = options;

  return async (req: any, res: any, next: any) => {
    // Skip caching if conditions are not met
    if (!condition(req) || skipCache(req)) {
      return next();
    }

    const cacheKey = keyGenerator(req);

    try {
      // Try to get from cache
      const cached = await redisService.get(cacheKey);
      
      if (cached !== null) {
        // Cache hit
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('Content-Type', 'application/json');
        
        // If cached response includes headers, apply them
        if (cached.headers) {
          Object.entries(cached.headers).forEach(([key, value]: [string, any]) => {
            if (key !== 'X-Cache' && key !== 'X-Cache-Key') {
              res.setHeader(key, value);
            }
          });
        }
        
        return res.status(cached.status || 200).json(cached.data || cached);
      }

      // Cache miss - capture response
      const originalSend = res.send;
      const originalJson = res.json;
      const originalStatus = res.status;
      
      let statusCode = 200;
      const capturedHeaders: Record<string, any> = {};

      // Capture status code
      res.status = function(code: number) {
        statusCode = code;
        return originalStatus.call(this, code);
      };

      // Capture JSON responses
      res.json = function(data: any) {
        // Only cache successful responses
        if (statusCode >= 200 && statusCode < 300) {
          // Capture important headers
          const headersToCache = [
            'Content-Type',
            'Cache-Control',
            'ETag',
            'Last-Modified',
          ];
          
          headersToCache.forEach(header => {
            const value = res.getHeader(header);
            if (value) {
              capturedHeaders[header] = value;
            }
          });

          const cacheData = {
            data,
            status: statusCode,
            headers: capturedHeaders,
            timestamp: Date.now(),
          };

          // Cache asynchronously to not block response
          redisService.set(cacheKey, cacheData, ttl).catch(err => {
            console.error('Cache set error:', err);
          });
        }

        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        
        return originalJson.call(this, data);
      };

      // Capture send responses (for non-JSON)
      res.send = function(data: any) {
        // For non-JSON responses, we skip caching
        res.setHeader('X-Cache', 'BYPASS');
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
}

// Specific cache middleware for common endpoints
export const leaderboardCache = createCacheMiddleware({
  ttl: CACHE_TTL.LEADERBOARD,
  keyGenerator: (req) => `api:leaderboard:${req.params.slug || req.query.slug}`,
});

export const tournamentCache = createCacheMiddleware({
  ttl: CACHE_TTL.TOURNAMENT_STATE,
  keyGenerator: (req) => `api:tournament:${req.params.id || req.query.id}`,
});

export const matchCache = createCacheMiddleware({
  ttl: CACHE_TTL.MATCH_RESULTS,
  keyGenerator: (req) => `api:match:${req.params.id || req.query.id}`,
});

export const teamCache = createCacheMiddleware({
  ttl: CACHE_TTL.TEAM_DATA,
  keyGenerator: (req) => `api:team:${req.params.id || req.query.id}`,
});

// Cache invalidation middleware for mutations
export function createInvalidationMiddleware(patterns: string[] | ((req: any) => string[])) {
  return async (req: any, res: any, next: any) => {
    // Only invalidate on mutations
    if (req.method === 'GET' || req.method === 'OPTIONS') {
      return next();
    }

    const originalSend = res.send;
    const originalJson = res.json;
    const originalStatus = res.status;
    
    let statusCode = 200;

    res.status = function(code: number) {
      statusCode = code;
      return originalStatus.call(this, code);
    };

    const invalidateCache = async () => {
      // Only invalidate on successful mutations
      if (statusCode >= 200 && statusCode < 300) {
        const keysToInvalidate = typeof patterns === 'function' ? patterns(req) : patterns;
        
        for (const pattern of keysToInvalidate) {
          if (pattern.includes('*')) {
            await redisService.deletePattern(pattern).catch(err => {
              console.error(`Cache invalidation error for pattern ${pattern}:`, err);
            });
          } else {
            await redisService.delete(pattern).catch(err => {
              console.error(`Cache invalidation error for key ${pattern}:`, err);
            });
          }
        }
      }
    };

    res.json = async function(data: any) {
      await invalidateCache();
      return originalJson.call(this, data);
    };

    res.send = async function(data: any) {
      await invalidateCache();
      return originalSend.call(this, data);
    };

    next();
  };
}

// Common invalidation patterns
export const invalidateLeaderboard = createInvalidationMiddleware((req) => [
  `api:leaderboard:${req.params.tournamentId || req.body?.tournamentId || '*'}`,
  `beer_olympics:leaderboard:*`,
]);

export const invalidateTournament = createInvalidationMiddleware((req) => [
  `api:tournament:${req.params.id || req.body?.id || '*'}`,
  `beer_olympics:tournament:*`,
]);

export const invalidateMatch = createInvalidationMiddleware((req) => [
  `api:match:${req.params.id || req.body?.id || '*'}`,
  `beer_olympics:match:*`,
  `beer_olympics:leaderboard:*`, // Matches affect leaderboards
]);

export const invalidateTeam = createInvalidationMiddleware((req) => [
  `api:team:${req.params.id || req.body?.id || '*'}`,
  `beer_olympics:team:*`,
]);