/**
 * Admin Router for Tournament Management and Analytics
 */
import type { Tournament } from '../../types';
export declare const adminRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    getTournamentDashboard: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
        };
        output: {
            tournament: {
                progress: number;
                _type: "tournament";
                slug: string;
                name: string;
                date: string;
                ownerId: string;
                isOpen: boolean;
                format: import("../../types").TournamentFormat;
                maxTeams: number;
                createdAt: string;
                updatedAt: string;
                parentTournamentId?: string;
                subTournamentIds?: string[];
                isMegaTournament?: boolean;
                config?: import("../../types").TournamentConfig;
                currentRound?: number;
                totalRounds?: number;
                isComplete?: boolean;
                settings?: import("../../types").TournamentSettings;
                status?: "SETUP" | "READY" | "IN_PROGRESS" | "PAUSED" | "COMPLETED";
            };
            stats: {
                totalTeams: any;
                totalMatches: any;
                completedMatches: any;
                avgMatchDuration: any;
                pendingScores: any;
                openDisputes: any;
            };
            recentActivity: any[];
            subTournamentStats: {
                id: string;
                name: string;
                format: import("../../types").TournamentFormat;
                totalMatches: any;
                completedMatches: any;
                isComplete: boolean;
            }[] | null;
        };
        meta: object;
    }>;
    updateTournamentSettings: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            tournamentId: string;
            updates: {
                name?: string | undefined;
                date?: string | undefined;
                settings?: {
                    allowTies?: boolean | undefined;
                    autoAdvance?: boolean | undefined;
                    matchDuration?: number | undefined;
                    breakBetweenMatches?: number | undefined;
                    venue?: string | undefined;
                    rules?: string[] | undefined;
                } | undefined;
                isOpen?: boolean | undefined;
            };
        };
        output: {
            ok: boolean;
        };
        meta: object;
    }>;
    getTournamentAnalytics: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
            timeframe?: "all" | "month" | "week" | "today" | undefined;
        };
        output: {
            teamPerformance: any[];
            matchTrends: any[];
            playerStats: any;
            eventPopularity: any[];
            engagement: any;
            timeframe: "all" | "month" | "week" | "today";
        };
        meta: object;
    }>;
    manageTeam: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            tournamentId: string;
            teamId: string;
            action: "remove" | "edit" | "warn";
            updates?: {
                name?: string | undefined;
                colorHex?: string | undefined;
                flagCode?: string | undefined;
            } | undefined;
            reason?: string | undefined;
        };
        output: {
            ok: boolean;
        };
        meta: object;
    }>;
    overrideMatch: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            tournamentId: string;
            matchId: string;
            score: {
                a: number;
                b: number;
            };
            winnerId: string;
            reason: string;
        };
        output: {
            ok: boolean;
        };
        meta: object;
    }>;
    getAdminLog: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
            limit?: number | undefined;
        };
        output: any[];
        meta: object;
    }>;
    exportTournamentData: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
            format?: "json" | "csv" | undefined;
            includePlayerData?: boolean | undefined;
        };
        output: {
            format: string;
            data: string;
        } | {
            format: string;
            data: {
                tournament: Tournament;
                teams: any[];
                matches: any[];
                events: any[];
                scores: any[];
                players: any[] | null;
                exportedAt: string;
                exportedBy: string;
            };
        };
        meta: object;
    }>;
    broadcastAnnouncement: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            message: string;
            tournamentId: string;
            title: string;
            priority?: "low" | "medium" | "high" | "urgent" | undefined;
            targetAudience?: "all" | "teams" | "captains" | undefined;
        };
        output: {
            announcementId: string;
            recipientCount: number;
        };
        meta: object;
    }>;
}>>;
