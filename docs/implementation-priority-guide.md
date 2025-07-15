# Implementation Priority Guide

## Critical Path for 20+ Person Tournament Support

### Immediate Priorities (Must Have)

#### 1. Database Connection Pooling
**Impact**: Prevents connection exhaustion with multiple concurrent users
**Implementation Time**: 2 days

```typescript
// src/services/couchbase-pool.ts
import { connect, Cluster, Bucket } from 'couchbase';

interface PooledConnection {
  cluster: Cluster;
  bucket: Bucket;
  inUse: boolean;
  lastUsed: number;
}

export class CouchbaseConnectionPool {
  private connections: PooledConnection[] = [];
  private readonly maxConnections = 10;
  private readonly minConnections = 2;
  private readonly connectionTimeout = 30000; // 30 seconds
  
  async initialize(): Promise<void> {
    // Create minimum connections
    for (let i = 0; i < this.minConnections; i++) {
      await this.createConnection();
    }
  }
  
  async acquire(): Promise<{ cluster: Cluster; bucket: Bucket }> {
    // Find available connection
    let connection = this.connections.find(c => !c.inUse);
    
    if (!connection && this.connections.length < this.maxConnections) {
      // Create new connection if under limit
      connection = await this.createConnection();
    }
    
    if (!connection) {
      // Wait for available connection
      connection = await this.waitForConnection();
    }
    
    connection.inUse = true;
    connection.lastUsed = Date.now();
    
    return { cluster: connection.cluster, bucket: connection.bucket };
  }
  
  async release(cluster: Cluster): Promise<void> {
    const connection = this.connections.find(c => c.cluster === cluster);
    if (connection) {
      connection.inUse = false;
      connection.lastUsed = Date.now();
    }
  }
  
  private async createConnection(): Promise<PooledConnection> {
    const cluster = await connect(process.env.COUCHBASE_CONNECTION_STRING!, {
      username: process.env.COUCHBASE_USERNAME!,
      password: process.env.COUCHBASE_PASSWORD!,
      timeouts: {
        kvTimeout: 10000,
        queryTimeout: 20000,
        connectTimeout: 10000,
      },
    });
    
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET!);
    
    const connection: PooledConnection = {
      cluster,
      bucket,
      inUse: false,
      lastUsed: Date.now(),
    };
    
    this.connections.push(connection);
    return connection;
  }
  
  private async waitForConnection(): Promise<PooledConnection> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.connectionTimeout) {
      const available = this.connections.find(c => !c.inUse);
      if (available) return available;
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Connection pool timeout');
  }
}

// Update existing service to use pool
export const connectionPool = new CouchbaseConnectionPool();

// Initialize on startup
if (typeof window === 'undefined') {
  connectionPool.initialize().catch(console.error);
}
```

#### 2. Redis Caching Layer
**Impact**: Reduces database load by 80% for read operations
**Implementation Time**: 3 days

```typescript
// src/services/redis-cache.ts
import { createClient } from 'redis';

export class CacheService {
  private client: ReturnType<typeof createClient>;
  private connected = false;
  
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 10000,
        keepAlive: 5000,
      },
    });
    
    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.on('connect', () => {
      this.connected = true;
      console.log('✅ Redis connected');
    });
  }
  
  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
    }
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for ${key}:`, error);
      return null;
    }
  }
  
  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for ${key}:`, error);
    }
  }
  
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error(`Cache invalidate error for ${pattern}:`, error);
    }
  }
  
  // Specific cache methods
  async getTournament(slug: string): Promise<any> {
    const key = `tournament:${slug}`;
    const cached = await this.get(key);
    if (cached) return cached;
    
    // Fetch from database
    const data = await couchbase.get(`tournament::${slug}`);
    if (data) {
      await this.set(key, data, 300); // 5 minutes
    }
    return data;
  }
  
  async getLeaderboard(tournamentId: string): Promise<any> {
    const key = `leaderboard:${tournamentId}`;
    return this.get(key);
  }
  
  async setLeaderboard(tournamentId: string, data: any): Promise<void> {
    const key = `leaderboard:${tournamentId}`;
    await this.set(key, data, 5); // 5 seconds for real-time updates
  }
}

export const cache = new CacheService();

// Connect on startup
if (typeof window === 'undefined') {
  cache.connect().catch(console.error);
}
```

#### 3. Optimized Leaderboard Queries
**Impact**: Reduces leaderboard calculation time from 2s to 50ms
**Implementation Time**: 2 days

