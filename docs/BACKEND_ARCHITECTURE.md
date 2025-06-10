# Backend Architecture Documentation

## Overview

The Beer Olympics backend is a serverless architecture built on Vercel Functions with tRPC for type-safe API communication. The system emphasizes simplicity, type safety, and scalability while maintaining full control over data and business logic.

## Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Vercel Edge    │    │   Couchbase     │
│   (React)       │◄──►│   Functions      │◄──►│   Capella       │
│                 │    │                  │    │                 │
│ • tRPC Client   │    │ • API Routes     │    │ • Documents     │
│ • React Query   │    │ • Auth Handlers  │    │ • N1QL Queries  │
│ • Auth Context  │    │ • tRPC Router    │    │ • Indexes       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    ┌────▼────┐              ┌────▼────┐              ┌────▼────┐
    │ Browser │              │ Node.js │              │ Cloud   │
    │ Storage │              │ Runtime │              │ Storage │
    └─────────┘              └─────────┘              └─────────┘
```

## Core Components

### 1. API Layer (`/api/`)

The API layer consists of Vercel serverless functions organized by feature:

```
api/
├── auth/                 # Authentication endpoints
│   ├── google.js        # OAuth initiation
│   ├── callback.js      # OAuth callback handler
│   ├── me.js           # Current user info
│   └── logout.js       # Session termination
├── trpc/
│   └── [trpc].js       # tRPC handler (all API routes)
├── health.js           # Health check endpoint
├── analytics.js        # Usage analytics
├── logs.js            # Application logging
├── metrics.js         # Performance metrics
└── errors.js          # Error reporting
```

### 2. Service Layer (`/src/services/`)

Business logic and external service integrations:

```
services/
├── auth.ts            # JWT and OAuth logic
├── couchbase.ts       # Database operations
├── monitoring.ts      # Application monitoring
└── pusher.ts         # Real-time communication
```

### 3. tRPC Router Layer (`/src/api/routers/`)

Type-safe API procedures organized by domain:

```
routers/
├── index.ts          # Main router composition
├── tournament.ts     # Tournament CRUD operations
├── team.ts          # Team management
├── match.ts         # Match and scoring
├── leaderboard.ts   # Rankings and statistics
└── media.ts         # File uploads and processing
```

## Request Flow

### 1. HTTP Request Processing

```
Incoming Request
     ↓
Vercel Edge Function
     ↓
CORS & Security Headers
     ↓
Authentication Middleware
     ↓
Rate Limiting
     ↓
tRPC Procedure Router
     ↓
Input Validation (Zod)
     ↓
Business Logic
     ↓
Database Operations
     ↓
Response Serialization
     ↓
HTTP Response
```

### 2. Authentication Flow

```
1. User clicks "Sign In"
2. GET /api/auth/google
3. Redirect to Google OAuth
4. User authorizes app
5. GET /api/auth/callback?code=...
6. Verify code with Google
7. Create/update user in Couchbase
8. Generate JWT token
9. Set HTTP-only cookie
10. Redirect to dashboard
```

### 3. API Request Flow

```
1. Frontend makes tRPC call
2. HTTP request to /api/trpc
3. Parse JWT from cookie
4. Validate user session
5. Route to appropriate procedure
6. Execute business logic
7. Query/update database
8. Return typed response
```

## Data Layer Architecture

### Document Design

The system uses a document-oriented approach with consistent key patterns:

```typescript
// Key Pattern: {type}::{identifier}
interface DocumentKey {
  user: `user::${string}`;           // user::google-123456
  tournament: `tournament::${string}`; // tournament::summer-2024
  team: `team::${string}`;           // team::uuid-here
  match: `match::${string}`;         // match::uuid-here
  event: `event::${string}`;         // event::beer-pong
  score: `score::${string}`;         // score::submission-id
  media: `media::${string}`;         // media::uuid-here
  login: `login::${string}::${number}`; // login::user-id::timestamp
}
```

### Relationship Modeling

```typescript
// Tournament → Teams (1:many)
interface Tournament {
  id: string;
  slug: string;
  teams: string[];  // Array of team IDs
}

interface Team {
  id: string;
  tournamentId: string;  // Reference to tournament
  members: string[];     // Array of user IDs
}

