import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getDocument, upsertDocument, query } from '../../services/couchbase';
import { nanoid } from 'nanoid';
import type { Tournament, Team } from '../../types';
import { TRPCError } from '@trpc/server';
import { pusherServer, safeBroadcast } from '../services/pusher-server';

export const tournamentRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const slug = input.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50) + '-' + nanoid(6);
        
        // Note: This router is deprecated - use tournament-enhanced.ts instead
        const tournament = {
          _type: 'tournament',
          slug,
          name: input.name,
          date: input.date,
          ownerId: ctx.user.id,
          isOpen: true,
          format: 'single_elimination', // Default format
          maxTeams: 16, // Default max teams
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Tournament;
        
        await upsertDocument(`tournament::${slug}`, tournament);
        return { slug };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create tournament',
        });
      }
    }),

  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const tournament = await getDocument(`tournament::${input.slug}`);
        
        if (!tournament) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tournament not found',
          });
        }
        
        return tournament as Tournament;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tournament',
        });
      }
    }),

  setOpen: protectedProcedure
    .input(z.object({
      slug: z.string(),
      isOpen: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const tournament = await getDocument(`tournament::${input.slug}`) as Tournament;
        
        if (!tournament) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tournament not found',
          });
        }
        
        if (tournament.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to modify this tournament',
          });
        }
        
        tournament.isOpen = input.isOpen;
        tournament.updatedAt = new Date().toISOString();
        
        await upsertDocument(`tournament::${input.slug}`, tournament);
        
        // Broadcast tournament status change
        await safeBroadcast(() =>
          pusherServer.broadcastTournamentStatus(input.slug, input.isOpen)
        );
        
        return { ok: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tournament',
        });
      }
    }),

  listTeams: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const result = await query(
          `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND tournamentId = $1
           ORDER BY createdAt`,
          { parameters: [input.tournamentId] }
        );
        
        return result.rows as Team[];
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch teams',
        });
      }
    }),
});