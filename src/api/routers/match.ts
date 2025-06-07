import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getCollection } from '../../services/couchbase';
import { nanoid } from 'nanoid';
import type { Match, ScoreSubmission, ScoreEntry } from '../../types';

export const matchRouter = router({
  submitScore: protectedProcedure
    .input(z.object({
      matchId: z.string(),
      winnerTeamId: z.string(),
      score: z.object({
        a: z.number(),
        b: z.number(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const collection = await getCollection();
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
      
      await collection.insert(`score_submission::${submissionId}`, submission);
      
      // Auto-confirm after 5 minutes
      setTimeout(async () => {
        try {
          const doc = await collection.get(`score_submission::${submissionId}`);
          const sub = doc.content as ScoreSubmission;
          if (sub.status === 'PENDING') {
            await confirmScore(submissionId);
          }
        } catch (error) {
          // Submission might have been handled already
        }
      }, 5 * 60 * 1000);
      
      return { submissionId };
    }),

  confirmScore: protectedProcedure
    .input(z.object({
      submissionId: z.string(),
      confirm: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      if (input.confirm) {
        await confirmScore(input.submissionId);
      } else {
        const collection = await getCollection();
        const doc = await collection.get(`score_submission::${input.submissionId}`);
        const submission = doc.content as ScoreSubmission;
        submission.status = 'DISPUTED';
        await collection.replace(`score_submission::${input.submissionId}`, submission);
      }
      
      return { ok: true };
    }),

  getUpcomingMatches: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
    }))
    .query(async ({ input }) => {
      const collection = await getCollection();
      const query = `
        SELECT m.* FROM \`beer_olympics\`._default m
        JOIN \`beer_olympics\`._default e ON KEY e FOR m
        WHERE m._type = 'match' 
        AND e.tournamentId = $1
        AND m.isComplete = false
        ORDER BY m.round, m.createdAt
        LIMIT 20
      `;
      
      const result = await collection.cluster.query(query, {
        parameters: [input.tournamentId],
      });
      
      return result.rows as Match[];
    }),
});

async function confirmScore(submissionId: string) {
  const collection = await getCollection();
  
  // Get submission
  const subDoc = await collection.get(`score_submission::${submissionId}`);
  const submission = subDoc.content as ScoreSubmission;
  
  // Get match
  const matchDoc = await collection.get(`match::${submission.matchId}`);
  const match = matchDoc.content as Match;
  
  // Update match
  match.winner = submission.winnerId;
  match.isComplete = true;
  match.endTime = new Date().toISOString();
  await collection.replace(`match::${submission.matchId}`, match);
  
  // Create score entries
  // This would need event info to determine points, simplified here
  const winnerPoints = 10;
  const loserPoints = 5;
  
  const winnerEntry: ScoreEntry = {
    _type: 'score_entry',
    id: nanoid(),
    tournamentId: match.eventId, // Would need to look up event->tournament
    eventId: match.eventId,
    teamId: submission.winnerId,
    points: winnerPoints,
    reason: 'Match win',
    createdAt: new Date().toISOString(),
  };
  
  const loserTeamId = match.teamA === submission.winnerId ? match.teamB : match.teamA;
  const loserEntry: ScoreEntry = {
    _type: 'score_entry',
    id: nanoid(),
    tournamentId: match.eventId,
    eventId: match.eventId,
    teamId: loserTeamId,
    points: loserPoints,
    reason: 'Match participation',
    createdAt: new Date().toISOString(),
  };
  
  await collection.insert(`score_entry::${winnerEntry.id}`, winnerEntry);
  await collection.insert(`score_entry::${loserEntry.id}`, loserEntry);
  
  // Update submission status
  const finalSubDoc = await collection.get(`score_submission::${submissionId}`);
  const finalSub = finalSubDoc.content as ScoreSubmission;
  finalSub.status = 'CONFIRMED';
  await collection.replace(`score_submission::${submissionId}`, finalSub);
}