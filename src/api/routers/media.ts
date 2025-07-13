import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { mediaService } from '../../services/media';
import { couchbaseService } from '../../services/couchbase';
import { realtimeService } from '../../services/realtime-server';
import type { Media } from '../../types';
import { TRPCError } from '@trpc/server';

export const mediaRouter = router({
  // Upload media (photo or video)
  upload: protectedProcedure
    .input(z.object({
      matchId: z.string(),
      tournamentId: z.string(),
      type: z.enum(['photo', 'video']),
      fileData: z.string(), // Base64 encoded file data
      testimonial: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { matchId, tournamentId, type, fileData, testimonial, tags } = input;
      const uploaderId = ctx.user.id;

      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(fileData, 'base64');

        // Upload to Cloudinary
        const uploadResult = await mediaService.uploadFile(buffer, {
          matchId,
          tournamentId,
          uploaderId,
          type,
          tags,
          testimonial,
        });

        // Create media document
        const media: Media = {
          _type: 'media',
          id: uploadResult.id,
          matchId,
          uploaderId,
          kind: type,
          providerId: uploadResult.publicId,
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          testimonial,
          createdAt: new Date().toISOString(),
        };

        // Save to database
        await couchbaseService.upsert(`media:${media.id}`, media);

        // Emit real-time update
        await realtimeService.emitMediaUpload(tournamentId, matchId, media);

        return {
          success: true,
          media,
        };
      } catch (error) {
        console.error('Media upload error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload media',
        });
      }
    }),

  // Get media for a match
  getMatchMedia: publicProcedure
    .input(z.object({
      matchId: z.string(),
    }))
    .query(async ({ input }) => {
      // const { matchId } = input;

      try {
        // Query from database
        const query = `
          SELECT m.*
          FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m
          WHERE m._type = 'media'
          AND m.matchId = $matchId
          ORDER BY m.createdAt DESC
        `;

        const result = await couchbaseService.query(query, [input.matchId]);
        const media = result.rows.map((row: any) => row);

        return media;
      } catch (error) {
        console.error('Get match media error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch match media',
        });
      }
    }),

  // Get media for a tournament
  getTournamentMedia: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const { tournamentId, limit, offset } = input;

      try {
        // Get tournament to find all matches
        const tournamentQuery = `
          SELECT m.matchId
          FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m
          WHERE m._type = 'match'
          AND m.tournamentId = $tournamentId
        `;

        const matchResult = await couchbaseService.query(tournamentQuery, [tournamentId]);
        const matchIds = matchResult.rows.map(row => row.matchId);

        if (matchIds.length === 0) {
          return { media: [], total: 0 };
        }

        // Get media for all matches
        const mediaQuery = `
          SELECT m.*, COUNT(*) OVER() as total
          FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m
          WHERE m._type = 'media'
          AND m.matchId IN $matchIds
          ORDER BY m.createdAt DESC
          LIMIT $limit OFFSET $offset
        `;

        const result = await couchbaseService.query(mediaQuery, [matchIds, limit, offset]);
        
        const media = result.rows.map(row => {
          const { total: _total, ...mediaData } = row;
          return mediaData;
        });

        const total = result.rows.length > 0 ? result.rows[0].total : 0;

        return { media, total };
      } catch (error) {
        console.error('Get tournament media error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tournament media',
        });
      }
    }),

  // Delete media (only by uploader or admin)
  delete: protectedProcedure
    .input(z.object({
      mediaId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { mediaId } = input;
      const userId = ctx.user.id;

      try {
        // Get media document
        const media = await couchbaseService.get(`media:${mediaId}`) as Media | null;

        if (!media) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Media not found',
          });
        }

        // Check permissions (only uploader or admin can delete)
        if (media.uploaderId !== userId && ctx.user.role !== 'owner') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this media',
          });
        }

        // Delete from Cloudinary
        await mediaService.deleteFile(media.providerId, media.kind === 'video' ? 'video' : 'image');

        // Delete from database
        await couchbaseService.remove(`media:${mediaId}`);

        // Emit real-time update
        await realtimeService.emitMediaDelete(media.matchId, mediaId);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('Media delete error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete media',
        });
      }
    }),

  // Get tournament highlights
  getHighlights: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
    }))
    .query(async ({ input }) => {
      const { tournamentId } = input;

      try {
        // Get all media for the tournament
        const mediaResult = await mediaService.getTournamentMedia(tournamentId);
        const mediaIds = mediaResult.map(m => m.public_id);

        // Detect highlights using AI tags
        const highlights = await mediaService.detectHighlights(mediaIds as string[]);

        // Fetch full media details for each highlight category
        const fetchMediaDetails = async (ids: string[]) => {
          const details = [];
          for (const id of ids.slice(0, 5)) { // Limit to top 5 per category
            const query = `
              SELECT m.*
              FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m
              WHERE m._type = 'media'
              AND m.providerId = $providerId
              LIMIT 1
            `;
            const result = await couchbaseService.query(query, [id]);
            if (result.rows.length > 0) {
              details.push(result.rows[0]);
            }
          }
          return details;
        };

        const [fastestChug, biggestUpset, funnyMoments] = await Promise.all([
          fetchMediaDetails(highlights.fastestChug),
          fetchMediaDetails(highlights.biggestUpset),
          fetchMediaDetails(highlights.funnyMoments),
        ]);

        return {
          fastestChug,
          biggestUpset,
          funnyMoments,
        };
      } catch (error) {
        console.error('Get highlights error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch highlights',
        });
      }
    }),

  // Generate highlight reel
  generateHighlightReel: protectedProcedure
    .input(z.object({
      tournamentId: z.string(),
      videoIds: z.array(z.string()).min(2).max(10),
    }))
    .mutation(async ({ input }) => {
      const { tournamentId, videoIds } = input;

      try {
        const reelUrl = await mediaService.generateHighlightReel(tournamentId, videoIds);

        return {
          success: true,
          reelUrl,
        };
      } catch (error) {
        console.error('Generate highlight reel error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate highlight reel',
        });
      }
    }),

  // Subscribe to media updates for a match
  subscribeToMatch: publicProcedure
    .input(z.object({
      matchId: z.string(),
    }))
    .subscription(({ /* input */ }) => {
      // This would be implemented with a real-time subscription
      // For now, returning a placeholder
      return {
        async *[Symbol.asyncIterator]() {
          // Yield updates as they come
        },
      };
    }),
});