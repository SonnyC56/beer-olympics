import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../src/api/routers';
import type { Context } from '../../src/api/trpc';

export default createNextApiHandler({
  router: appRouter,
  createContext: (): Context => {
    // TODO: Extract user from JWT token in Authorization header
    return {
      user: undefined, // For now, no auth
    };
  },
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});