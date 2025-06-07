import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getCollection } from '../../services/couchbase';
import { nanoid } from 'nanoid';
import type { Team, Tournament } from '../../types';

export const teamRouter = router({
  joinPublic: publicProcedure
    .input(z.object({
      slug: z.string(),
      teamName: z.string(),
      colorHex: z.string(),
      flagCode: z.string().optional(),
      userId: z.string(),
      userName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const collection = await getCollection();
      
      // Check if tournament exists and is open
      const tournamentDoc = await collection.get(`tournament::${input.slug}`);
      const tournament = tournamentDoc.content as Tournament;
      
      if (!tournament.isOpen) {
        throw new Error('Tournament registration is closed');
      }
      
      const teamId = nanoid();
      const team: Team = {
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
      
      await collection.insert(`team::${teamId}`, team);
      return { teamId };
    }),

  addMember: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const collection = await getCollection();
      const docId = `team::${input.teamId}`;
      
      const result = await collection.get(docId);
      const team = result.content as Team;
      
      // Only captain can add members
      if (team.captainId !== ctx.user.id) {
        throw new Error('Only team captain can add members');
      }
      
      if (team.memberIds.includes(input.userId)) {
        throw new Error('User already in team');
      }
      
      team.memberIds.push(input.userId);
      await collection.replace(docId, team);
      
      return { ok: true };
    }),

  getById: publicProcedure
    .input(z.object({
      teamId: z.string(),
    }))
    .query(async ({ input }) => {
      const collection = await getCollection();
      const result = await collection.get(`team::${input.teamId}`);
      return result.content as Team;
    }),
});