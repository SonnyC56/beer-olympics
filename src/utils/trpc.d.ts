import { QueryClient } from '@tanstack/react-query';
export declare const trpc: import("@trpc/react-query").CreateTRPCReactBase<import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../api/trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    tournament: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: import("../types").Tournament;
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
            output: import("../types").BracketData;
            meta: object;
        }>;
        getStandings: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                slug: string;
            };
            output: import("../types").Standings;
            meta: object;
        }>;
        getStatsBySlug: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                slug: string;
            };
            output: import("../types").TournamentStats;
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
            output: import("../types").Team[];
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
                megaTournament: import("../types").Tournament;
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
    team: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
        meta: object;
        errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
        transformer: false;
    }, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                name: string;
                tournamentSlug: string;
                colorHex: string;
                flagCode?: string | undefined;
                motto?: string | undefined;
                logoUrl?: string | undefined;
                players?: {
                    userId: string;
                    displayName: string;
                }[] | undefined;
            };
            output: {
                teamId: string;
                inviteCode: string;
                qrCodeUrl: string;
                joinUrl: string;
            };
            meta: object;
        }>;
        joinViaInvite: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                inviteCode: string;
                displayName?: string | undefined;
            };
            output: {
                teamId: string;
                teamName: string;
                tournamentId: string;
            };
            meta: object;
        }>;
        getTeamDetails: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                teamId: string;
            };
            output: {
                team: import("../types").Team;
                players: {
                    user: {
                        id: string;
                        name: string;
                        email: string;
                        image: string | undefined;
                    };
                    isCaptain: boolean;
                    _type: "player_profile";
                    userId: string;
                    displayName: string;
                    bio?: string;
                    avatarUrl?: string;
                    nationality?: string;
                    favoriteGame?: string;
                    motto?: string;
                    stats: import("../types").PlayerStats;
                    achievements: import("../types").Achievement[];
                    preferences: import("../types").PlayerPreferences;
                    socialLinks?: import("../types").SocialLinks;
                    createdAt: string;
                    updatedAt: string;
                }[];
                recentMatches: any[];
                tournamentId: string;
            };
            meta: object;
        }>;
        updateTeam: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
                updates: {
                    name?: string | undefined;
                    colorHex?: string | undefined;
                    flagCode?: string | undefined;
                    motto?: string | undefined;
                    logoUrl?: string | undefined;
                    preferences?: {
                        preferredGames?: string[] | undefined;
                        playerRotationStrategy?: "fixed" | "rotating" | "matchup" | undefined;
                        notificationPreferences?: {
                            type: "match_start" | "score_update" | "team_invite" | "tournament_update";
                            method: "push" | "email" | "sms";
                            enabled: boolean;
                        }[] | undefined;
                    } | undefined;
                };
            };
            output: {
                ok: boolean;
            };
            meta: object;
        }>;
        removePlayer: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
                playerId: string;
            };
            output: {
                ok: boolean;
            };
            meta: object;
        }>;
        transferCaptain: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
                newCaptainId: string;
            };
            output: {
                ok: boolean;
            };
            meta: object;
        }>;
        regenerateInviteCode: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
            };
            output: {
                inviteCode: string;
                qrCodeUrl: string;
                joinUrl: string;
            };
            meta: object;
        }>;
        getTeamStats: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                teamId: string;
            };
            output: {
                basicStats: import("../types").TeamStats;
                gameTypeStats: {
                    [key: string]: any;
                };
                opponentStats: {
                    [key: string]: any;
                };
                pointsDifferential: number;
                winRate: number;
                averagePointsFor: number;
                averagePointsAgainst: number;
                recentForm: ("W" | "L")[];
            };
            meta: object;
        }>;
    }>>;
    match: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                match: import("../types").Match;
                teamA: import("../types").Team | null;
                teamB: import("../types").Team | null;
                event: import("../types").Event | null;
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
    player: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
        meta: object;
        errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
        transformer: false;
    }, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
        getOrCreateProfile: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: import("../types").PlayerProfile;
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
            output: import("../types").PlayerProfile;
            meta: object;
        }>;
        getPublicProfile: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                userId: string;
            };
            output: {
                preferences: undefined;
                stats: import("../types").PlayerStats | undefined;
                _type: "player_profile";
                userId: string;
                displayName: string;
                bio?: string;
                avatarUrl?: string;
                nationality?: string;
                favoriteGame?: string;
                motto?: string;
                achievements: import("../types").Achievement[];
                socialLinks?: import("../types").SocialLinks;
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
                    [gameType: string]: import("../types").GameSpecificStats;
                };
                basicStats?: undefined;
                timeframe?: undefined;
            } | {
                basicStats: import("../types").PlayerStats;
                recentPerformance: {
                    matchId: unknown;
                    eventName: unknown;
                    date: unknown;
                    result: string;
                    score: string;
                    points: number | undefined;
                }[];
                gameBreakdown: {
                    [key: string]: import("../types").GameSpecificStats;
                };
                tournamentHistory: import("../types").TournamentHistoryEntry[];
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
                newAchievements: import("../types").Achievement[];
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
                    stats: import("../types").PlayerStats | null;
                    achievements: number;
                };
                player2: {
                    profile: {
                        displayName: string;
                        avatarUrl: string | undefined;
                        nationality: string | undefined;
                    };
                    stats: import("../types").PlayerStats | null;
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
    admin: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                    format: import("../types").TournamentFormat;
                    maxTeams: number;
                    createdAt: string;
                    updatedAt: string;
                    parentTournamentId?: string;
                    subTournamentIds?: string[];
                    isMegaTournament?: boolean;
                    config?: import("../types").TournamentConfig;
                    currentRound?: number;
                    totalRounds?: number;
                    isComplete?: boolean;
                    settings?: import("../types").TournamentSettings;
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
                    format: import("../types").TournamentFormat;
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
                    tournament: import("../types").Tournament;
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
    media: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                media: import("../types").Media;
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
    gamification: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                achievements: import("../services/achievement-engine").AchievementDefinition[];
                categories: string[];
            };
            meta: object;
        }>;
        getAchievementsByCategory: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                category: "tournament" | "milestone" | "special" | "social" | "performance" | "skill" | "fun";
            };
            output: import("../services/achievement-engine").AchievementDefinition[];
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
            output: import("../services/achievement-engine").UnlockedAchievement[];
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
            output: import("../services/xp-system").PlayerXP | null;
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
            output: import("../services/xp-system").XPAwardResult;
            meta: object;
        }>;
        getXPLeaderboard: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                type?: "month" | "all_time" | "season" | undefined;
                limit?: number | undefined;
            };
            output: import("../services/xp-system").LeaderboardEntry[];
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
            output: import("../services/voting-system").VotingSession;
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
            output: import("../services/voting-system").VoteSubmissionResult;
            meta: object;
        }>;
        getVotingSession: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentId: string;
            };
            output: import("../services/voting-system").VotingSession | null;
            meta: object;
        }>;
        getVotingResults: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentId: string;
            };
            output: import("../services/voting-system").VotingStats;
            meta: object;
        }>;
        closeVoting: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                tournamentId: string;
            };
            output: import("../services/voting-system").VotingStats;
            meta: object;
        }>;
        getVoteCategories: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                categories: import("../services/voting-system").VoteCategory[];
                active: import("../services/voting-system").VoteCategory[];
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
                xp: import("../services/xp-system").PlayerXP | null;
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
    rsvp: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
        meta: object;
        errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
        transformer: false;
    }, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                tournamentSlug: string;
                email: string;
                fullName: string;
                phone: string;
                shirtSize: "xs" | "s" | "m" | "l" | "xl" | "xxl";
                agreeToTerms: boolean;
                teamName?: string | undefined;
                favoriteGame?: string | undefined;
                participationType?: "player" | "spectator" | "designated_driver" | undefined;
                preferredPartner?: string | undefined;
                skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
                attendingGames?: string[] | undefined;
                dietaryRestrictions?: string | undefined;
                victoryDance?: string | undefined;
                specialTalent?: string | undefined;
                motivationalQuote?: string | undefined;
                needsTransportation?: boolean | undefined;
                canOfferRide?: boolean | undefined;
                isDesignatedDriver?: boolean | undefined;
                willingToVolunteer?: boolean | undefined;
                bringingGuests?: boolean | undefined;
                guestCount?: number | undefined;
                additionalRequests?: string | undefined;
                agreeToPhotos?: boolean | undefined;
                wantUpdates?: boolean | undefined;
            };
            output: {
                success: boolean;
                rsvp: {
                    id: string;
                    type: string;
                    submittedAt: string;
                    status: string;
                    docType: string;
                    createdAt: string;
                    updatedAt: string;
                    tournamentSlug: string;
                    email: string;
                    fullName: string;
                    phone: string;
                    participationType: "player" | "spectator" | "designated_driver";
                    shirtSize: "xs" | "s" | "m" | "l" | "xl" | "xxl";
                    needsTransportation: boolean;
                    canOfferRide: boolean;
                    isDesignatedDriver: boolean;
                    willingToVolunteer: boolean;
                    bringingGuests: boolean;
                    guestCount: number;
                    agreeToTerms: boolean;
                    agreeToPhotos: boolean;
                    wantUpdates: boolean;
                    teamName?: string | undefined;
                    favoriteGame?: string | undefined;
                    preferredPartner?: string | undefined;
                    skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
                    attendingGames?: string[] | undefined;
                    dietaryRestrictions?: string | undefined;
                    victoryDance?: string | undefined;
                    specialTalent?: string | undefined;
                    motivationalQuote?: string | undefined;
                    additionalRequests?: string | undefined;
                };
                message: string;
            };
            meta: object;
        }>;
        getByTournament: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                rsvps: any[];
                total: number;
            };
            meta: object;
        }>;
        getById: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                id: string;
            };
            output: {
                success: boolean;
                rsvp: any;
            };
            meta: object;
        }>;
        update: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                status?: "pending" | "confirmed" | "cancelled" | undefined;
                tournamentSlug?: string | undefined;
                email?: string | undefined;
                teamName?: string | undefined;
                favoriteGame?: string | undefined;
                fullName?: string | undefined;
                phone?: string | undefined;
                participationType?: "player" | "spectator" | "designated_driver" | undefined;
                preferredPartner?: string | undefined;
                skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
                attendingGames?: string[] | undefined;
                dietaryRestrictions?: string | undefined;
                shirtSize?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | undefined;
                victoryDance?: string | undefined;
                specialTalent?: string | undefined;
                motivationalQuote?: string | undefined;
                needsTransportation?: boolean | undefined;
                canOfferRide?: boolean | undefined;
                isDesignatedDriver?: boolean | undefined;
                willingToVolunteer?: boolean | undefined;
                bringingGuests?: boolean | undefined;
                guestCount?: number | undefined;
                additionalRequests?: string | undefined;
                agreeToTerms?: boolean | undefined;
                agreeToPhotos?: boolean | undefined;
                wantUpdates?: boolean | undefined;
            };
            output: {
                success: boolean;
                rsvp: any;
                message: string;
            };
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
            };
            output: {
                success: boolean;
                message: string;
            };
            meta: object;
        }>;
        getStats: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                stats: any;
            };
            meta: object;
        }>;
        export: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                rsvps: any[];
                headers: string[];
            };
            meta: object;
        }>;
        checkIn: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                method?: "manual" | "qr" | "self_service" | undefined;
                autoAssignTeam?: boolean | undefined;
                isLateArrival?: boolean | undefined;
            };
            output: {
                success: boolean;
                teamAssigned: boolean;
                teamName: any;
                tableNumber: any;
                message: string;
            };
            meta: object;
        }>;
        getCheckInStatus: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                attendees: {
                    id: any;
                    fullName: any;
                    email: any;
                    phone: any;
                    participationType: any;
                    teamName: any;
                    teamId: any;
                    checkedInAt: any;
                    checkInMethod: any;
                    status: any;
                    qrCode: any;
                    preferredPartner: any;
                    shirtSize: any;
                    isLateArrival: any;
                }[];
                stats: {
                    totalRSVPs: number;
                    checkedIn: number;
                    waitlist: number;
                    noShows: number;
                    capacity: number;
                    teamsFormed: number;
                    lateArrivals: number;
                };
            };
            meta: object;
        }>;
        manageWaitlist: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                tournamentSlug: string;
                action: "remove" | "add" | "promote";
                attendeeId: string;
            };
            output: {
                success: boolean;
                message: string;
            };
            meta: object;
        }>;
    }>>;
    legacyTeam: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: import("../types").Team;
            meta: object;
        }>;
    }>>;
    legacyMatch: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: import("../types").Match[];
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
    leaderboard: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: {
                eventName: string;
                points: number;
                entries: number;
            }[];
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
}>>, unknown> & import("@trpc/react-query/shared").DecorateRouterRecord<{
    ctx: import("../api/trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    tournament: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: import("../types").Tournament;
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
            output: import("../types").BracketData;
            meta: object;
        }>;
        getStandings: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                slug: string;
            };
            output: import("../types").Standings;
            meta: object;
        }>;
        getStatsBySlug: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                slug: string;
            };
            output: import("../types").TournamentStats;
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
            output: import("../types").Team[];
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
                megaTournament: import("../types").Tournament;
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
    team: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
        meta: object;
        errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
        transformer: false;
    }, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                name: string;
                tournamentSlug: string;
                colorHex: string;
                flagCode?: string | undefined;
                motto?: string | undefined;
                logoUrl?: string | undefined;
                players?: {
                    userId: string;
                    displayName: string;
                }[] | undefined;
            };
            output: {
                teamId: string;
                inviteCode: string;
                qrCodeUrl: string;
                joinUrl: string;
            };
            meta: object;
        }>;
        joinViaInvite: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                inviteCode: string;
                displayName?: string | undefined;
            };
            output: {
                teamId: string;
                teamName: string;
                tournamentId: string;
            };
            meta: object;
        }>;
        getTeamDetails: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                teamId: string;
            };
            output: {
                team: import("../types").Team;
                players: {
                    user: {
                        id: string;
                        name: string;
                        email: string;
                        image: string | undefined;
                    };
                    isCaptain: boolean;
                    _type: "player_profile";
                    userId: string;
                    displayName: string;
                    bio?: string;
                    avatarUrl?: string;
                    nationality?: string;
                    favoriteGame?: string;
                    motto?: string;
                    stats: import("../types").PlayerStats;
                    achievements: import("../types").Achievement[];
                    preferences: import("../types").PlayerPreferences;
                    socialLinks?: import("../types").SocialLinks;
                    createdAt: string;
                    updatedAt: string;
                }[];
                recentMatches: any[];
                tournamentId: string;
            };
            meta: object;
        }>;
        updateTeam: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
                updates: {
                    name?: string | undefined;
                    colorHex?: string | undefined;
                    flagCode?: string | undefined;
                    motto?: string | undefined;
                    logoUrl?: string | undefined;
                    preferences?: {
                        preferredGames?: string[] | undefined;
                        playerRotationStrategy?: "fixed" | "rotating" | "matchup" | undefined;
                        notificationPreferences?: {
                            type: "match_start" | "score_update" | "team_invite" | "tournament_update";
                            method: "push" | "email" | "sms";
                            enabled: boolean;
                        }[] | undefined;
                    } | undefined;
                };
            };
            output: {
                ok: boolean;
            };
            meta: object;
        }>;
        removePlayer: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
                playerId: string;
            };
            output: {
                ok: boolean;
            };
            meta: object;
        }>;
        transferCaptain: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
                newCaptainId: string;
            };
            output: {
                ok: boolean;
            };
            meta: object;
        }>;
        regenerateInviteCode: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
            };
            output: {
                inviteCode: string;
                qrCodeUrl: string;
                joinUrl: string;
            };
            meta: object;
        }>;
        getTeamStats: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                teamId: string;
            };
            output: {
                basicStats: import("../types").TeamStats;
                gameTypeStats: {
                    [key: string]: any;
                };
                opponentStats: {
                    [key: string]: any;
                };
                pointsDifferential: number;
                winRate: number;
                averagePointsFor: number;
                averagePointsAgainst: number;
                recentForm: ("W" | "L")[];
            };
            meta: object;
        }>;
    }>>;
    match: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                match: import("../types").Match;
                teamA: import("../types").Team | null;
                teamB: import("../types").Team | null;
                event: import("../types").Event | null;
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
    player: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
        meta: object;
        errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
        transformer: false;
    }, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
        getOrCreateProfile: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: import("../types").PlayerProfile;
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
            output: import("../types").PlayerProfile;
            meta: object;
        }>;
        getPublicProfile: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                userId: string;
            };
            output: {
                preferences: undefined;
                stats: import("../types").PlayerStats | undefined;
                _type: "player_profile";
                userId: string;
                displayName: string;
                bio?: string;
                avatarUrl?: string;
                nationality?: string;
                favoriteGame?: string;
                motto?: string;
                achievements: import("../types").Achievement[];
                socialLinks?: import("../types").SocialLinks;
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
                    [gameType: string]: import("../types").GameSpecificStats;
                };
                basicStats?: undefined;
                timeframe?: undefined;
            } | {
                basicStats: import("../types").PlayerStats;
                recentPerformance: {
                    matchId: unknown;
                    eventName: unknown;
                    date: unknown;
                    result: string;
                    score: string;
                    points: number | undefined;
                }[];
                gameBreakdown: {
                    [key: string]: import("../types").GameSpecificStats;
                };
                tournamentHistory: import("../types").TournamentHistoryEntry[];
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
                newAchievements: import("../types").Achievement[];
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
                    stats: import("../types").PlayerStats | null;
                    achievements: number;
                };
                player2: {
                    profile: {
                        displayName: string;
                        avatarUrl: string | undefined;
                        nationality: string | undefined;
                    };
                    stats: import("../types").PlayerStats | null;
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
    admin: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                    format: import("../types").TournamentFormat;
                    maxTeams: number;
                    createdAt: string;
                    updatedAt: string;
                    parentTournamentId?: string;
                    subTournamentIds?: string[];
                    isMegaTournament?: boolean;
                    config?: import("../types").TournamentConfig;
                    currentRound?: number;
                    totalRounds?: number;
                    isComplete?: boolean;
                    settings?: import("../types").TournamentSettings;
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
                    format: import("../types").TournamentFormat;
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
                    tournament: import("../types").Tournament;
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
    media: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                media: import("../types").Media;
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
    gamification: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                achievements: import("../services/achievement-engine").AchievementDefinition[];
                categories: string[];
            };
            meta: object;
        }>;
        getAchievementsByCategory: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                category: "tournament" | "milestone" | "special" | "social" | "performance" | "skill" | "fun";
            };
            output: import("../services/achievement-engine").AchievementDefinition[];
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
            output: import("../services/achievement-engine").UnlockedAchievement[];
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
            output: import("../services/xp-system").PlayerXP | null;
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
            output: import("../services/xp-system").XPAwardResult;
            meta: object;
        }>;
        getXPLeaderboard: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                type?: "month" | "all_time" | "season" | undefined;
                limit?: number | undefined;
            };
            output: import("../services/xp-system").LeaderboardEntry[];
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
            output: import("../services/voting-system").VotingSession;
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
            output: import("../services/voting-system").VoteSubmissionResult;
            meta: object;
        }>;
        getVotingSession: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentId: string;
            };
            output: import("../services/voting-system").VotingSession | null;
            meta: object;
        }>;
        getVotingResults: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentId: string;
            };
            output: import("../services/voting-system").VotingStats;
            meta: object;
        }>;
        closeVoting: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                tournamentId: string;
            };
            output: import("../services/voting-system").VotingStats;
            meta: object;
        }>;
        getVoteCategories: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                categories: import("../services/voting-system").VoteCategory[];
                active: import("../services/voting-system").VoteCategory[];
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
                xp: import("../services/xp-system").PlayerXP | null;
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
    rsvp: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
        meta: object;
        errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
        transformer: false;
    }, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                tournamentSlug: string;
                email: string;
                fullName: string;
                phone: string;
                shirtSize: "xs" | "s" | "m" | "l" | "xl" | "xxl";
                agreeToTerms: boolean;
                teamName?: string | undefined;
                favoriteGame?: string | undefined;
                participationType?: "player" | "spectator" | "designated_driver" | undefined;
                preferredPartner?: string | undefined;
                skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
                attendingGames?: string[] | undefined;
                dietaryRestrictions?: string | undefined;
                victoryDance?: string | undefined;
                specialTalent?: string | undefined;
                motivationalQuote?: string | undefined;
                needsTransportation?: boolean | undefined;
                canOfferRide?: boolean | undefined;
                isDesignatedDriver?: boolean | undefined;
                willingToVolunteer?: boolean | undefined;
                bringingGuests?: boolean | undefined;
                guestCount?: number | undefined;
                additionalRequests?: string | undefined;
                agreeToPhotos?: boolean | undefined;
                wantUpdates?: boolean | undefined;
            };
            output: {
                success: boolean;
                rsvp: {
                    id: string;
                    type: string;
                    submittedAt: string;
                    status: string;
                    docType: string;
                    createdAt: string;
                    updatedAt: string;
                    tournamentSlug: string;
                    email: string;
                    fullName: string;
                    phone: string;
                    participationType: "player" | "spectator" | "designated_driver";
                    shirtSize: "xs" | "s" | "m" | "l" | "xl" | "xxl";
                    needsTransportation: boolean;
                    canOfferRide: boolean;
                    isDesignatedDriver: boolean;
                    willingToVolunteer: boolean;
                    bringingGuests: boolean;
                    guestCount: number;
                    agreeToTerms: boolean;
                    agreeToPhotos: boolean;
                    wantUpdates: boolean;
                    teamName?: string | undefined;
                    favoriteGame?: string | undefined;
                    preferredPartner?: string | undefined;
                    skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
                    attendingGames?: string[] | undefined;
                    dietaryRestrictions?: string | undefined;
                    victoryDance?: string | undefined;
                    specialTalent?: string | undefined;
                    motivationalQuote?: string | undefined;
                    additionalRequests?: string | undefined;
                };
                message: string;
            };
            meta: object;
        }>;
        getByTournament: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                rsvps: any[];
                total: number;
            };
            meta: object;
        }>;
        getById: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                id: string;
            };
            output: {
                success: boolean;
                rsvp: any;
            };
            meta: object;
        }>;
        update: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                status?: "pending" | "confirmed" | "cancelled" | undefined;
                tournamentSlug?: string | undefined;
                email?: string | undefined;
                teamName?: string | undefined;
                favoriteGame?: string | undefined;
                fullName?: string | undefined;
                phone?: string | undefined;
                participationType?: "player" | "spectator" | "designated_driver" | undefined;
                preferredPartner?: string | undefined;
                skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
                attendingGames?: string[] | undefined;
                dietaryRestrictions?: string | undefined;
                shirtSize?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | undefined;
                victoryDance?: string | undefined;
                specialTalent?: string | undefined;
                motivationalQuote?: string | undefined;
                needsTransportation?: boolean | undefined;
                canOfferRide?: boolean | undefined;
                isDesignatedDriver?: boolean | undefined;
                willingToVolunteer?: boolean | undefined;
                bringingGuests?: boolean | undefined;
                guestCount?: number | undefined;
                additionalRequests?: string | undefined;
                agreeToTerms?: boolean | undefined;
                agreeToPhotos?: boolean | undefined;
                wantUpdates?: boolean | undefined;
            };
            output: {
                success: boolean;
                rsvp: any;
                message: string;
            };
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
            };
            output: {
                success: boolean;
                message: string;
            };
            meta: object;
        }>;
        getStats: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                stats: any;
            };
            meta: object;
        }>;
        export: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                rsvps: any[];
                headers: string[];
            };
            meta: object;
        }>;
        checkIn: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                method?: "manual" | "qr" | "self_service" | undefined;
                autoAssignTeam?: boolean | undefined;
                isLateArrival?: boolean | undefined;
            };
            output: {
                success: boolean;
                teamAssigned: boolean;
                teamName: any;
                tableNumber: any;
                message: string;
            };
            meta: object;
        }>;
        getCheckInStatus: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                attendees: {
                    id: any;
                    fullName: any;
                    email: any;
                    phone: any;
                    participationType: any;
                    teamName: any;
                    teamId: any;
                    checkedInAt: any;
                    checkInMethod: any;
                    status: any;
                    qrCode: any;
                    preferredPartner: any;
                    shirtSize: any;
                    isLateArrival: any;
                }[];
                stats: {
                    totalRSVPs: number;
                    checkedIn: number;
                    waitlist: number;
                    noShows: number;
                    capacity: number;
                    teamsFormed: number;
                    lateArrivals: number;
                };
            };
            meta: object;
        }>;
        manageWaitlist: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                tournamentSlug: string;
                action: "remove" | "add" | "promote";
                attendeeId: string;
            };
            output: {
                success: boolean;
                message: string;
            };
            meta: object;
        }>;
    }>>;
    legacyTeam: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: import("../types").Team;
            meta: object;
        }>;
    }>>;
    legacyMatch: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: import("../types").Match[];
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
    leaderboard: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: {
                eventName: string;
                points: number;
                entries: number;
            }[];
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
}>>;
export declare const queryClient: QueryClient;
export declare const trpcClient: import("@trpc/client").TRPCClient<import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../api/trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    tournament: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: import("../types").Tournament;
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
            output: import("../types").BracketData;
            meta: object;
        }>;
        getStandings: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                slug: string;
            };
            output: import("../types").Standings;
            meta: object;
        }>;
        getStatsBySlug: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                slug: string;
            };
            output: import("../types").TournamentStats;
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
            output: import("../types").Team[];
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
                megaTournament: import("../types").Tournament;
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
    team: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
        meta: object;
        errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
        transformer: false;
    }, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                name: string;
                tournamentSlug: string;
                colorHex: string;
                flagCode?: string | undefined;
                motto?: string | undefined;
                logoUrl?: string | undefined;
                players?: {
                    userId: string;
                    displayName: string;
                }[] | undefined;
            };
            output: {
                teamId: string;
                inviteCode: string;
                qrCodeUrl: string;
                joinUrl: string;
            };
            meta: object;
        }>;
        joinViaInvite: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                inviteCode: string;
                displayName?: string | undefined;
            };
            output: {
                teamId: string;
                teamName: string;
                tournamentId: string;
            };
            meta: object;
        }>;
        getTeamDetails: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                teamId: string;
            };
            output: {
                team: import("../types").Team;
                players: {
                    user: {
                        id: string;
                        name: string;
                        email: string;
                        image: string | undefined;
                    };
                    isCaptain: boolean;
                    _type: "player_profile";
                    userId: string;
                    displayName: string;
                    bio?: string;
                    avatarUrl?: string;
                    nationality?: string;
                    favoriteGame?: string;
                    motto?: string;
                    stats: import("../types").PlayerStats;
                    achievements: import("../types").Achievement[];
                    preferences: import("../types").PlayerPreferences;
                    socialLinks?: import("../types").SocialLinks;
                    createdAt: string;
                    updatedAt: string;
                }[];
                recentMatches: any[];
                tournamentId: string;
            };
            meta: object;
        }>;
        updateTeam: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
                updates: {
                    name?: string | undefined;
                    colorHex?: string | undefined;
                    flagCode?: string | undefined;
                    motto?: string | undefined;
                    logoUrl?: string | undefined;
                    preferences?: {
                        preferredGames?: string[] | undefined;
                        playerRotationStrategy?: "fixed" | "rotating" | "matchup" | undefined;
                        notificationPreferences?: {
                            type: "match_start" | "score_update" | "team_invite" | "tournament_update";
                            method: "push" | "email" | "sms";
                            enabled: boolean;
                        }[] | undefined;
                    } | undefined;
                };
            };
            output: {
                ok: boolean;
            };
            meta: object;
        }>;
        removePlayer: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
                playerId: string;
            };
            output: {
                ok: boolean;
            };
            meta: object;
        }>;
        transferCaptain: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
                newCaptainId: string;
            };
            output: {
                ok: boolean;
            };
            meta: object;
        }>;
        regenerateInviteCode: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                teamId: string;
            };
            output: {
                inviteCode: string;
                qrCodeUrl: string;
                joinUrl: string;
            };
            meta: object;
        }>;
        getTeamStats: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                teamId: string;
            };
            output: {
                basicStats: import("../types").TeamStats;
                gameTypeStats: {
                    [key: string]: any;
                };
                opponentStats: {
                    [key: string]: any;
                };
                pointsDifferential: number;
                winRate: number;
                averagePointsFor: number;
                averagePointsAgainst: number;
                recentForm: ("W" | "L")[];
            };
            meta: object;
        }>;
    }>>;
    match: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                match: import("../types").Match;
                teamA: import("../types").Team | null;
                teamB: import("../types").Team | null;
                event: import("../types").Event | null;
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
    player: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
        meta: object;
        errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
        transformer: false;
    }, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
        getOrCreateProfile: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: import("../types").PlayerProfile;
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
            output: import("../types").PlayerProfile;
            meta: object;
        }>;
        getPublicProfile: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                userId: string;
            };
            output: {
                preferences: undefined;
                stats: import("../types").PlayerStats | undefined;
                _type: "player_profile";
                userId: string;
                displayName: string;
                bio?: string;
                avatarUrl?: string;
                nationality?: string;
                favoriteGame?: string;
                motto?: string;
                achievements: import("../types").Achievement[];
                socialLinks?: import("../types").SocialLinks;
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
                    [gameType: string]: import("../types").GameSpecificStats;
                };
                basicStats?: undefined;
                timeframe?: undefined;
            } | {
                basicStats: import("../types").PlayerStats;
                recentPerformance: {
                    matchId: unknown;
                    eventName: unknown;
                    date: unknown;
                    result: string;
                    score: string;
                    points: number | undefined;
                }[];
                gameBreakdown: {
                    [key: string]: import("../types").GameSpecificStats;
                };
                tournamentHistory: import("../types").TournamentHistoryEntry[];
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
                newAchievements: import("../types").Achievement[];
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
                    stats: import("../types").PlayerStats | null;
                    achievements: number;
                };
                player2: {
                    profile: {
                        displayName: string;
                        avatarUrl: string | undefined;
                        nationality: string | undefined;
                    };
                    stats: import("../types").PlayerStats | null;
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
    admin: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                    format: import("../types").TournamentFormat;
                    maxTeams: number;
                    createdAt: string;
                    updatedAt: string;
                    parentTournamentId?: string;
                    subTournamentIds?: string[];
                    isMegaTournament?: boolean;
                    config?: import("../types").TournamentConfig;
                    currentRound?: number;
                    totalRounds?: number;
                    isComplete?: boolean;
                    settings?: import("../types").TournamentSettings;
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
                    format: import("../types").TournamentFormat;
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
                    tournament: import("../types").Tournament;
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
    media: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                media: import("../types").Media;
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
    gamification: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
                achievements: import("../services/achievement-engine").AchievementDefinition[];
                categories: string[];
            };
            meta: object;
        }>;
        getAchievementsByCategory: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                category: "tournament" | "milestone" | "special" | "social" | "performance" | "skill" | "fun";
            };
            output: import("../services/achievement-engine").AchievementDefinition[];
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
            output: import("../services/achievement-engine").UnlockedAchievement[];
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
            output: import("../services/xp-system").PlayerXP | null;
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
            output: import("../services/xp-system").XPAwardResult;
            meta: object;
        }>;
        getXPLeaderboard: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                type?: "month" | "all_time" | "season" | undefined;
                limit?: number | undefined;
            };
            output: import("../services/xp-system").LeaderboardEntry[];
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
            output: import("../services/voting-system").VotingSession;
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
            output: import("../services/voting-system").VoteSubmissionResult;
            meta: object;
        }>;
        getVotingSession: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentId: string;
            };
            output: import("../services/voting-system").VotingSession | null;
            meta: object;
        }>;
        getVotingResults: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentId: string;
            };
            output: import("../services/voting-system").VotingStats;
            meta: object;
        }>;
        closeVoting: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                tournamentId: string;
            };
            output: import("../services/voting-system").VotingStats;
            meta: object;
        }>;
        getVoteCategories: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                categories: import("../services/voting-system").VoteCategory[];
                active: import("../services/voting-system").VoteCategory[];
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
                xp: import("../services/xp-system").PlayerXP | null;
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
    rsvp: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
        meta: object;
        errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
        transformer: false;
    }, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                tournamentSlug: string;
                email: string;
                fullName: string;
                phone: string;
                shirtSize: "xs" | "s" | "m" | "l" | "xl" | "xxl";
                agreeToTerms: boolean;
                teamName?: string | undefined;
                favoriteGame?: string | undefined;
                participationType?: "player" | "spectator" | "designated_driver" | undefined;
                preferredPartner?: string | undefined;
                skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
                attendingGames?: string[] | undefined;
                dietaryRestrictions?: string | undefined;
                victoryDance?: string | undefined;
                specialTalent?: string | undefined;
                motivationalQuote?: string | undefined;
                needsTransportation?: boolean | undefined;
                canOfferRide?: boolean | undefined;
                isDesignatedDriver?: boolean | undefined;
                willingToVolunteer?: boolean | undefined;
                bringingGuests?: boolean | undefined;
                guestCount?: number | undefined;
                additionalRequests?: string | undefined;
                agreeToPhotos?: boolean | undefined;
                wantUpdates?: boolean | undefined;
            };
            output: {
                success: boolean;
                rsvp: {
                    id: string;
                    type: string;
                    submittedAt: string;
                    status: string;
                    docType: string;
                    createdAt: string;
                    updatedAt: string;
                    tournamentSlug: string;
                    email: string;
                    fullName: string;
                    phone: string;
                    participationType: "player" | "spectator" | "designated_driver";
                    shirtSize: "xs" | "s" | "m" | "l" | "xl" | "xxl";
                    needsTransportation: boolean;
                    canOfferRide: boolean;
                    isDesignatedDriver: boolean;
                    willingToVolunteer: boolean;
                    bringingGuests: boolean;
                    guestCount: number;
                    agreeToTerms: boolean;
                    agreeToPhotos: boolean;
                    wantUpdates: boolean;
                    teamName?: string | undefined;
                    favoriteGame?: string | undefined;
                    preferredPartner?: string | undefined;
                    skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
                    attendingGames?: string[] | undefined;
                    dietaryRestrictions?: string | undefined;
                    victoryDance?: string | undefined;
                    specialTalent?: string | undefined;
                    motivationalQuote?: string | undefined;
                    additionalRequests?: string | undefined;
                };
                message: string;
            };
            meta: object;
        }>;
        getByTournament: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                rsvps: any[];
                total: number;
            };
            meta: object;
        }>;
        getById: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                id: string;
            };
            output: {
                success: boolean;
                rsvp: any;
            };
            meta: object;
        }>;
        update: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                status?: "pending" | "confirmed" | "cancelled" | undefined;
                tournamentSlug?: string | undefined;
                email?: string | undefined;
                teamName?: string | undefined;
                favoriteGame?: string | undefined;
                fullName?: string | undefined;
                phone?: string | undefined;
                participationType?: "player" | "spectator" | "designated_driver" | undefined;
                preferredPartner?: string | undefined;
                skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
                attendingGames?: string[] | undefined;
                dietaryRestrictions?: string | undefined;
                shirtSize?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | undefined;
                victoryDance?: string | undefined;
                specialTalent?: string | undefined;
                motivationalQuote?: string | undefined;
                needsTransportation?: boolean | undefined;
                canOfferRide?: boolean | undefined;
                isDesignatedDriver?: boolean | undefined;
                willingToVolunteer?: boolean | undefined;
                bringingGuests?: boolean | undefined;
                guestCount?: number | undefined;
                additionalRequests?: string | undefined;
                agreeToTerms?: boolean | undefined;
                agreeToPhotos?: boolean | undefined;
                wantUpdates?: boolean | undefined;
            };
            output: {
                success: boolean;
                rsvp: any;
                message: string;
            };
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
            };
            output: {
                success: boolean;
                message: string;
            };
            meta: object;
        }>;
        getStats: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                stats: any;
            };
            meta: object;
        }>;
        export: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                rsvps: any[];
                headers: string[];
            };
            meta: object;
        }>;
        checkIn: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                method?: "manual" | "qr" | "self_service" | undefined;
                autoAssignTeam?: boolean | undefined;
                isLateArrival?: boolean | undefined;
            };
            output: {
                success: boolean;
                teamAssigned: boolean;
                teamName: any;
                tableNumber: any;
                message: string;
            };
            meta: object;
        }>;
        getCheckInStatus: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                tournamentSlug: string;
            };
            output: {
                success: boolean;
                attendees: {
                    id: any;
                    fullName: any;
                    email: any;
                    phone: any;
                    participationType: any;
                    teamName: any;
                    teamId: any;
                    checkedInAt: any;
                    checkInMethod: any;
                    status: any;
                    qrCode: any;
                    preferredPartner: any;
                    shirtSize: any;
                    isLateArrival: any;
                }[];
                stats: {
                    totalRSVPs: number;
                    checkedIn: number;
                    waitlist: number;
                    noShows: number;
                    capacity: number;
                    teamsFormed: number;
                    lateArrivals: number;
                };
            };
            meta: object;
        }>;
        manageWaitlist: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                tournamentSlug: string;
                action: "remove" | "add" | "promote";
                attendeeId: string;
            };
            output: {
                success: boolean;
                message: string;
            };
            meta: object;
        }>;
    }>>;
    legacyTeam: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: import("../types").Team;
            meta: object;
        }>;
    }>>;
    legacyMatch: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: import("../types").Match[];
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
    leaderboard: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
        ctx: import("../api/trpc").Context;
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
            output: {
                eventName: string;
                points: number;
                entries: number;
            }[];
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
}>>>;
