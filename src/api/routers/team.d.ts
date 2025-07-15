import type { Team } from '../../types';
export declare const teamRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    joinPublic: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            slug: string;
            colorHex: string;
            userId: string;
            teamName: string;
            userName: string;
            flagCode?: string | undefined;
        };
        output: {
            teamId: string;
        };
        meta: object;
    }>;
    addMember: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            teamId: string;
            userId: string;
        };
        output: {
            ok: boolean;
        };
        meta: object;
    }>;
    getById: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            teamId: string;
        };
        output: Team;
        meta: object;
    }>;
}>>;
