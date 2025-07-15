import type { Media } from '../../types';
export declare const mediaRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    upload: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            type: "photo" | "video";
            tournamentId: string;
            matchId: string;
            fileData: string;
            testimonial?: string | undefined;
            tags?: string[] | undefined;
        };
        output: {
            success: boolean;
            media: Media;
        };
        meta: object;
    }>;
    getMatchMedia: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            matchId: string;
        };
        output: any[];
        meta: object;
    }>;
    getTournamentMedia: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
            limit?: number | undefined;
            offset?: number | undefined;
        };
        output: {
            media: any[];
            total: any;
        };
        meta: object;
    }>;
    delete: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            mediaId: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    getHighlights: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
        };
        output: {
            fastestChug: any[];
            biggestUpset: any[];
            funnyMoments: any[];
        };
        meta: object;
    }>;
    generateHighlightReel: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            tournamentId: string;
            videoIds: string[];
        };
        output: {
            success: boolean;
            reelUrl: string;
        };
        meta: object;
    }>;
    subscribeToMatch: import("@trpc/server").TRPCSubscriptionProcedure<{
        input: {
            matchId: string;
        };
        output: AsyncIterable<never, void, any>;
        meta: object;
    }>;
}>>;
