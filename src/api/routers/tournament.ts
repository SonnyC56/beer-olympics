import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getCollection } from '../../services/couchbase';
import { nanoid } from 'nanoid';
import type { Tournament, Team } from '../../types';

export const tournamentRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      date: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const collection = await getCollection();
      const slug = input.name.toLowerCase().replace(/\s+/g, '-') + '-' + nanoid(6);
      
      const tournament: Tournament = {
        _type: 'tournament',
        slug,
        name: input.name,
        date: input.date,
        ownerId: ctx.user.id,
        isOpen: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await collection.insert(`tournament::${slug}`, tournament);
      return { slug };
    }),

  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      const collection = await getCollection();
      try {
        const result = await collection.get(`tournament::${input.slug}`);
        return result.content as Tournament;
      } catch (error) {
        throw new Error('Tournament not found');
      }
    }),

  setOpen: protectedProcedure
    .input(z.object({
      slug: z.string(),
      isOpen: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const collection = await getCollection();
      const docId = `tournament::${input.slug}`;
      
      const result = await collection.get(docId);
      const tournament = result.content as Tournament;
      
      if (tournament.ownerId !== ctx.user.id) {
        throw new Error('Not authorized');
      }
      
      tournament.isOpen = input.isOpen;
      tournament.updatedAt = new Date().toISOString();
      await collection.replace(docId, tournament);
      
      return { ok: true };
    }),

  listTeams: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
    }))
    .query(async ({ input }) => {
      const collection = await getCollection();
      const query = `
        SELECT * FROM \`beer_olympics\`._default
        WHERE _type = 'team' AND tournamentId = $1
        ORDER BY createdAt
      `;
      
      const result = await collection.cluster.query(query, {
        parameters: [input.tournamentId],
      });
      
      return result.rows as Team[];
    }),
});