import type { Tournament, Team } from '../../types';
export declare const tournamentRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            name: string;
            date: string;
        };
        output: {
            slug: string;
        };
        meta: object;
    }>;
    getBySlug: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            slug: string;
        };
        output: Tournament;
        meta: object;
    }>;
    setOpen: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            slug: string;
            isOpen: boolean;
        };
        output: {
            ok: boolean;
        };
        meta: object;
    }>;
    listTeams: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
        };
        output: Team[];
        meta: object;
    }>;
}>>;
