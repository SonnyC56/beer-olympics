type TeamStatsRow = {
    eventName: string;
    points: number;
    entries: number;
};
export declare const leaderboardRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    list: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            slug: string;
        };
        output: {
            teamId: string;
            teamName: string;
            colorHex: string;
            flagCode: string;
            totalPoints: number;
            position: number;
        }[];
        meta: object;
    }>;
    teamStats: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            teamId: string;
        };
        output: TeamStatsRow[];
        meta: object;
    }>;
    recentActivity: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
            limit?: number | undefined;
        };
        output: any[];
        meta: object;
    }>;
}>>;
export {};
