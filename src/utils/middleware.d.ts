export declare const createRateLimit: (options: {
    windowMs?: number;
    max?: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
}) => import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const apiRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const publicRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const strictRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const securityHeaders: {
    'X-Content-Type-Options': string;
    'X-XSS-Protection': string;
    'X-Frame-Options': string;
    'Referrer-Policy': string;
    'Content-Security-Policy': string;
    'Permissions-Policy': string;
};
export declare function applySecurityHeaders(res: any): void;
export declare function applyCorsHeaders(res: any, origin?: string): void;
export declare function getClientIp(req: any): string;
export declare function validateApiKey(req: any): boolean;
export interface CacheOptions {
    ttl?: number;
    keyGenerator?: (req: any) => string;
    condition?: (req: any) => boolean;
    skipCache?: (req: any) => boolean;
}
export declare function createCacheMiddleware(options?: CacheOptions): (req: any, res: any, next: any) => Promise<any>;
export declare const leaderboardCache: (req: any, res: any, next: any) => Promise<any>;
export declare const tournamentCache: (req: any, res: any, next: any) => Promise<any>;
export declare const matchCache: (req: any, res: any, next: any) => Promise<any>;
export declare const teamCache: (req: any, res: any, next: any) => Promise<any>;
export declare function createInvalidationMiddleware(patterns: string[] | ((req: any) => string[])): (req: any, res: any, next: any) => Promise<any>;
export declare const invalidateLeaderboard: (req: any, res: any, next: any) => Promise<any>;
export declare const invalidateTournament: (req: any, res: any, next: any) => Promise<any>;
export declare const invalidateMatch: (req: any, res: any, next: any) => Promise<any>;
export declare const invalidateTeam: (req: any, res: any, next: any) => Promise<any>;
