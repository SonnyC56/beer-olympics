import { initTRPC, TRPCError } from '@trpc/server';
export function createTRPCContext(opts) {
    return {
        user: opts.user,
    };
}
const t = initTRPC.context().create();
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
