import { Redis as RedisClient } from 'ioredis';
export declare class RedisError extends Error {
    code?: string;
    constructor(message: string, code?: string);
}
export declare const CACHE_TTL: {
    LEADERBOARD: number;
    USER_SESSION: number;
    USER_PROFILE: number;
    TOURNAMENT_STATE: number;
    TOURNAMENT_STANDINGS: number;
    MATCH_RESULTS: number;
    TEAM_DATA: number;
    STATS: number;
    DEFAULT: number;
};
export declare function getRedisClient(): Promise<RedisClient>;
export declare function cacheGet<T>(key: string): Promise<T | null>;
export declare function cacheSet<T>(key: string, value: T, ttl?: number): Promise<boolean>;
export declare function cacheMultiGet<T>(keys: string[]): Promise<(T | null)[]>;
export declare function cacheDelete(key: string | string[]): Promise<number>;
export declare function cacheDeletePattern(pattern: string): Promise<number>;
export declare function cacheExists(key: string): Promise<boolean>;
export declare function cacheTTL(key: string): Promise<number>;
export declare function cacheIncrement(key: string, increment?: number): Promise<number | null>;
export declare function cacheWarm<T>(key: string, fetchFunction: () => Promise<T>, ttl?: number): Promise<T>;
export declare function closeRedisConnection(): Promise<void>;
export declare const redisService: {
    get: typeof cacheGet;
    set: typeof cacheSet;
    multiGet: typeof cacheMultiGet;
    delete: typeof cacheDelete;
    deletePattern: typeof cacheDeletePattern;
    exists: typeof cacheExists;
    ttl: typeof cacheTTL;
    increment: typeof cacheIncrement;
    warm: typeof cacheWarm;
    close: typeof closeRedisConnection;
    CACHE_TTL: {
        LEADERBOARD: number;
        USER_SESSION: number;
        USER_PROFILE: number;
        TOURNAMENT_STATE: number;
        TOURNAMENT_STANDINGS: number;
        MATCH_RESULTS: number;
        TEAM_DATA: number;
        STATS: number;
        DEFAULT: number;
    };
    RedisError: typeof RedisError;
};
export default redisService;