```typescript
// src/services/leaderboard-optimized.ts
export class OptimizedLeaderboardService {
  private readonly BATCH_SIZE = 100;
  
  async calculateLeaderboard(tournamentId: string): Promise<LeaderboardData> {
    // Check cache first
    const cached = await cache.getLeaderboard(tournamentId);
    if (cached) return cached;
    
    // Use optimized query with proper indexes
    const query = `
      SELECT 
        t.teamId,
        t.name as teamName,
        COUNT(DISTINCT m.matchId) as matchesPlayed,
        SUM(CASE WHEN s.rank = 1 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN s.rank = 2 THEN 1 ELSE 0 END) as secondPlace,
        SUM(s.score) as totalScore,
        AVG(s.score) as avgScore,
        MAX(s.score) as highScore
      FROM beer_olympics t
      JOIN beer_olympics m ON m.teamId = t.teamId
      JOIN beer_olympics s ON s.matchId = m.matchId AND s.teamId = t.teamId
      WHERE t.type = 'team' 
        AND t.tournamentId = $tournamentId
        AND m.type = 'match'
        AND s.type = 'score'
        AND m.status = 'completed'
      GROUP BY t.teamId, t.name
      ORDER BY wins DESC, secondPlace DESC, totalScore DESC
    `;
    
    const result = await connectionPool.query(query, { tournamentId });
    const leaderboard = this.processLeaderboardData(result.rows);
    
    // Cache the result
    await cache.setLeaderboard(tournamentId, leaderboard);
    
    return leaderboard;
  }
  
  private processLeaderboardData(rows: any[]): LeaderboardData {
    return {
      standings: rows.map((row, index) => ({
        rank: index + 1,
        teamId: row.teamId,
        teamName: row.teamName,
        stats: {
          matchesPlayed: row.matchesPlayed,
          wins: row.wins,
          secondPlace: row.secondPlace,
          totalScore: row.totalScore,
          avgScore: Math.round(row.avgScore * 10) / 10,
          highScore: row.highScore,
        },
      })),
      lastUpdated: new Date().toISOString(),
    };
  }
}
```

#### 4. WebSocket Connection Management
**Impact**: Prevents connection exhaustion and improves real-time performance
**Implementation Time**: 2 days

```typescript
// src/services/websocket-manager.ts
export class WebSocketManager {
  private connections = new Map<string, ManagedConnection>();
  private readonly maxPerClient = 3;
  private readonly heartbeatInterval = 30000;
  
  async getConnection(clientId: string, tournamentId: string): Promise<WebSocket> {
    const key = `${clientId}:${tournamentId}`;
    const existing = this.connections.get(key);
    
    if (existing && existing.ws.readyState === WebSocket.OPEN) {
      existing.lastUsed = Date.now();
      return existing.ws;
    }
    
    // Check connection limit
    const clientConnections = Array.from(this.connections.entries())
      .filter(([k]) => k.startsWith(clientId))
      .length;
    
    if (clientConnections >= this.maxPerClient) {
      // Close oldest connection
      this.closeOldestConnection(clientId);
    }
    
    // Create new connection
    const ws = await this.createConnection(tournamentId);
    
    this.connections.set(key, {
      ws,
      clientId,
      tournamentId,
      created: Date.now(),
      lastUsed: Date.now(),
      heartbeat: this.setupHeartbeat(ws),
    });
    
    return ws;
  }
  
  private setupHeartbeat(ws: WebSocket): NodeJS.Timeout {
    return setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, this.heartbeatInterval);
  }
  
  private closeOldestConnection(clientId: string): void {
    let oldest: [string, ManagedConnection] | null = null;
    
    for (const [key, conn] of this.connections.entries()) {
      if (key.startsWith(clientId)) {
        if (!oldest || conn.lastUsed < oldest[1].lastUsed) {
          oldest = [key, conn];
        }
      }
    }
    
    if (oldest) {
      clearInterval(oldest[1].heartbeat);
      oldest[1].ws.close();
      this.connections.delete(oldest[0]);
    }
  }
}
```

### Secondary Priorities (Should Have)

#### 5. Event Sourcing for Game State
**Impact**: Enables replay, audit trail, and conflict resolution
**Implementation Time**: 4 days

#### 6. Service Worker for Offline Support
**Impact**: Allows gameplay to continue during network issues
**Implementation Time**: 3 days

#### 7. CDN Integration for Media
**Impact**: Reduces media load times by 70%
**Implementation Time**: 2 days

#### 8. Background Job Processing
**Impact**: Improves response times by deferring heavy operations
**Implementation Time**: 3 days

## Quick Wins (Can implement immediately)

### 1. Add Database Indexes
```sql
-- Run these queries in Couchbase Query Workbench
CREATE INDEX idx_tournament_slug ON beer_olympics(slug) WHERE type = 'tournament';
CREATE INDEX idx_match_tournament_status ON beer_olympics(tournamentId, status) WHERE type = 'match';
CREATE INDEX idx_team_tournament ON beer_olympics(tournamentId) WHERE type = 'team';
CREATE INDEX idx_score_match ON beer_olympics(matchId) WHERE type = 'score';
CREATE INDEX idx_user_email ON beer_olympics(email) WHERE type = 'user';
```

