import type { Match } from '../../types';
export declare const matchRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    submitScore: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            matchId: string;
            winnerTeamId: string;
            score: {
                a: number;
                b: number;
            };
        };
        output: {
            submissionId: string;
        };
        meta: object;
    }>;
    confirmScore: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            submissionId: string;
            confirm: boolean;
        };
        output: {
            ok: boolean;
        };
        meta: object;
    }>;
    getUpcomingMatches: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
        };
        output: Match[];
        meta: object;
    }>;
    createMatch: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            teamA: string;
            teamB: string;
            eventId: string;
            round: number;
            startTime?: string | undefined;
        };
        output: {
            matchId: string;
        };
        meta: object;
    }>;
}>>;
