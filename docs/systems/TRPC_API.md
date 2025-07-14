# tRPC API Documentation

## Overview

The Beer Olympics platform uses tRPC (TypeScript Remote Procedure Call) for type-safe API communication between the frontend and backend. This provides end-to-end type safety, automatic serialization, and excellent developer experience.

## Architecture

```
Frontend (React) → tRPC Client → HTTP/WebSocket → tRPC Server → Business Logic
      ↓               ↓             ↓              ↓              ↓
   React Query    Type Safety   JSON-RPC      Procedures     Database
```

## Core Setup

### 1. tRPC Server (`src/api/trpc.ts`)

```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Initialize tRPC with context
const t = initTRPC.context<Context>().create({
  transformer: superjson, // Handles Date, Map, Set serialization
});

// Export reusable components
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
```

### 2. tRPC Client (`src/utils/trpc.ts`)

```typescript
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../api/routers';

export const trpc = createTRPCReact<AppRouter>();

// Client configuration
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers: () => ({
        authorization: getAuthToken(),
      }),
    }),
  ],
});
```

### 3. React Integration (`src/main.tsx`)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from './utils/trpc';

const queryClient = new QueryClient();

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

## Router Structure

### Main Router (`src/api/routers/index.ts`)

```typescript
import { router } from '../trpc';
import { tournamentRouter } from './tournament';
import { teamRouter } from './team';
import { matchRouter } from './match';
import { leaderboardRouter } from './leaderboard';

export const appRouter = router({
  tournament: tournamentRouter,
  team: teamRouter,
  match: matchRouter,
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;
```

### Individual Routers

Each feature has its own router module:

#### Tournament Router (`src/api/routers/tournament.ts`)

```typescript
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const tournamentRouter = router({
  // Get public tournament info
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const tournament = await getDocument(`tournament::${input.slug}`);
      if (!tournament) throw new TRPCError({ code: 'NOT_FOUND' });
      return tournament;
    }),

  // Create new tournament (auth required)
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(3),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      description: z.string().optional(),
      maxTeams: z.number().min(2).max(32).default(16),
    }))
    .mutation(async ({ input, ctx }) => {
      const tournament = {
        ...input,
        id: input.slug,
        ownerId: ctx.user.id,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await upsertDocument(`tournament::${input.slug}`, tournament);
      return tournament;
    }),

  // List user's tournaments
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const query = `
        SELECT t.*, META(t).id as _id
        FROM beer_olympics t
        WHERE META(t).id LIKE "tournament::%"
        AND t.ownerId = $ownerId
        ORDER BY t.updatedAt DESC
      `;
      
      const result = await query(query, { ownerId: ctx.user.id });
      return result.rows.map(row => row.t);
    }),

  // Update tournament settings
  update: protectedProcedure
    .input(z.object({
      slug: z.string(),
      updates: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        maxTeams: z.number().min(2).max(32).optional(),
        status: z.enum(['draft', 'active', 'completed']).optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const tournament = await getDocument(`tournament::${input.slug}`);
      if (!tournament) throw new TRPCError({ code: 'NOT_FOUND' });
      if (tournament.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      const updated = {
        ...tournament,
        ...input.updates,
        updatedAt: new Date().toISOString(),
      };
      
      await upsertDocument(`tournament::${input.slug}`, updated);
      return updated;
    }),
});
```

## Procedure Types

### 1. Public Procedures
```typescript
const publicProcedure = t.procedure;

// No authentication required
// Used for: tournament info, leaderboards, public data
```

### 2. Protected Procedures
```typescript
const protectedProcedure = t.procedure.use(authMiddleware);

// Authentication required
// User context available via ctx.user
// Used for: creating tournaments, joining teams, submitting scores
```

### 3. Admin Procedures
```typescript
const adminProcedure = t.procedure.use(authMiddleware).use(adminMiddleware);

// Admin role required
// Used for: tournament management, user administration
```

## Middleware

