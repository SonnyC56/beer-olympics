import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../src/api/routers/index';
import { createTRPCContext } from '../../src/api/trpc';

export const config = {
  runtime: 'edge',
};

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