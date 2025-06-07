import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../src/api/routers';
import type { Context } from '../../src/api/trpc';

export default async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (): Context => {
      // TODO: Extract user from JWT token in Authorization header
      return {
        user: undefined, // For now, no auth
      };
    },
  });
}

export const config = {
  runtime: 'nodejs18.x',
};