### Authentication Middleware
```typescript
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const token = ctx.req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new TRPCError({ code: 'UNAUTHORIZED' });
  
  const user = verifyJWT(token);
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  
  return next({
    ctx: {
      ...ctx,
      user, // Available in protected procedures
    },
  });
});
```

### Rate Limiting Middleware
```typescript
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const ip = ctx.req.headers['x-forwarded-for'] || ctx.req.connection.remoteAddress;
  const key = `rate_limit::${ip}`;
  
  // Check rate limit logic
  const allowed = await checkRateLimit(key);
  if (!allowed) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
  
  return next();
});
```

## Frontend Usage

### 1. Queries (Data Fetching)
```typescript
function TournamentPage({ slug }: { slug: string }) {
  const { data: tournament, isLoading, error } = trpc.tournament.get.useQuery({ slug });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!tournament) return <NotFound />;
  
  return <TournamentDetails tournament={tournament} />;
}
```

### 2. Mutations (Data Modification)
```typescript
function CreateTournament() {
  const createMutation = trpc.tournament.create.useMutation({
    onSuccess: (tournament) => {
      // Redirect to new tournament
      navigate(`/tournaments/${tournament.slug}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleSubmit = (data: TournamentInput) => {
    createMutation.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createMutation.isLoading}
      >
        {createMutation.isLoading ? 'Creating...' : 'Create Tournament'}
      </button>
    </form>
  );
}
```

### 3. Optimistic Updates
```typescript
function JoinTeam({ tournamentId, teamId }: JoinTeamProps) {
  const utils = trpc.useContext();
  
  const joinMutation = trpc.team.join.useMutation({
    onMutate: async (newMember) => {
      // Cancel outgoing refetches
      await utils.team.get.cancel({ id: teamId });
      
      // Snapshot previous value
      const previousTeam = utils.team.get.getData({ id: teamId });
      
      // Optimistically update
      utils.team.get.setData({ id: teamId }, old => ({
        ...old!,
        members: [...old!.members, newMember],
      }));
      
      return { previousTeam };
    },
    onError: (err, newMember, context) => {
      // Rollback on error
      utils.team.get.setData({ id: teamId }, context?.previousTeam);
    },
    onSettled: () => {
      // Refetch after mutation
      utils.team.get.invalidate({ id: teamId });
    },
  });
  
  return (
    <button onClick={() => joinMutation.mutate({ teamId, userId: user.id })}>
      Join Team
    </button>
  );
}
```

## Input Validation

### Zod Schemas
```typescript
// Reusable schemas
const TournamentInput = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .min(3)
    .max(50),
  description: z.string().max(500).optional(),
  maxTeams: z.number().int().min(2).max(32).default(16),
});

const TeamInput = z.object({
  name: z.string().min(2).max(50),
  tournamentId: z.string(),
  captainId: z.string(),
});

// Usage in procedures
create: protectedProcedure
  .input(TournamentInput)
  .mutation(async ({ input, ctx }) => {
    // input is fully typed and validated
  });
```

### Custom Validators
```typescript
const slugValidator = z.string().refine(async (slug) => {
  const existing = await getDocument(`tournament::${slug}`);
  return !existing;
}, { message: 'Tournament slug already exists' });
```

## Error Handling

### tRPC Error Codes
```typescript
import { TRPCError } from '@trpc/server';

// Standard HTTP-like error codes
throw new TRPCError({
  code: 'NOT_FOUND',          // 404
  message: 'Tournament not found',
});

throw new TRPCError({
  code: 'UNAUTHORIZED',       // 401
  message: 'Login required',
});

throw new TRPCError({
  code: 'FORBIDDEN',          // 403
  message: 'Not tournament owner',
});

throw new TRPCError({
  code: 'BAD_REQUEST',        // 400
  message: 'Invalid input data',
});

