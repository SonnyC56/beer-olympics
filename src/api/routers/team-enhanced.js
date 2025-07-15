/**
 * Enhanced Team Router with Player Profiles and Advanced Features
 */
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getDocument, upsertDocument, query } from '../../services/couchbase';
import { nanoid } from 'nanoid';
import { TRPCError } from '@trpc/server';
import QRCode from 'qrcode';
// Helper to generate unique invite codes
function generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
// Helper to generate QR code
async function generateQRCode(data) {
    try {
        return await QRCode.toDataURL(data, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
    }
    catch (error) {
        console.error('Failed to generate QR code:', error);
        return '';
    }
}
export const enhancedTeamRouter = router({
    // Create team with enhanced features
    create: protectedProcedure
        .input(z.object({
        tournamentSlug: z.string(),
        name: z.string().min(1).max(50),
        colorHex: z.string().regex(/^#[0-9A-F]{6}$/i),
        flagCode: z.string().optional(),
        motto: z.string().max(100).optional(),
        logoUrl: z.string().url().optional(),
        players: z.array(z.object({
            userId: z.string(),
            displayName: z.string()
        })).optional()
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            // Check if tournament exists and is open
            const tournament = await getDocument(`tournament::${input.tournamentSlug}`);
            if (!tournament) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Tournament not found',
                });
            }
            if (!tournament.isOpen) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Tournament registration is closed',
                });
            }
            // Check if team name already exists
            const existingTeams = await query(`SELECT name FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND tournamentId = $1 AND LOWER(name) = LOWER($2)`, { parameters: [input.tournamentSlug, input.name] });
            if (existingTeams.rows.length > 0) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Team name already taken in this tournament',
                });
            }
            const teamId = nanoid();
            const inviteCode = generateInviteCode();
            const joinUrl = `${process.env.APP_URL || 'http://localhost:5173'}/join/${inviteCode}`;
            const qrCodeUrl = await generateQRCode(joinUrl);
            const team = {
                _type: 'team',
                id: teamId,
                tournamentId: input.tournamentSlug,
                name: input.name,
                colorHex: input.colorHex,
                flagCode: input.flagCode || '🏁',
                memberIds: [ctx.user.id, ...(input.players?.map(p => p.userId) || [])],
                captainId: ctx.user.id,
                inviteCode,
                qrCodeUrl,
                motto: input.motto,
                logoUrl: input.logoUrl,
                stats: {
                    wins: 0,
                    losses: 0,
                    totalPoints: 0,
                    currentStreak: 0,
                    bestPlacement: 0,
                    averagePosition: 0,
                    totalGamesPlayed: 0
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await upsertDocument(`team::${teamId}`, team);
            // Create player profiles for all members
            const memberIds = [ctx.user.id, ...(input.players?.map(p => p.userId) || [])];
            for (const userId of memberIds) {
                const existingProfile = await getDocument(`player_profile::${userId}`);
                if (!existingProfile) {
                    const profile = {
                        _type: 'player_profile',
                        userId,
                        displayName: input.players?.find(p => p.userId === userId)?.displayName || ctx.user.name,
                        stats: {
                            totalGamesPlayed: 0,
                            totalWins: 0,
                            totalLosses: 0,
                            winRate: 0,
                            totalPoints: 0,
                            averagePointsPerGame: 0,
                            currentStreak: 0,
                            longestStreak: 0,
                            gameStats: {},
                            tournamentHistory: []
                        },
                        achievements: [],
                        preferences: {
                            visibility: 'public',
                            allowTeamInvites: true,
                            showStats: true,
                            emailNotifications: true,
                            pushNotifications: true
                        },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    await upsertDocument(`player_profile::${userId}`, profile);
                }
            }
            return {
                teamId,
                inviteCode,
                qrCodeUrl,
                joinUrl
            };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create team',
            });
        }
    }),
    // Join team via invite code
    joinViaInvite: protectedProcedure
        .input(z.object({
        inviteCode: z.string().length(6),
        displayName: z.string().optional()
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            // Find team by invite code
            const teamsResult = await query(`SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND inviteCode = $1`, { parameters: [input.inviteCode] });
            if (teamsResult.rows.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Invalid invite code',
                });
            }
            const team = teamsResult.rows[0];
            // Check if tournament is still open
            const tournament = await getDocument(`tournament::${team.tournamentId}`);
            if (!tournament?.isOpen) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Tournament registration is closed',
                });
            }
            // Check if user already in team
            if (team.memberIds.includes(ctx.user.id)) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'You are already a member of this team',
                });
            }
            // Check team size limit
            if (team.memberIds.length >= 10) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Team is full (max 10 members)',
                });
            }
            // Add user to team
            team.memberIds.push(ctx.user.id);
            team.updatedAt = new Date().toISOString();
            await upsertDocument(`team::${team.id}`, team);
            // Create or update player profile
            const existingProfile = await getDocument(`player_profile::${ctx.user.id}`);
            if (!existingProfile) {
                const profile = {
                    _type: 'player_profile',
                    userId: ctx.user.id,
                    displayName: input.displayName || ctx.user.name,
                    stats: {
                        totalGamesPlayed: 0,
                        totalWins: 0,
                        totalLosses: 0,
                        winRate: 0,
                        totalPoints: 0,
                        averagePointsPerGame: 0,
                        currentStreak: 0,
                        longestStreak: 0,
                        gameStats: {},
                        tournamentHistory: []
                    },
                    achievements: [],
                    preferences: {
                        visibility: 'public',
                        allowTeamInvites: true,
                        showStats: true,
                        emailNotifications: true,
                        pushNotifications: true
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                await upsertDocument(`player_profile::${ctx.user.id}`, profile);
            }
            return {
                teamId: team.id,
                teamName: team.name,
                tournamentId: team.tournamentId
            };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to join team',
            });
        }
    }),
    // Get team with full details
    getTeamDetails: publicProcedure
        .input(z.object({
        teamId: z.string()
    }))
        .query(async ({ input }) => {
        try {
            const team = await getDocument(`team::${input.teamId}`);
            if (!team) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Team not found',
                });
            }
            // Get player profiles
            const playerProfiles = await Promise.all(team.memberIds.map(async (userId) => {
                const profile = await getDocument(`player_profile::${userId}`);
                const user = await getDocument(`user::${userId}`);
                return {
                    ...profile,
                    user: {
                        id: user?.id,
                        name: user?.name,
                        email: user?.email,
                        image: user?.image
                    },
                    isCaptain: userId === team.captainId
                };
            }));
            // Get recent matches
            const matchesResult = await query(`SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'match' 
           AND (teamA = $1 OR teamB = $1)
           AND isComplete = true
           ORDER BY endTime DESC
           LIMIT 10`, { parameters: [input.teamId] });
            return {
                team,
                players: playerProfiles.filter(p => p !== null),
                recentMatches: matchesResult.rows,
                tournamentId: team.tournamentId
            };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch team details',
            });
        }
    }),
    // Update team settings
    updateTeam: protectedProcedure
        .input(z.object({
        teamId: z.string(),
        updates: z.object({
            name: z.string().min(1).max(50).optional(),
            colorHex: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
            flagCode: z.string().optional(),
            motto: z.string().max(100).optional(),
            logoUrl: z.string().url().optional(),
            preferences: z.object({
                preferredGames: z.array(z.string()).optional(),
                playerRotationStrategy: z.enum(['fixed', 'rotating', 'matchup']).optional(),
                notificationPreferences: z.array(z.object({
                    type: z.enum(['match_start', 'score_update', 'team_invite', 'tournament_update']),
                    enabled: z.boolean(),
                    method: z.enum(['email', 'push', 'sms'])
                })).optional()
            }).optional()
        })
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            const team = await getDocument(`team::${input.teamId}`);
            if (!team) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Team not found',
                });
            }
            // Only captain can update team
            if (team.captainId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Only team captain can update team settings',
                });
            }
            // Check for name conflicts if updating name
            if (input.updates.name && input.updates.name !== team.name) {
                const existingTeams = await query(`SELECT name FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'team' 
             AND tournamentId = $1 
             AND LOWER(name) = LOWER($2)
             AND id != $3`, { parameters: [team.tournamentId, input.updates.name, input.teamId] });
                if (existingTeams.rows.length > 0) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Team name already taken in this tournament',
                    });
                }
            }
            // Update team
            Object.assign(team, input.updates);
            team.updatedAt = new Date().toISOString();
            await upsertDocument(`team::${input.teamId}`, team);
            return { ok: true };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update team',
            });
        }
    }),
    // Remove player from team
    removePlayer: protectedProcedure
        .input(z.object({
        teamId: z.string(),
        playerId: z.string()
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            const team = await getDocument(`team::${input.teamId}`);
            if (!team) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Team not found',
                });
            }
            // Only captain can remove players
            if (team.captainId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Only team captain can remove players',
                });
            }
            // Can't remove captain
            if (input.playerId === team.captainId) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Cannot remove team captain',
                });
            }
            // Remove player
            team.memberIds = team.memberIds.filter(id => id !== input.playerId);
            team.updatedAt = new Date().toISOString();
            await upsertDocument(`team::${input.teamId}`, team);
            return { ok: true };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to remove player',
            });
        }
    }),
    // Transfer captain role
    transferCaptain: protectedProcedure
        .input(z.object({
        teamId: z.string(),
        newCaptainId: z.string()
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            const team = await getDocument(`team::${input.teamId}`);
            if (!team) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Team not found',
                });
            }
            // Only current captain can transfer
            if (team.captainId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Only current captain can transfer captain role',
                });
            }
            // New captain must be team member
            if (!team.memberIds.includes(input.newCaptainId)) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'New captain must be a team member',
                });
            }
            team.captainId = input.newCaptainId;
            team.updatedAt = new Date().toISOString();
            await upsertDocument(`team::${input.teamId}`, team);
            return { ok: true };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to transfer captain role',
            });
        }
    }),
    // Regenerate invite code
    regenerateInviteCode: protectedProcedure
        .input(z.object({
        teamId: z.string()
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            const team = await getDocument(`team::${input.teamId}`);
            if (!team) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Team not found',
                });
            }
            // Only captain can regenerate
            if (team.captainId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Only team captain can regenerate invite code',
                });
            }
            const newInviteCode = generateInviteCode();
            const joinUrl = `${process.env.APP_URL || 'http://localhost:5173'}/join/${newInviteCode}`;
            const qrCodeUrl = await generateQRCode(joinUrl);
            team.inviteCode = newInviteCode;
            team.qrCodeUrl = qrCodeUrl;
            team.updatedAt = new Date().toISOString();
            await upsertDocument(`team::${input.teamId}`, team);
            return {
                inviteCode: newInviteCode,
                qrCodeUrl,
                joinUrl
            };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to regenerate invite code',
            });
        }
    }),
    // Get team stats and analytics
    getTeamStats: publicProcedure
        .input(z.object({
        teamId: z.string()
    }))
        .query(async ({ input }) => {
        try {
            const team = await getDocument(`team::${input.teamId}`);
            if (!team) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Team not found',
                });
            }
            // Get all matches
            const matchesResult = await query(`SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'match' 
           AND (teamA = $1 OR teamB = $1)
           AND isComplete = true
           ORDER BY endTime DESC`, { parameters: [input.teamId] });
            // Calculate detailed stats
            const matches = matchesResult.rows;
            let wins = 0;
            let losses = 0;
            let totalPointsFor = 0;
            let totalPointsAgainst = 0;
            let currentStreak = 0;
            let longestStreak = 0;
            let tempStreak = 0;
            const gameTypeStats = {};
            const opponentStats = {};
            matches.forEach((match) => {
                const isTeamA = match.teamA === input.teamId;
                const teamScore = isTeamA ? match.finalScore?.a : match.finalScore?.b;
                const opponentScore = isTeamA ? match.finalScore?.b : match.finalScore?.a;
                const opponentId = isTeamA ? match.teamB : match.teamA;
                totalPointsFor += teamScore || 0;
                totalPointsAgainst += opponentScore || 0;
                if ((teamScore ?? 0) > (opponentScore ?? 0)) {
                    wins++;
                    tempStreak++;
                    longestStreak = Math.max(longestStreak, tempStreak);
                }
                else {
                    losses++;
                    tempStreak = 0;
                }
                // Track game type stats
                if (match.eventId) {
                    if (!gameTypeStats[match.eventId]) {
                        gameTypeStats[match.eventId] = { wins: 0, losses: 0, totalScore: 0, games: 0 };
                    }
                    gameTypeStats[match.eventId].games++;
                    gameTypeStats[match.eventId].totalScore += teamScore || 0;
                    if ((teamScore ?? 0) > (opponentScore ?? 0)) {
                        gameTypeStats[match.eventId].wins++;
                    }
                    else {
                        gameTypeStats[match.eventId].losses++;
                    }
                }
                // Track opponent stats
                if (!opponentStats[opponentId]) {
                    opponentStats[opponentId] = { wins: 0, losses: 0, totalGames: 0 };
                }
                opponentStats[opponentId].totalGames++;
                if ((teamScore ?? 0) > (opponentScore ?? 0)) {
                    opponentStats[opponentId].wins++;
                }
                else {
                    opponentStats[opponentId].losses++;
                }
            });
            currentStreak = tempStreak;
            // Find nemesis (most losses against)
            let nemesisTeam = '';
            let maxLosses = 0;
            Object.entries(opponentStats).forEach(([teamId, stats]) => {
                if (stats.losses > maxLosses) {
                    maxLosses = stats.losses;
                    nemesisTeam = teamId;
                }
            });
            // Update team stats
            const updatedStats = {
                wins,
                losses,
                totalPoints: totalPointsFor,
                currentStreak,
                bestPlacement: team.stats?.bestPlacement || 0,
                averagePosition: team.stats?.averagePosition || 0,
                totalGamesPlayed: matches.length,
                favoriteGame: Object.entries(gameTypeStats).sort((a, b) => b[1].wins - a[1].wins)[0]?.[0],
                nemesisTeam
            };
            team.stats = updatedStats;
            team.updatedAt = new Date().toISOString();
            await upsertDocument(`team::${input.teamId}`, team);
            return {
                basicStats: updatedStats,
                gameTypeStats,
                opponentStats,
                pointsDifferential: totalPointsFor - totalPointsAgainst,
                winRate: matches.length > 0 ? (wins / matches.length) * 100 : 0,
                averagePointsFor: matches.length > 0 ? totalPointsFor / matches.length : 0,
                averagePointsAgainst: matches.length > 0 ? totalPointsAgainst / matches.length : 0,
                recentForm: matches.slice(0, 5).map((m) => {
                    const isTeamA = m.teamA === input.teamId;
                    const teamScore = isTeamA ? m.finalScore?.a : m.finalScore?.b;
                    const opponentScore = isTeamA ? m.finalScore?.b : m.finalScore?.a;
                    return (teamScore ?? 0) > (opponentScore ?? 0) ? 'W' : 'L';
                })
            };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch team stats',
            });
        }
    })
});
