import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getDocument, upsertDocument, query } from '../../services/couchbase';
import { nanoid } from 'nanoid';
import type { Match, ScoreSubmission, ScoreEntry, Event } from '../../types';
import { TRPCError } from '@trpc/server';
import { triggerEvent, getTournamentChannel } from '../../services/pusher';

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
        const match = await getDocument(`match::${input.matchId}`) as Match;
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
        const existingSubmissions = await query(
          `SELECT id FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'score_submission' AND matchId = $1 AND status = 'PENDING'`,
          { parameters: [input.matchId] }
        );
        
        if (existingSubmissions.rows.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Score submission already pending for this match',
          });
        }
        
        const submissionId = nanoid();
        const submission: ScoreSubmission = {
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
            } catch (error) {
              console.error('Failed to auto-confirm score:', error);
            }
          }, 5 * 60 * 1000);
        }
        
        return { submissionId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
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
        const submission = await getDocument(`score_submission::${input.submissionId}`) as ScoreSubmission;
        
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
        } else {
          submission.status = 'DISPUTED';
          submission.disputedBy = ctx.user.id;
          submission.disputedAt = new Date().toISOString();
          await upsertDocument(`score_submission::${input.submissionId}`, submission);
        }
        
        return { ok: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
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
        const result = await query(
          `SELECT m.* FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m
           WHERE m._type = 'match' 
           AND m.tournamentId = $1
           AND m.isComplete = false
           ORDER BY m.round, m.startTime
           LIMIT 20`,
          { parameters: [input.tournamentId] }
        );
        
        return result.rows as Match[];
      } catch (error) {
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
        const event = await getDocument(`event::${input.eventId}`) as Event;
        if (!event) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Event not found',
          });
        }
        
        const matchId = nanoid();
        const match: Match = {
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
        return { matchId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create match',
        });
      }
    }),
});

async function confirmScore(submissionId: string) {
  try {
    // Get submission
    const submission = await getDocument(`score_submission::${submissionId}`) as ScoreSubmission;
    if (!submission || submission.status !== 'PENDING') {
      return; // Already processed
    }
    
    // Get match
    const match = await getDocument(`match::${submission.matchId}`) as Match;
    if (!match || match.isComplete) {
      return; // Match already completed
    }
    
    // Get event to determine scoring
    const event = await getDocument(`event::${match.eventId}`) as Event;
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
    
    const winnerEntry: ScoreEntry = {
      _type: 'score_entry',
      id: nanoid(),
      tournamentId: event.tournamentId,
      eventId: match.eventId,
      teamId: submission.winnerId,
      points: winnerPoints,
      reason: `Won ${event.name}`,
      createdAt: new Date().toISOString(),
    };
    
    const loserTeamId = match.teamA === submission.winnerId ? match.teamB : match.teamA;
    const loserEntry: ScoreEntry = {
      _type: 'score_entry',
      id: nanoid(),
      tournamentId: event.tournamentId,
      eventId: match.eventId,
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
    
    // Trigger real-time updates
    await Promise.all([
      // Score update for winner
      triggerEvent(getTournamentChannel(event.tournamentId), 'score-update', {
        tournamentId: event.tournamentId,
        matchId: match.id,
        teamId: submission.winnerId,
        points: winnerPoints,
      }),
      // Score update for loser
      triggerEvent(getTournamentChannel(event.tournamentId), 'score-update', {
        tournamentId: event.tournamentId,
        matchId: match.id,
        teamId: loserTeamId,
        points: loserPoints,
      }),
      // Match complete event
      triggerEvent(getTournamentChannel(event.tournamentId), 'match-complete', {
        tournamentId: event.tournamentId,
        matchId: match.id,
        winner: submission.winnerId,
      }),
    ]);
  } catch (error) {
    console.error('Failed to confirm score:', error);
    throw error;
  }
}