// Team → Matches (many:many)
interface Match {
  id: string;
  tournamentId: string;
  team1Id: string;
  team2Id: string;
  eventId: string;
  scores: Score[];
}
```

### Query Patterns

```sql
-- Get tournament with teams
SELECT t.*, 
       ARRAY_AGG(teams.name) as team_names
FROM beer_olympics t
LEFT JOIN beer_olympics teams ON KEYS ARRAY "team::" || team_id FOR team_id IN t.teams END
WHERE META(t).id = "tournament::summer-2024"
GROUP BY META(t).id;

-- Leaderboard query
SELECT team.name, 
       SUM(CASE WHEN match.winnerId = team.id THEN 3 ELSE 1 END) as points,
       COUNT(match.id) as matches_played
FROM beer_olympics team
JOIN beer_olympics match ON match.team1Id = team.id OR match.team2Id = team.id
WHERE META(team).id LIKE "team::%"
AND team.tournamentId = "summer-2024"
GROUP BY team.id, team.name
ORDER BY points DESC;
```

## Middleware Stack

### 1. Security Middleware

```typescript
// CORS configuration
const corsMiddleware = (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', getAllowedOrigins());
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Security headers
const securityMiddleware = (res: Response) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
};
```

### 2. Authentication Middleware

```typescript
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  // Extract token from cookie or Authorization header
  const token = extractAuthToken(ctx.req);
  
  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  // Verify JWT and get user
  const user = verifyJWT(token);
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: { ...ctx, user }
  });
});
```

### 3. Rate Limiting Middleware

```typescript
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const identifier = ctx.user?.id || getClientIP(ctx.req);
  const key = `rate_limit::${identifier}`;
  
  const requests = await incrementRateLimit(key);
  if (requests > RATE_LIMIT_MAX) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
  }
  
  return next();
});
```

## Error Handling Strategy

### 1. Error Types

```typescript
enum ErrorCode {
  // Client errors (4xx)
  UNAUTHORIZED = 'UNAUTHORIZED',       // 401
  FORBIDDEN = 'FORBIDDEN',            // 403
  NOT_FOUND = 'NOT_FOUND',           // 404
  BAD_REQUEST = 'BAD_REQUEST',       // 400
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS', // 429
  
  // Server errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR', // 500
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',     // 503
}
```

### 2. Error Context

```typescript
interface ErrorContext {
  code: ErrorCode;
  message: string;
  path?: string;
  userId?: string;
  timestamp: string;
  requestId: string;
  stack?: string; // Only in development
}
```

### 3. Error Reporting

```typescript
const errorHandler = (error: Error, context: ErrorContext) => {
  // Log error details
  console.error('API Error:', {
    ...context,
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context });
  }
  
  // Return sanitized error to client
  return {
    code: context.code,
    message: context.message,
    requestId: context.requestId
  };
};
```

## Caching Strategy

### 1. Application-Level Caching

```typescript
// In-memory cache for frequently accessed data
const cache = new Map<string, { data: any; expires: number }>();

const getCachedData = async (key: string, fetcher: () => Promise<any>, ttl = 300000) => {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, expires: Date.now() + ttl });
  return data;
};
```

### 2. HTTP Response Caching

```typescript
// Cache tournament data for 5 minutes
res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');

// Cache leaderboards for 1 minute
res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');

// No cache for user-specific data
res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
```

## Performance Optimization

### 1. Database Query Optimization

```typescript
// Use indexes for common queries
const createIndexes = async () => {
  await query(`
    CREATE INDEX idx_tournament_status 
    ON beer_olympics(status) 
    WHERE META().id LIKE "tournament::%"
  `);
  
  await query(`
    CREATE INDEX idx_team_tournament 
    ON beer_olympics(tournamentId) 
    WHERE META().id LIKE "team::%"
  `);
};

// Batch operations when possible
const batchUpsert = async (documents: Array<{ key: string; value: any }>) => {
  const operations = documents.map(({ key, value }) => 
    collection.upsert(key, value)
  );
  
  await Promise.all(operations);
};
```

### 2. Request Batching

```typescript
// tRPC automatically batches requests
const queries = [
  trpc.tournament.get.useQuery({ slug }),
  trpc.team.list.useQuery({ tournamentId: slug }),
  trpc.leaderboard.get.useQuery({ tournamentId: slug })
];

