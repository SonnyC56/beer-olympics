import { initTRPC } from '@trpc/server';
import type { User } from '../types';

export interface Context {
  user?: User;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new Error('Not authenticated');
  }
  return opts.next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});