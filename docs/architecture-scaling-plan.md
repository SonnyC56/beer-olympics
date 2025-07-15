# Beer Olympics Architecture Scaling Plan

## Current Architecture Analysis

### Strengths
- Couchbase NoSQL database provides good scalability foundation
- Pusher integration for real-time updates
- Next.js/Vercel deployment with serverless functions
- Basic WebSocket fallback implementation exists

### Weaknesses
- No caching layer (Redis/Memcached)
- Single database connection pattern (no connection pooling)
- Simple API endpoints without pagination or filtering
- No event sourcing for game state
- Limited offline capabilities
- No CDN for media assets
- Basic performance monitoring only

## Scaling Requirements for 20+ Person Tournaments

### Performance Requirements
- Support 100+ concurrent users per tournament
- Real-time updates for 10+ simultaneous matches
- Sub-100ms response times for leaderboard updates
- Handle 1000+ media uploads per tournament
- Support offline gameplay with sync

### Infrastructure Requirements
- Horizontal scaling across multiple instances
- Database query optimization
- WebSocket connection management
- Distributed caching
- Background job processing
- CDN for media delivery

## Proposed Architecture Improvements

### 1. Database Layer Enhancements

#### Connection Pooling
```typescript
// src/services/couchbase-pool.ts
export class CouchbasePool {
  private pool: Cluster[] = [];
  private readonly maxConnections = 10;
  private readonly minConnections = 2;
  
  async getConnection(): Promise<Cluster> {
    // Implement connection pooling logic
  }
  
  async releaseConnection(cluster: Cluster): Promise<void> {
    // Return connection to pool
  }
}
```

#### Query Optimization
- Create indexes for common queries:
  ```sql
  CREATE INDEX idx_tournament_date ON beer_olympics(date) WHERE type = 'tournament';
  CREATE INDEX idx_match_tournament ON beer_olympics(tournamentId) WHERE type = 'match';
  CREATE INDEX idx_team_tournament ON beer_olympics(tournamentId) WHERE type = 'team';
  CREATE INDEX idx_score_match ON beer_olympics(matchId) WHERE type = 'score';
  ```

#### Materialized Views for Leaderboards
```typescript
// src/services/leaderboard-cache.ts
export class LeaderboardCache {
  private cache: Map<string, LeaderboardData> = new Map();
  private readonly TTL = 5000; // 5 seconds
  
  async getLeaderboard(tournamentId: string): Promise<LeaderboardData> {
    const cached = this.cache.get(tournamentId);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached;
    }
    
    // Fetch and cache
    const data = await this.calculateLeaderboard(tournamentId);
    this.cache.set(tournamentId, { ...data, timestamp: Date.now() });
    return data;
  }
}
```

### 2. Caching Infrastructure

#### Redis Integration
```typescript
// src/services/redis.ts
import { createClient } from 'redis';

export class RedisCache {
  private client: ReturnType<typeof createClient>;
  
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 10000,
        keepAlive: 5000,
      }
    });
  }
  
  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const options = ttl ? { EX: ttl } : undefined;
    await this.client.set(key, JSON.stringify(value), options);
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}
```

#### Cache Strategy
- **Session Data**: 30 minutes TTL
- **Tournament Metadata**: 5 minutes TTL
- **Leaderboard Data**: 5 seconds TTL
- **User Profiles**: 1 hour TTL
- **Match Results**: Immutable (permanent cache)

### 3. Real-time Infrastructure

#### WebSocket Connection Pool
```typescript
// src/services/websocket-pool.ts
export class WebSocketPool {
  private connections: Map<string, WebSocket[]> = new Map();
  private readonly maxConnectionsPerClient = 5;
  
  async getConnection(clientId: string): Promise<WebSocket> {
    const existing = this.connections.get(clientId) || [];
    
    // Reuse existing connection if available
    const available = existing.find(ws => ws.readyState === WebSocket.OPEN);
    if (available) return available;
    
    // Create new connection
    if (existing.length < this.maxConnectionsPerClient) {
      const ws = await this.createConnection();
      existing.push(ws);
      this.connections.set(clientId, existing);
      return ws;
    }
    
    throw new Error('Connection limit reached');
  }
}
```

#### Pusher Channel Optimization
```typescript
// src/services/pusher-optimized.ts
export class OptimizedPusherService {
  private channelCache: Map<string, Channel> = new Map();
  private presenceData: Map<string, PresenceData> = new Map();
  
  subscribeToTournament(tournamentId: string): Channel {
    const channelName = `presence-tournament-${tournamentId}`;
    
    // Return cached channel if exists
    if (this.channelCache.has(channelName)) {
      return this.channelCache.get(channelName)!;
    }
    
    // Create batched channel for efficiency
    const channel = this.pusher.subscribe(channelName, {
      batch: true,
      batchDelay: 100, // Batch events for 100ms
    });
    
    this.channelCache.set(channelName, channel);
    return channel;
  }
}
```