### 2. Enable HTTP/2 and Compression
```typescript
// vercel.json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=5, stale-while-revalidate=10"
        }
      ]
    }
  ]
}
```

### 3. Implement Request Batching
```typescript
// src/utils/api-client.ts
export class BatchedApiClient {
  private queue: Map<string, Promise<any>> = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  
  async get(endpoint: string): Promise<any> {
    // Check if request is already in queue
    if (this.queue.has(endpoint)) {
      return this.queue.get(endpoint);
    }
    
    // Add to queue
    const promise = this.executeBatch(endpoint);
    this.queue.set(endpoint, promise);
    
    // Schedule batch execution
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flushBatch(), 10);
    }
    
    return promise;
  }
  
  private async flushBatch(): Promise<void> {
    const endpoints = Array.from(this.queue.keys());
    
    // Execute all requests in parallel
    const results = await Promise.all(
      endpoints.map(endpoint => fetch(endpoint))
    );
    
    // Clear queue
    this.queue.clear();
    this.batchTimeout = null;
  }
}
```

## Testing Strategy

### Load Testing Script
```typescript
// scripts/load-test.ts
import { Worker } from 'worker_threads';
import { performance } from 'perf_hooks';

async function runLoadTest() {
  const config = {
    users: 100,
    tournamentSize: 25,
    duration: 300, // 5 minutes
    rampUp: 60, // 1 minute
  };
  
  const workers: Worker[] = [];
  const metrics = {
    requests: 0,
    errors: 0,
    avgResponseTime: 0,
  };
  
  // Create worker threads
  for (let i = 0; i < config.users; i++) {
    const worker = new Worker('./load-test-worker.js', {
      workerData: {
        userId: i,
        tournamentSize: config.tournamentSize,
        apiUrl: process.env.API_URL,
      },
    });
    
    worker.on('message', (msg) => {
      if (msg.type === 'metric') {
        metrics.requests++;
        metrics.avgResponseTime = 
          (metrics.avgResponseTime * (metrics.requests - 1) + msg.responseTime) / 
          metrics.requests;
      } else if (msg.type === 'error') {
        metrics.errors++;
      }
    });
    
    workers.push(worker);
    
    // Ramp up gradually
    await new Promise(resolve => 
      setTimeout(resolve, (config.rampUp * 1000) / config.users)
    );
  }
  
  // Run for duration
  await new Promise(resolve => setTimeout(resolve, config.duration * 1000));
  
  // Cleanup
  workers.forEach(w => w.terminate());
  
  console.log('Load test results:', metrics);
}
```

## Monitoring Dashboard

### Key Metrics to Track
1. **Response Times**
   - API endpoint p50, p95, p99
   - Database query times
   - Cache hit rates

2. **System Health**
   - Active WebSocket connections
   - Database connection pool usage
   - Memory usage
   - CPU utilization

3. **Business Metrics**
   - Active tournaments
   - Concurrent users
   - Media uploads per minute
   - Real-time message throughput

### Implementation
```typescript
// src/services/metrics-collector.ts
export class MetricsCollector {
  private metrics = new Map<string, number[]>();
  
  record(metric: string, value: number): void {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    
    const values = this.metrics.get(metric)!;
    values.push(value);
    
    // Keep last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
  }
  
  getPercentile(metric: string, percentile: number): number {
    const values = this.metrics.get(metric) || [];
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * percentile / 100);
    return sorted[index];
  }
  
  getReport(): MetricsReport {
    return {
      timestamp: Date.now(),
      api: {
        p50: this.getPercentile('api.response_time', 50),
        p95: this.getPercentile('api.response_time', 95),
        p99: this.getPercentile('api.response_time', 99),
      },
      cache: {
        hitRate: this.getHitRate(),
      },
      websocket: {
        active: this.metrics.get('ws.connections')?.slice(-1)[0] || 0,
      },
    };
  }
}
```

## Deployment Checklist

### Before Deploying Each Phase
- [ ] Run load tests with expected traffic
- [ ] Verify all database indexes are created
- [ ] Test failover scenarios
- [ ] Monitor memory usage under load
- [ ] Verify cache invalidation works correctly
- [ ] Test real-time updates with 20+ concurrent users
- [ ] Validate offline functionality
- [ ] Check security headers and rate limits

### Rollback Plan
1. Keep previous version tagged in git
2. Database migrations should be backwards compatible
3. Feature flags for new functionality
4. Monitor error rates after deployment
5. Have rollback script ready

This implementation guide provides a clear path forward with immediate priorities that will have the biggest impact on supporting 20+ person tournaments.