import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getDocument, upsertDocument, query } from '../../services/couchbase';
import { nanoid } from 'nanoid';
import { TRPCError } from '@trpc/server';
import { pusherServer, safeBroadcast } from '../services/pusher-server';
export const matchRouter = router({
    submitScore: protectedProcedure
        .input(z.object({
        matchId: z.string(),
        winnerTeamId: z.string(),
        score: z.object({
            a: z.number().min(0),
            b: z.number().min(0),
        }).strict(),
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            // Verify match exists and is not complete
            const match = await getDocument(`match::${input.matchId}`);
            if (!match) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Match not found',
                });
            }
            if (match.isComplete) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Match already completed',
                });
            }
            // Verify winner is one of the teams
            if (input.winnerTeamId !== match.teamA && input.winnerTeamId !== match.teamB) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Winner must be one of the match teams',
                });
            }
            // Check for existing pending submissions
            const existingSubmissions = await query(`SELECT id FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'score_submission' AND matchId = $1 AND status = 'PENDING'`, { parameters: [input.matchId] });
            if (existingSubmissions.rows.length > 0) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Score submission already pending for this match',
                });
            }
            const submissionId = nanoid();
            const submission = {
                _type: 'score_submission',
                id: submissionId,
                matchId: input.matchId,
                reporterId: ctx.user.id,
                winnerId: input.winnerTeamId,
                score: input.score,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
            };
            await upsertDocument(`score_submission::${submissionId}`, submission);
            // Note: In production, use a job queue instead of setTimeout
            // Auto-confirm after 5 minutes
            if (process.env.NODE_ENV !== 'test') {
                setTimeout(async () => {
                    try {
                        await confirmScore(submissionId);
                    }
                    catch (error) {
                        console.error('Failed to auto-confirm score:', error);
                    }
                }, 5 * 60 * 1000);
            }
            return { submissionId };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to submit score',
            });
        }
    }),
    confirmScore: protectedProcedure
        .input(z.object({
        submissionId: z.string(),
        confirm: z.boolean(),
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            const submission = await getDocument(`score_submission::${input.submissionId}`);
            if (!submission) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Score submission not found',
                });
            }
            if (submission.status !== 'PENDING') {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Score submission already processed',
                });
            }
            // TODO: Verify ctx.user is a member of the opposing team
            // This would require looking up team membership
            // const match = await getDocument(`match::${submission.matchId}`) as Match;
            // const opposingTeamId = match.teamA === submission.winnerId ? match.teamB : match.teamA;
            if (input.confirm) {
                await confirmScore(input.submissionId);
            }
            else {
                submission.status = 'DISPUTED';
                submission.disputedBy = ctx.user.id;
                submission.disputedAt = new Date().toISOString();
                await upsertDocument(`score_submission::${input.submissionId}`, submission);
            }
            return { ok: true };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to process score confirmation',
            });
        }
    }),
    getUpcomingMatches: publicProcedure
        .input(z.object({
        tournamentId: z.string(),
    }))
        .query(async ({ input }) => {
        try {
            const result = await query(`SELECT m.* FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m
           WHERE m._type = 'match' 
           AND m.tournamentId = $1
           AND m.isComplete = false
           ORDER BY m.round, m.startTime
           LIMIT 20`, { parameters: [input.tournamentId] });
            return result.rows;
        }
        catch (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch upcoming matches',
            });
        }
    }),
    createMatch: protectedProcedure
        .input(z.object({
        eventId: z.string(),
        teamA: z.string(),
        teamB: z.string(),
        round: z.number().min(1),
        startTime: z.string().optional(),
    }))
        .mutation(async ({ input }) => {
        try {
            // Verify event exists
            const event = await getDocument(`event::${input.eventId}`);
            if (!event) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Event not found',
                });
            }
            const matchId = nanoid();
            const match = {
                _type: 'match',
                id: matchId,
                eventId: input.eventId,
                tournamentId: event.tournamentId,
                teamA: input.teamA,
                teamB: input.teamB,
                round: input.round,
                isComplete: false,
                mediaIds: [],
                startTime: input.startTime || new Date().toISOString(),
                createdAt: new Date().toISOString(),
            };
            await upsertDocument(`match::${matchId}`, match);
            // Broadcast game start event
            await safeBroadcast(() => pusherServer.broadcastGameStart(event.tournamentId, matchId, event.name, [input.teamA, input.teamB]));
            return { matchId };
        }
        catch (error) {
            if (error instanceof TRPCError)
                throw error;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create match',
            });
        }
    }),
});
async function updateAndBroadcastLeaderboard(tournamentId) {
    try {
        // Get current rankings
        const result = await query(`SELECT teamId, 
              SUM(points) as totalPoints,
              COUNT(DISTINCT CASE WHEN reason LIKE 'Won %' THEN 1 END) as wins,
              COUNT(DISTINCT CASE WHEN reason LIKE 'Played %' AND reason NOT LIKE 'Won %' THEN 1 END) as losses
       FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
       WHERE _type = 'score_entry' AND tournamentId = $1
       GROUP BY teamId
       ORDER BY totalPoints DESC`, { parameters: [tournamentId] });
        // Calculate rankings with position changes
        const rankings = result.rows.map((row, index) => ({
            teamId: row.teamId,
            rank: index + 1,
            points: row.totalPoints || 0,
            wins: row.wins || 0,
            losses: row.losses || 0,
            pointDiff: 0, // Would need match scores to calculate
        }));
        // For now, we don't track position changes (would need to store previous rankings)
        const changedPositions = [];
        // Broadcast leaderboard update
        await safeBroadcast(() => pusherServer.broadcastLeaderboardUpdate(tournamentId, rankings, changedPositions));
    }
    catch (error) {
        console.error('Failed to update leaderboard:', error);
    }
}
async function confirmScore(submissionId) {
    try {
        // Get submission
        const submission = await getDocument(`score_submission::${submissionId}`);
        if (!submission || submission.status !== 'PENDING') {
            return; // Already processed
        }
        // Get match
        const match = await getDocument(`match::${submission.matchId}`);
        if (!match || match.isComplete) {
            return; // Match already completed
        }
        // Get event to determine scoring
        const event = await getDocument(`event::${match.eventId}`);
        if (!event) {
            throw new Error('Event not found');
        }
        // Update match
        match.winner = submission.winnerId;
        match.isComplete = true;
        match.endTime = new Date().toISOString();
        match.finalScore = submission.score;
        await upsertDocument(`match::${submission.matchId}`, match);
        // Create score entries based on event scoring rules
        const winnerPoints = event.scoring?.win || 10;
        const loserPoints = event.scoring?.loss || 5;
        const winnerEntry = {
            _type: 'score_entry',
            id: nanoid(),
            tournamentId: event.tournamentId,
            eventId: match.eventId || '',
            teamId: submission.winnerId,
            points: winnerPoints,
            reason: `Won ${event.name}`,
            createdAt: new Date().toISOString(),
        };
        const loserTeamId = match.teamA === submission.winnerId ? match.teamB : match.teamA;
        if (!loserTeamId) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid match teams',
            });
        }
        const loserEntry = {
            _type: 'score_entry',
            id: nanoid(),
            tournamentId: event.tournamentId,
            eventId: match.eventId || '',
            teamId: loserTeamId,
            points: loserPoints,
            reason: `Played ${event.name}`,
            createdAt: new Date().toISOString(),
        };
        await upsertDocument(`score_entry::${winnerEntry.id}`, winnerEntry);
        await upsertDocument(`score_entry::${loserEntry.id}`, loserEntry);
        // Update submission status
        submission.status = 'CONFIRMED';
        submission.confirmedAt = new Date().toISOString();
        await upsertDocument(`score_submission::${submissionId}`, submission);
        // Broadcast match completion
        await safeBroadcast(() => pusherServer.broadcastMatchComplete(event.tournamentId, submission.matchId, submission.winnerId, submission.score));
        // Calculate and broadcast leaderboard update
        await updateAndBroadcastLeaderboard(event.tournamentId);
    }
    catch (error) {
        console.error('Failed to confirm score:', error);
        throw error;
    }
}
