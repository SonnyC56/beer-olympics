/**
 * Player Profile Router
 * Manages individual player profiles, stats, and achievements
 */
import type { PlayerProfile, GameSpecificStats, Achievement } from '../../types';
export declare const playerRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    getOrCreateProfile: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: PlayerProfile;
        meta: object;
    }>;
    updateProfile: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            motto?: string | undefined;
            displayName?: string | undefined;
            preferences?: {
                visibility?: "team" | "public" | "private" | undefined;
                allowTeamInvites?: boolean | undefined;
                showStats?: boolean | undefined;
                emailNotifications?: boolean | undefined;
                pushNotifications?: boolean | undefined;
            } | undefined;
            bio?: string | undefined;
            avatarUrl?: string | undefined;
            nationality?: string | undefined;
            favoriteGame?: string | undefined;
            socialLinks?: {
                instagram?: string | undefined;
                twitter?: string | undefined;
                tiktok?: string | undefined;
                youtube?: string | undefined;
            } | undefined;
        };
        output: PlayerProfile;
        meta: object;
    }>;
    getPublicProfile: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId: string;
        };
        output: {
            preferences: undefined;
            stats: import("../../types").PlayerStats | undefined;
            _type: "player_profile";
            userId: string;
            displayName: string;
            bio?: string;
            avatarUrl?: string;
            nationality?: string;
            favoriteGame?: string;
            motto?: string;
            achievements: Achievement[];
            socialLinks?: import("../../types").SocialLinks;
            createdAt: string;
            updatedAt: string;
        };
        meta: object;
    }>;
    getDetailedStats: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId: string;
            timeframe?: "all" | "month" | "week" | undefined;
        };
        output: {
            recentPerformance: never[];
            gameBreakdown: never[];
            tournamentHistory: never[];
            totalGamesPlayed: number;
            totalWins: number;
            totalLosses: number;
            winRate: number;
            totalPoints: number;
            averagePointsPerGame: number;
            currentStreak: number;
            longestStreak: number;
            gameStats: {
                [gameType: string]: GameSpecificStats;
            };
            basicStats?: undefined;
            timeframe?: undefined;
        } | {
            basicStats: import("../../types").PlayerStats;
            recentPerformance: {
                matchId: unknown;
                eventName: unknown;
                date: unknown;
                result: string;
                score: string;
                points: number | undefined;
            }[];
            gameBreakdown: {
                [key: string]: GameSpecificStats;
            };
            tournamentHistory: import("../../types").TournamentHistoryEntry[];
            timeframe: "all" | "month" | "week";
        };
        meta: object;
    }>;
    searchPlayers: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            query: string;
            limit?: number | undefined;
        };
        output: {
            userId: string;
            displayName: string;
            avatarUrl: string | undefined;
            nationality: string | undefined;
            totalWins: number | undefined;
            winRate: number | undefined;
        }[];
        meta: object;
    }>;
    getAchievements: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId: string;
        };
        output: {
            achievements: ({
                unlocked: boolean;
                unlockedAt: string | undefined;
                id: string;
                type: "milestone";
                name: string;
                description: string;
                rarity: "common";
            } | {
                unlocked: boolean;
                unlockedAt: string | undefined;
                id: string;
                type: "milestone";
                name: string;
                description: string;
                rarity: "rare";
            } | {
                unlocked: boolean;
                unlockedAt: string | undefined;
                id: string;
                type: "milestone";
                name: string;
                description: string;
                rarity: "epic";
            } | {
                unlocked: boolean;
                unlockedAt: string | undefined;
                id: string;
                type: "milestone";
                name: string;
                description: string;
                rarity: "legendary";
            } | {
                unlocked: boolean;
                unlockedAt: string | undefined;
                id: string;
                type: "tournament";
                name: string;
                description: string;
                rarity: "epic";
            } | {
                unlocked: boolean;
                unlockedAt: string | undefined;
                id: string;
                type: "tournament";
                name: string;
                description: string;
                rarity: "rare";
            } | {
                unlocked: boolean;
                unlockedAt: string | undefined;
                id: string;
                type: "special";
                name: string;
                description: string;
                rarity: "rare";
            } | {
                unlocked: boolean;
                unlockedAt: string | undefined;
                id: string;
                type: "special";
                name: string;
                description: string;
                rarity: "epic";
            } | {
                unlocked: boolean;
                unlockedAt: string | undefined;
                id: string;
                type: "social";
                name: string;
                description: string;
                rarity: "common";
            } | {
                unlocked: boolean;
                unlockedAt: string | undefined;
                id: string;
                type: "social";
                name: string;
                description: string;
                rarity: "rare";
            })[];
            totalUnlocked: number;
            totalPossible: number;
            completionPercentage: number;
        };
        meta: object;
    }>;
    checkAchievements: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            userId: string;
        };
        output: {
            newAchievements: Achievement[];
            totalAchievements: number;
        };
        meta: object;
    }>;
    compareProfiles: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId1: string;
            userId2: string;
        };
        output: {
            player1: {
                profile: {
                    displayName: string;
                    avatarUrl: string | undefined;
                    nationality: string | undefined;
                };
                stats: import("../../types").PlayerStats | null;
                achievements: number;
            };
            player2: {
                profile: {
                    displayName: string;
                    avatarUrl: string | undefined;
                    nationality: string | undefined;
                };
                stats: import("../../types").PlayerStats | null;
                achievements: number;
            };
            headToHead: {
                totalMatches: number;
                player1Wins: number;
                player2Wins: number;
                recentMatches: any[];
            };
        };
        meta: object;
    }>;
}>>;
