import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getDocument, upsertDocument, query } from '../../services/couchbase';
import { nanoid } from 'nanoid';
import { TRPCError } from '@trpc/server';
import { pusherServer, safeBroadcast } from '../services/pusher-server';
export const teamRouter = router({
    joinPublic: publicProcedure
        .input(z.object({
        slug: z.string(),
        teamName: z.string().min(1).max(50),
        colorHex: z.string().regex(/^#[0-9A-F]{6}$/i),
        flagCode: z.string().optional(),
        userId: z.string(),
        userName: z.string(),
    }))
        .mutation(async ({ input }) => {
        try {
            // Check if tournament exists and is open
            const tournament = await getDocument(`tournament::${input.slug}`);
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
            // Check if team name already exists in tournament
            const existingTeams = await query(`SELECT name FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND tournamentId = $1 AND LOWER(name) = LOWER($2)`, { parameters: [input.slug, input.teamName] });
            if (existingTeams.rows.length > 0) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Team name already taken in this tournament',
                });
            }
            const teamId = nanoid();
            const team = {
                _type: 'team',
                id: teamId,
                tournamentId: input.slug,
                name: input.teamName,
                colorHex: input.colorHex,
                flagCode: input.flagCode || '🏁',
                memberIds: [input.userId],
                captainId: input.userId,
                createdAt: new Date().toISOString(),
            };
            await upsertDocument(`team::${teamId}`, team);
            // Broadcast team joined event
            await safeBroadcast(() => pusherServer.broadcastTeamJoined(input.slug, {
                id: teamId,
                name: team.name,
                colorHex: team.colorHex,
                flagCode: team.flagCode,
            }));
            return { teamId };
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
    addMember: protectedProcedure
        .input(z.object({
        teamId: z.string(),
        userId: z.string(),
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
            // Only captain can add members
            if (team.captainId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Only team captain can add members',
                });
            }
            if (team.memberIds.includes(input.userId)) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'User already in team',
                });
            }
            if (team.memberIds.length >= 10) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Team is full (max 10 members)',
                });
            }
            team.memberIds.push(input.userId);
            await upsertDocument(`team::${input.teamId}`, team);
            return { ok: true };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to add member',
            });
        }
    }),
    getById: publicProcedure
        .input(z.object({
        teamId: z.string(),
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
            return team;
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch team',
            });
        }
    }),
});
