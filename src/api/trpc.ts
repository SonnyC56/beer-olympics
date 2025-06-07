import { initTRPC, TRPCError } from '@trpc/server';
import type { User } from '../types';

export interface Context {
  user?: User | null;
}

export function createTRPCContext(opts: { user?: User | null }): Context {
  return {
    user: opts.user,
  };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }
  return opts.next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});