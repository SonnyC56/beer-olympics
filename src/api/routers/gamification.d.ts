export declare const gamificationRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    getPlayerAchievements: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId: string;
        };
        output: {
            achievements: never[];
            progress: never[];
            unlockedCount: number;
            totalCount: number;
        };
        meta: object;
    }>;
    getAllAchievements: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            achievements: import("../../services/achievement-engine").AchievementDefinition[];
            categories: string[];
        };
        meta: object;
    }>;
    getAchievementsByCategory: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            category: "tournament" | "milestone" | "special" | "social" | "performance" | "skill" | "fun";
        };
        output: import("../../services/achievement-engine").AchievementDefinition[];
        meta: object;
    }>;
    checkAchievements: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            userId: string;
            context: {
                tournamentId?: string | undefined;
                stats?: any;
                currentStreak?: number | undefined;
                gameType?: string | undefined;
                accuracy?: number | undefined;
                matchResult?: any;
            };
        };
        output: import("../../services/achievement-engine").UnlockedAchievement[];
        meta: object;
    }>;
    updateAchievementProgress: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            userId: string;
            updates: {
                achievementId: string;
                increment: number;
            }[];
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    getPlayerXP: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId: string;
        };
        output: import("../../services/xp-system").PlayerXP | null;
        meta: object;
    }>;
    awardXP: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            userId: string;
            reason: "game_participation" | "game_win" | "tournament_win" | "achievement_unlock" | "social_action" | "daily_bonus" | "streak_bonus" | "special_event";
            amount: number;
            context?: {
                tournamentId?: string | undefined;
                matchId?: string | undefined;
                achievementId?: string | undefined;
                winStreak?: number | undefined;
                isUnderdog?: boolean | undefined;
                isPerfectGame?: boolean | undefined;
                isComebackWin?: boolean | undefined;
            } | undefined;
        };
        output: import("../../services/xp-system").XPAwardResult;
        meta: object;
    }>;
    getXPLeaderboard: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            type?: "month" | "all_time" | "season" | undefined;
            limit?: number | undefined;
        };
        output: import("../../services/xp-system").LeaderboardEntry[];
        meta: object;
    }>;
    getXPConfig: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            GAME_PARTICIPATION: number;
            GAME_WIN: number;
            TOURNAMENT_WIN: number;
            ACHIEVEMENT_UNLOCK: {
                min: number;
                max: number;
            };
            HIGH_FIVE: number;
            UPLOAD_HIGHLIGHT: number;
            RECEIVE_SPORTSMANSHIP_VOTE: number;
            TEAM_INVITE_ACCEPTED: number;
            STREAK_MULTIPLIER: number;
            UNDERDOG_BONUS: number;
            PERFECT_GAME_BONUS: number;
            COMEBACK_BONUS: number;
            LEVELS: ({
                level: number;
                name: string;
                minXP: number;
                maxXP: number;
            } | {
                level: number;
                name: string;
                minXP: number;
                maxXP: null;
            })[];
        };
        meta: object;
    }>;
    startTournamentVoting: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            tournamentId: string;
            categories?: string[] | undefined;
        };
        output: import("../../services/voting-system").VotingSession;
        meta: object;
    }>;
    submitVote: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            tournamentId: string;
            categoryId: string;
            voterId: string;
            nomineeId: string;
            nomineeType: "team" | "player";
        };
        output: import("../../services/voting-system").VoteSubmissionResult;
        meta: object;
    }>;
    getVotingSession: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
        };
        output: import("../../services/voting-system").VotingSession | null;
        meta: object;
    }>;
    getVotingResults: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
        };
        output: import("../../services/voting-system").VotingStats;
        meta: object;
    }>;
    closeVoting: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            tournamentId: string;
        };
        output: import("../../services/voting-system").VotingStats;
        meta: object;
    }>;
    getVoteCategories: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            categories: import("../../services/voting-system").VoteCategory[];
            active: import("../../services/voting-system").VoteCategory[];
        };
        meta: object;
    }>;
    getTournamentLeaderboard: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId: string;
            type?: "points" | "achievements" | "wins" | "xp" | undefined;
        };
        output: {
            rankings: never[];
            lastUpdated: string;
        };
        meta: object;
    }>;
    getPlayerStats: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId: string;
            timeframe?: "all" | "month" | "season" | undefined;
        };
        output: {
            xp: null;
            achievements: never[];
            gameStats: {};
            socialStats: {};
            recentActivity: never[];
        };
        meta: object;
    }>;
    getGamificationSummary: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId: string;
        };
        output: {
            xp: import("../../services/xp-system").PlayerXP | null;
            achievements: never[];
            recentVotes: never[];
            nextLevelRewards: never[];
            suggestedAchievements: never[];
            socialRank: null;
        };
        meta: object;
    }>;
    getPlayerRewards: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId: string;
        };
        output: {
            badges: never[];
            titles: never[];
            themes: never[];
            avatarBorders: never[];
            emotes: never[];
            soundPacks: never[];
        };
        meta: object;
    }>;
    claimReward: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            userId: string;
            rewardId: string;
            rewardType: "title" | "badge" | "theme" | "avatar_border" | "emote" | "sound_pack";
        };
        output: {
            success: boolean;
            message: string;
        };
        meta: object;
    }>;
    getPlayerProfile: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId: string;
        };
        output: {
            basic: {};
            xp: null;
            level: number;
            achievements: never[];
            badges: never[];
            currentTitle: null;
            stats: {};
            recentActivity: never[];
        };
        meta: object;
    }>;
    shareAchievement: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            userId: string;
            achievementId: string;
            platform: "instagram" | "twitter" | "facebook" | "copy_link";
        };
        output: {
            text: string;
            url: string;
            hashtags: string[];
        };
        meta: object;
    }>;
    getGamificationInsights: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentId?: string | undefined;
            timeframe?: "all" | "month" | "week" | "season" | undefined;
        };
        output: {
            totalPlayers: number;
            averageLevel: number;
            mostPopularAchievements: never[];
            xpDistribution: {};
            engagementMetrics: {};
            votingParticipation: number;
        };
        meta: object;
    }>;
}>>;
export type GamificationRouter = typeof gamificationRouter;
