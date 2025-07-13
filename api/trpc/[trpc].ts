import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../src/api/routers/index';
import { createTRPCContext } from '../../src/api/trpc';

// Removed edge runtime config to support Node.js modules

export default async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ user: null }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}:`, error);
          }
        : undefined,
  });
}