### 4. Edge Functions & CDN

#### Vercel Edge Config
```typescript
// api/edge/leaderboard.ts
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'fra1'], // Multi-region deployment
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get('tournamentId');
  
  // Use edge KV store for ultra-fast reads
  const cached = await env.LEADERBOARD_KV.get(tournamentId);
  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  }
  
  // Fallback to origin
  return fetch(`${process.env.ORIGIN_URL}/api/leaderboard/${tournamentId}`);
}
```

#### CDN Configuration
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['res.cloudinary.com'],
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/beerlympics/image/upload/',
  },
  async headers() {
    return [
      {
        source: '/api/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### 5. Offline-First Architecture

#### Service Worker Implementation
```typescript
// public/sw.js
const CACHE_NAME = 'beer-olympics-v1';
const API_CACHE_NAME = 'beer-olympics-api-v1';

// Cache strategies
const cacheStrategies = {
  networkFirst: ['/api/tournament/', '/api/matches/'],
  cacheFirst: ['/static/', '/images/'],
  staleWhileRevalidate: ['/api/leaderboard/'],
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Determine strategy
  let strategy = 'networkFirst';
  for (const [strat, patterns] of Object.entries(cacheStrategies)) {
    if (patterns.some(pattern => url.pathname.startsWith(pattern))) {
      strategy = strat;
      break;
    }
  }
  
  event.respondWith(handleRequest(request, strategy));
});

async function handleRequest(request, strategy) {
  switch (strategy) {
    case 'networkFirst':
      return networkFirst(request);
    case 'cacheFirst':
      return cacheFirst(request);
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request);
    default:
      return fetch(request);
  }
}
```

#### Offline Queue
```typescript
// src/services/offline-queue.ts
export class OfflineQueue {
  private queue: QueueItem[] = [];
  private db: IDBDatabase;
  
  async addToQueue(action: GameAction): Promise<void> {
    const item: QueueItem = {
      id: generateId(),
      action,
      timestamp: Date.now(),
      retries: 0,
    };
    
    // Store in IndexedDB
    const tx = this.db.transaction(['queue'], 'readwrite');
    await tx.objectStore('queue').add(item);
    
    // Try to sync immediately
    this.syncQueue();
  }
  
  async syncQueue(): Promise<void> {
    if (!navigator.onLine) return;
    
    const tx = this.db.transaction(['queue'], 'readonly');
    const items = await tx.objectStore('queue').getAll();
    
    for (const item of items) {
      try {
        await this.processQueueItem(item);
        await this.removeFromQueue(item.id);
      } catch (error) {
        await this.handleSyncError(item, error);
      }
    }
  }
}
```

### 6. Event Sourcing for Game State

#### Event Store
```typescript
// src/services/event-store.ts
export interface GameEvent {
  id: string;
  type: 'MATCH_STARTED' | 'SCORE_UPDATED' | 'MATCH_COMPLETED';
  aggregateId: string;
  payload: any;
  timestamp: number;
  version: number;
}

export class EventStore {
  async append(event: GameEvent): Promise<void> {
    // Store event
    await couchbase.upsert(`event::${event.id}`, event);
    
    // Update aggregate version
    await this.updateAggregateVersion(event.aggregateId, event.version);
    
    // Publish to event bus
    await this.publishEvent(event);
  }
  
  async getEvents(aggregateId: string, fromVersion = 0): Promise<GameEvent[]> {
    const query = `
      SELECT * FROM beer_olympics
      WHERE type = 'event'
        AND aggregateId = $1
        AND version > $2
      ORDER BY version ASC
    `;
    
    const result = await couchbase.query(query, [aggregateId, fromVersion]);
    return result.rows;
  }
  
  async replay(aggregateId: string): Promise<GameState> {
    const events = await this.getEvents(aggregateId);
    return this.projectEvents(events);
  }
}
```

### 7. Background Job Processing

#### Job Queue Implementation
```typescript
// src/services/job-queue.ts
import Bull from 'bull';

export const queues = {
  media: new Bull('media-processing', process.env.REDIS_URL),
  notifications: new Bull('notifications', process.env.REDIS_URL),
  analytics: new Bull('analytics', process.env.REDIS_URL),
  leaderboard: new Bull('leaderboard-updates', process.env.REDIS_URL),
};

// Media processing job
queues.media.process(async (job) => {
  const { mediaId, tournamentId, operations } = job.data;
  
  // Resize images
  if (operations.includes('resize')) {
    await resizeImage(mediaId, [
      { width: 150, height: 150, suffix: 'thumb' },
      { width: 800, height: 600, suffix: 'medium' },
      { width: 1920, height: 1080, suffix: 'large' },
    ]);
  }
  
  // Detect highlights
  if (operations.includes('highlight-detection')) {
    const highlights = await detectHighlights(mediaId);
    await saveHighlights(tournamentId, highlights);
  }
  
  return { processed: true, mediaId };
});

// Leaderboard update job
queues.leaderboard.process(async (job) => {
  const { tournamentId } = job.data;
  
  // Calculate new standings
  const standings = await calculateStandings(tournamentId);
  
  // Update cache
  await redis.set(`leaderboard:${tournamentId}`, standings, 300);
  
  // Update materialized view
  await updateMaterializedView(tournamentId, standings);
  
  // Notify clients
  await pusher.trigger(`tournament-${tournamentId}`, 'leaderboard-updated', standings);
  
  return { updated: true, tournamentId };
});
```

### 8. Monitoring & Observability

#### Performance Tracking
```typescript
// src/services/monitoring.ts
import { StatsD } from 'node-statsd';

export class PerformanceMonitor {
  private statsd = new StatsD({
    host: process.env.STATSD_HOST,
    port: 8125,
    prefix: 'beer_olympics.',
  });
  
  trackApiCall(endpoint: string, duration: number, status: number): void {
    this.statsd.timing(`api.${endpoint}.duration`, duration);
    this.statsd.increment(`api.${endpoint}.${status}`);
  }
  
  trackDatabaseQuery(operation: string, duration: number): void {
    this.statsd.timing(`db.${operation}.duration`, duration);
    this.statsd.increment(`db.${operation}.count`);
  }
  
  trackCacheHit(key: string, hit: boolean): void {
    this.statsd.increment(`cache.${hit ? 'hit' : 'miss'}`);
  }
  
  trackWebSocketConnection(event: 'connect' | 'disconnect'): void {
    this.statsd.gauge('websocket.connections', event === 'connect' ? 1 : -1);
  }
}
```

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. Implement Redis caching layer
2. Add database connection pooling
3. Create indexes for common queries
4. Set up performance monitoring

### Phase 2: Real-time Optimization (Week 3-4)
1. Implement WebSocket connection pooling
2. Optimize Pusher channel usage
3. Add event batching for real-time updates
4. Implement presence channel optimization

### Phase 3: Offline & Edge (Week 5-6)
1. Deploy service worker for offline support
2. Implement offline queue with IndexedDB
3. Set up Vercel Edge functions for leaderboards
4. Configure CDN for media assets

### Phase 4: Advanced Features (Week 7-8)
1. Implement event sourcing for game state
2. Set up background job processing
3. Add materialized views for complex queries
4. Implement distributed caching

## Performance Targets

### Response Times
- API endpoints: < 100ms (p95)
- Leaderboard updates: < 50ms (cached)
- Media uploads: < 2s (including processing)
- WebSocket latency: < 20ms

### Scalability
- Concurrent users: 1000+ per tournament
- Matches per tournament: 100+
- Media storage: 10GB per tournament
- Real-time updates: 1000+ per second

### Availability
- Uptime: 99.9%
- Error rate: < 0.1%
- Cache hit ratio: > 80%
- Database connection pool utilization: < 70%

## Cost Optimization

### Resource Allocation
- Use Vercel Edge functions for read-heavy operations
- Implement aggressive caching to reduce database load
- Use CDN for all static assets
- Batch real-time updates to reduce Pusher costs

### Monitoring Costs
- Database queries per second
- Pusher message count
- CDN bandwidth usage
- Edge function invocations

## Security Considerations

### Rate Limiting
```typescript
// src/middleware/rate-limit.ts
export const rateLimits = {
  api: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
  }),
  
  media: rateLimit({
    windowMs: 60 * 1000,
    max: 10, // 10 uploads per minute
    skipSuccessfulRequests: false,
  }),
  
  websocket: {
    connections: 5, // Max 5 connections per IP
    messages: 100, // Max 100 messages per minute
  },
};
```

### Data Validation
- Implement strict input validation
- Use prepared statements for all queries
- Sanitize user-generated content
- Implement CORS properly for API endpoints

## Conclusion

This architecture plan provides a comprehensive approach to scaling the Beer Olympics platform for 20+ person tournaments. The phased implementation allows for gradual improvements while maintaining system stability. Key focus areas include caching, real-time optimization, offline support, and horizontal scaling capabilities.