throw new TRPCError({
  code: 'INTERNAL_SERVER_ERROR', // 500
  message: 'Database connection failed',
});
```

### Frontend Error Handling
```typescript
function TournamentList() {
  const { data, error } = trpc.tournament.list.useQuery();
  
  if (error) {
    if (error.data?.code === 'UNAUTHORIZED') {
      return <LoginPrompt />;
    }
    
    return <ErrorMessage message={error.message} />;
  }
  
  return <TournamentGrid tournaments={data} />;
}
```

## Real-time Updates

### Subscriptions (WebSocket)
```typescript
// Server-side subscription
liveLeaderboard: publicProcedure
  .input(z.object({ tournamentId: z.string() }))
  .subscription(({ input }) => {
    return observable<Leaderboard>((emit) => {
      const interval = setInterval(async () => {
        const leaderboard = await calculateLeaderboard(input.tournamentId);
        emit.next(leaderboard);
      }, 5000);
      
      return () => clearInterval(interval);
    });
  });

// Frontend usage
function LiveLeaderboard({ tournamentId }: { tournamentId: string }) {
  trpc.leaderboard.liveLeaderboard.useSubscription(
    { tournamentId },
    {
      onData: (leaderboard) => {
        // Update UI with new data
        setLeaderboard(leaderboard);
      },
    }
  );
}
```

## Performance Optimization

### Request Batching
```typescript
// Multiple queries batched into single HTTP request
const Component = () => {
  const tournament = trpc.tournament.get.useQuery({ slug });
  const teams = trpc.team.list.useQuery({ tournamentId: slug });
  const leaderboard = trpc.leaderboard.get.useQuery({ tournamentId: slug });
  
  // All three requests sent together
};
```

### Query Deduplication
```typescript
// Multiple components requesting same data = single request
const tournament = trpc.tournament.get.useQuery({ slug: 'summer-2024' });
```

### Caching Strategy
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      cacheTime: 10 * 60 * 1000,   // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

## Development Tools

### tRPC Panel
```typescript
// Add to development server
if (process.env.NODE_ENV === 'development') {
  app.use('/api/panel', await import('trpc-panel').then(mod => 
    mod.renderTrpcPanel(appRouter, { url: '/api/trpc' })
  ));
}
```

### Type Generation
```typescript
// Automatically generates types for frontend
export type AppRouter = typeof appRouter;

// Frontend gets full type safety
const result = trpc.tournament.create.useMutation();
//    ^-- Fully typed response
```

## Testing

### Unit Tests
```typescript
import { createCallerFactory } from '@trpc/server';

const createCaller = createCallerFactory(appRouter);

test('creates tournament', async () => {
  const caller = createCaller({
    user: mockUser,
    req: mockRequest,
  });
  
  const tournament = await caller.tournament.create({
    name: 'Test Tournament',
    slug: 'test-tournament',
  });
  
  expect(tournament.name).toBe('Test Tournament');
});
```

### Integration Tests
```typescript
import { httpBatchLink } from '@trpc/client';
import { createTRPCMsw } from 'msw-trpc';

const trpcMsw = createTRPCMsw<AppRouter>();

const handlers = [
  trpcMsw.tournament.get.query((req, res, ctx) => {
    return res(ctx.status(200), ctx.data(mockTournament));
  }),
];
```

## Deployment

### Vercel API Routes (`api/trpc/[trpc].js`)
```javascript
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../src/api/routers';

export default createNextApiHandler({
  router: appRouter,
  createContext: ({ req, res }) => ({
    req,
    res,
    user: null, // Set by auth middleware
  }),
});
```

### Environment-specific Config
```typescript
const isDev = process.env.NODE_ENV === 'development';

export const config = {
  batchingEnabled: !isDev,     // Disable in dev for easier debugging
  maxBatchSize: isDev ? 1 : 10,
  transformer: superjson,
};
```

## Monitoring & Analytics

### Request Logging
```typescript
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;
  
  console.log(`${type.toUpperCase()} ${path} - ${duration}ms`);
  return result;
});
```

### Error Tracking
```typescript
const errorMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // Send to error tracking service
    Sentry.captureException(error);
    throw error;
  }
});
```

This tRPC setup provides type-safe, efficient API communication with excellent developer experience and production-ready features for the Beer Olympics platform.