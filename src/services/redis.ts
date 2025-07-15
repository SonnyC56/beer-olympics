import Redis, { Redis as RedisClient } from 'ioredis';

// Singleton Redis client with connection pooling
let redisClient: RedisClient | null = null;
let isConnecting = false;

export class RedisError extends Error {
  public code?: string;
  
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'RedisError';
    this.code = code;
  }
}

// Configuration for Redis connection
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableOfflineQueue: true,
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  lazyConnect: false,
  // Connection pooling configuration
  enableReadyCheck: true,
  enableAutoPipelining: true, // Automatically batch commands
  keepAlive: 30000,
};

// TTL configurations (in seconds)
export const CACHE_TTL = {
  LEADERBOARD: 5,              // 5 seconds for real-time updates
  USER_SESSION: 3600,           // 1 hour for sessions
  USER_PROFILE: 300,            // 5 minutes for profiles
  TOURNAMENT_STATE: 60,         // 1 minute for tournament data
  TOURNAMENT_STANDINGS: 10,     // 10 seconds for standings
  MATCH_RESULTS: 30,            // 30 seconds for match data
  TEAM_DATA: 120,               // 2 minutes for team info
  STATS: 60,                    // 1 minute for statistics
  DEFAULT: 300,                 // 5 minutes default
};

// Get or create Redis connection
export async function getRedisClient(): Promise<RedisClient> {
  if (redisClient?.status === 'ready') {
    return redisClient;
  }

  if (isConnecting) {
    // Wait for ongoing connection
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (redisClient?.status === 'ready') {
      return redisClient;
    }
  }

  isConnecting = true;

  try {
    redisClient = new Redis(REDIS_CONFIG);

    // Set up event handlers
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });

    redisClient.on('close', () => {
      console.log('Redis Client Connection Closed');
    });

    // Wait for connection to be ready
    await redisClient.ping();

    return redisClient;
  } catch (error) {
    redisClient = null;
    throw new RedisError(
      `Failed to connect to Redis: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    isConnecting = false;
  }
}

// Cache wrapper with automatic serialization
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const value = await client.get(key);
    
    if (!value) return null;
    
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error);
    return null; // Graceful fallback on cache miss
  }
}

export async function cacheSet<T>(
  key: string, 
  value: T, 
  ttl: number = CACHE_TTL.DEFAULT
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const serialized = JSON.stringify(value);
    
    if (ttl > 0) {
      await client.setex(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }
    
    return true;
  } catch (error) {
    console.error(`Redis SET error for key ${key}:`, error);
    return false; // Graceful failure
  }
}

// Batch operations for performance
export async function cacheMultiGet<T>(keys: string[]): Promise<(T | null)[]> {
  try {
    const client = await getRedisClient();
    const values = await client.mget(...keys);
    
    return values.map(value => {
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    });
  } catch (error) {
    console.error('Redis MGET error:', error);
    return keys.map(() => null);
  }
}

// Cache invalidation
export async function cacheDelete(key: string | string[]): Promise<number> {
  try {
    const client = await getRedisClient();
    const keys = Array.isArray(key) ? key : [key];
    
    if (keys.length === 0) return 0;
    
    return await client.del(...keys);
  } catch (error) {
    console.error('Redis DEL error:', error);
    return 0;
  }
}

// Pattern-based cache invalidation
export async function cacheDeletePattern(pattern: string): Promise<number> {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    
    if (keys.length === 0) return 0;
    
    return await client.del(...keys);
  } catch (error) {
    console.error('Redis pattern DEL error:', error);
    return 0;
  }
}

// Check if key exists
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`Redis EXISTS error for key ${key}:`, error);
    return false;
  }
}

// Get remaining TTL
export async function cacheTTL(key: string): Promise<number> {
  try {
    const client = await getRedisClient();
    return await client.ttl(key);
  } catch (error) {
    console.error(`Redis TTL error for key ${key}:`, error);
    return -1;
  }
}

// Increment counter (atomic operation)
export async function cacheIncrement(key: string, increment = 1): Promise<number | null> {
  try {
    const client = await getRedisClient();
    return await client.incrby(key, increment);
  } catch (error) {
    console.error(`Redis INCR error for key ${key}:`, error);
    return null;
  }
}

// Cache warming utility
export async function cacheWarm<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl: number = CACHE_TTL.DEFAULT
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFunction();
  
  // Store in cache
  await cacheSet(key, data, ttl);
  
  return data;
}

// Close Redis connection gracefully
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Export main service object
export const redisService = {
  get: cacheGet,
  set: cacheSet,
  multiGet: cacheMultiGet,
  delete: cacheDelete,
  deletePattern: cacheDeletePattern,
  exists: cacheExists,
  ttl: cacheTTL,
  increment: cacheIncrement,
  warm: cacheWarm,
  close: closeRedisConnection,
  CACHE_TTL,
  RedisError,
};

export default redisService;