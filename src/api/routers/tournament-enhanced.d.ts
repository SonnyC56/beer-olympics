/**
 * Enhanced Tournament Router with tournament-js integration
 */
import type { Tournament, BracketData, Standings, TournamentStats } from '../../types/tournament';
import type { Team } from '../../types';
export declare const enhancedTournamentRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    getStats: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
        };
        output: {
            totalMatches: number;
            completedMatches: number;
            activeMatches: number;
            activeTeams: any;
            uniqueGamesPlayed: any;
            avgMatchDuration: number;
            matchDurationTrend: number;
            completionPercentage: number;
        };
        meta: object;
    }>;
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            name: string;
            date: string;
            maxTeams: number;
            format?: "single_elimination" | "double_elimination" | "round_robin" | "group_stage" | "free_for_all" | "masters" | undefined;
            settings?: {
                allowTies?: boolean | undefined;
                pointsPerWin?: number | undefined;
                pointsPerTie?: number | undefined;
                pointsPerLoss?: number | undefined;
                tiebreakMethod?: "head2head" | "total" | "random" | undefined;
                autoAdvance?: boolean | undefined;
                bronzeMatch?: boolean | undefined;
                thirdPlaceMatch?: boolean | undefined;
                seedingMethod?: "random" | "manual" | "ranking" | undefined;
                maxMatchesPerRound?: number | undefined;
                matchDuration?: number | undefined;
                breakBetweenMatches?: number | undefined;
                venue?: string | undefined;
                rules?: string[] | undefined;
                megaTournamentScoring?: {
                    method: "placement" | "points" | "hybrid";
                    placementPoints?: Record<string, number> | undefined;
                    participationPoints?: number | undefined;
                    bonusPointsEnabled?: boolean | undefined;
                } | undefined;
                bonusChallenges?: {
                    type: "team" | "individual";
                    name: string;
                    points: number;
                    id: string;
                    description: string;
                    maxCompletions?: number | undefined;
                    availableIn?: string[] | undefined;
                    requirements?: string[] | undefined;
                }[] | undefined;
            } | undefined;
            isMegaTournament?: boolean | undefined;
            parentTournamentId?: string | undefined;
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
    startTournament: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            slug: string;
        };
        output: {
            success: boolean;
            matches: number;
            rounds: number;
        };
        meta: object;
    }>;
    getBracket: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            slug: string;
        };
        output: BracketData;
        meta: object;
    }>;
    getStandings: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            slug: string;
        };
        output: Standings;
        meta: object;
    }>;
    getStatsBySlug: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            slug: string;
        };
        output: TournamentStats;
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
    createMegaTournament: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            name: string;
            date: string;
            subTournaments: {
                name: string;
                format: "single_elimination" | "double_elimination" | "round_robin" | "group_stage" | "free_for_all" | "masters";
                maxTeams: number;
                pointsForPlacement?: Record<string, number> | undefined;
            }[];
            bonusChallenges?: {
                type: "team" | "individual";
                name: string;
                points: number;
                id: string;
                description: string;
                maxCompletions?: number | undefined;
                availableIn?: string[] | undefined;
                requirements?: string[] | undefined;
            }[] | undefined;
            megaScoringMethod?: "placement" | "points" | "hybrid" | undefined;
        };
        output: {
            megaTournament: Tournament;
            subTournaments: {
                slug: string;
                name: string;
                format: "single_elimination" | "double_elimination" | "round_robin" | "group_stage" | "free_for_all" | "masters";
                maxTeams: number;
            }[];
        };
        meta: object;
    }>;
    getMegaTournamentLeaderboard: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            slug: string;
        };
        output: any[];
        meta: object;
    }>;
    completeBonusChallenge: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            megaTournamentSlug: string;
            teamId: string;
            challengeId: string;
        };
        output: {
            ok: boolean;
            newTotalPoints: any;
        };
        meta: object;
    }>;
    getLeaderboard: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
        };
        output: {
            id: any;
            name: any;
            color: any;
            flagCode: any;
            rank: number;
            points: any;
            wins: any;
            losses: any;
            gamesPlayed: any;
        }[];
        meta: object;
    }>;
}>>;