// Results in single HTTP request to /api/trpc
```

## Monitoring & Observability

### 1. Health Checks

```typescript
// /api/health endpoint
export default async function handler(req: Request, res: Response) {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkExternalServices(),
    checkMemoryUsage(),
  ]);
  
  const healthy = checks.every(check => check.status === 'fulfilled');
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: checks.map((check, i) => ({
      name: ['database', 'external', 'memory'][i],
      status: check.status === 'fulfilled' ? 'pass' : 'fail',
      message: check.status === 'rejected' ? check.reason.message : 'OK'
    }))
  });
}
```

### 2. Metrics Collection

```typescript
// Custom metrics
const metrics = {
  requestCount: 0,
  errorCount: 0,
  responseTime: [] as number[],
  activeUsers: new Set<string>(),
};

// Middleware to collect metrics
const metricsMiddleware = t.middleware(async ({ ctx, next }) => {
  const start = Date.now();
  metrics.requestCount++;
  
  if (ctx.user) {
    metrics.activeUsers.add(ctx.user.id);
  }
  
  try {
    const result = await next();
    metrics.responseTime.push(Date.now() - start);
    return result;
  } catch (error) {
    metrics.errorCount++;
    throw error;
  }
});
```

## Security Considerations

### 1. Input Validation

```typescript
// All inputs validated with Zod schemas
const TournamentCreateSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(50),
  description: z.string().max(1000).optional(),
});

// SQL injection prevention through parameterized queries
const query = `
  SELECT * FROM beer_olympics 
  WHERE tournamentId = $tournamentId 
  AND status = $status
`;
await cluster.query(query, { tournamentId, status });
```

### 2. Authorization

```typescript
// Resource-level authorization
const checkTournamentOwnership = async (tournamentId: string, userId: string) => {
  const tournament = await getDocument(`tournament::${tournamentId}`);
  if (tournament.ownerId !== userId) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
};

// Team membership checks
const checkTeamMembership = async (teamId: string, userId: string) => {
  const team = await getDocument(`team::${teamId}`);
  if (!team.members.includes(userId)) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
};
```

## Deployment Architecture

### 1. Vercel Functions

```typescript
// Each API route is a separate serverless function
export default async function handler(req: Request, res: Response) {
  // Function runs in isolated environment
  // Cold start: ~100-300ms
  // Warm execution: ~10-50ms
  
  // Environment variables available
  const dbConfig = {
    connectionString: process.env.COUCHBASE_CONNECTION_STRING,
    username: process.env.COUCHBASE_USERNAME,
    password: process.env.COUCHBASE_PASSWORD,
  };
}
```

### 2. Environment Configuration

```typescript
// Development
const config = {
  database: {
    timeout: 15000,
    retries: 3,
  },
  auth: {
    cookieSecure: false,
    mockAuth: true,
  },
  logging: {
    level: 'debug',
    console: true,
  }
};

// Production
const config = {
  database: {
    timeout: 10000,
    retries: 2,
  },
  auth: {
    cookieSecure: true,
    mockAuth: false,
  },
  logging: {
    level: 'info',
    console: false,
    external: true,
  }
};
```

## Scalability Considerations

### 1. Horizontal Scaling

- **Stateless Functions**: Each request handled independently
- **Database Connection Pool**: Managed by Couchbase SDK
- **Auto-scaling**: Vercel handles function scaling automatically

### 2. Data Partitioning

```typescript
// Tournament-based partitioning
const getShardKey = (tournamentId: string) => {
  return `shard::${tournamentId.slice(-2)}`;
};

// Geographic distribution consideration
const getDatabaseCluster = (region: string) => {
  return region === 'us-east' ? 'primary' : 'replica';
};
```

### 3. Performance Limits

- **Function Duration**: 60 seconds max (Vercel Pro)
- **Memory**: 1024MB max per function
- **Concurrent Executions**: 1000 per account
- **Database Connections**: Pool managed by SDK

This architecture provides a solid foundation for the Beer Olympics platform with room for growth and excellent developer experience.