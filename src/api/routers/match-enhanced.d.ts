/**
 * Enhanced Match Router with Advanced Scoring and Real-time Updates
 */
import type { Match, Event, Team } from '../../types';
export declare const enhancedMatchRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
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
            mediaUrls?: string[] | undefined;
            notes?: string | undefined;
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
            disputeReason?: string | undefined;
        };
        output: {
            ok: boolean;
        };
        meta: object;
    }>;
    getMatchDetails: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            matchId: string;
        };
        output: {
            match: Match;
            teamA: Team | null;
            teamB: Team | null;
            event: Event | null;
            pendingSubmission: any;
            media: any[];
            headToHeadHistory: any[];
            canSubmitScore: boolean;
        };
        meta: object;
    }>;
    getUpcomingMatches: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
            teamId?: string | undefined;
            limit?: number | undefined;
        };
        output: any[];
        meta: object;
    }>;
    resolveDispute: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            disputeId: string;
            resolution: "accept_original" | "override_score" | "rematch";
            overrideScore?: {
                a: number;
                b: number;
                winnerId: string;
            } | undefined;
        };
        output: {
            ok: boolean;
        };
        meta: object;
    }>;
    getMatchTimeline: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            matchId: string;
        };
        output: {
            type: string;
            timestamp: string;
            description: string;
        }[];
        meta: object;
    }>;
    getActiveMatches: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
        };
        output: {
            id: any;
            status: "in_progress";
            startedAt: any;
            station: {
                id: any;
                name: any;
                location: any;
            };
            game: {
                id: any;
                name: any;
                icon: any;
                rules: any;
            };
            teams: ({
                id: any;
                name: any;
                color: any;
                avatar: any;
            } | null)[];
            scores: ({
                teamId: any;
                score: any;
                position: number;
            } | null)[];
            highlights: never[];
        }[];
        meta: object;
    }>;
}>>;
