/**
 * Enhanced Team Router with Player Profiles and Advanced Features
 */
import type { Team, TeamStats } from '../../types';
export declare const enhancedTeamRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../trpc").Context;
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
            team: Team;
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
                stats: import("../../types").PlayerStats;
                achievements: import("../../types").Achievement[];
                preferences: import("../../types").PlayerPreferences;
                socialLinks?: import("../../types").SocialLinks;
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
            basicStats: TeamStats;
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
