import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { query } from '../../services/couchbase';
import { TRPCError } from '@trpc/server';
export const leaderboardRouter = router({
    list: publicProcedure
        .input(z.object({
        slug: z.string(),
    }))
        .query(async ({ input }) => {
        try {
            // First get all teams for the tournament
            const teamsResult = await query(`SELECT id, name, colorHex, flagCode 
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND tournamentId = $1`, { parameters: [input.slug] });
            // Then get score totals
            const scoresResult = await query(`SELECT teamId, SUM(points) as total
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'score_entry' AND tournamentId = $1
           GROUP BY teamId`, { parameters: [input.slug] });
            // Create a map of scores
            const scoreMap = new Map();
            scoresResult.rows.forEach((row) => {
                scoreMap.set(row.teamId, row.total || 0);
            });
            // Combine teams with scores
            const leaderboard = teamsResult.rows.map((team) => ({
                teamId: team.id,
                teamName: team.name,
                colorHex: team.colorHex,
                flagCode: team.flagCode,
                totalPoints: scoreMap.get(team.id) || 0,
            }));
            // Sort by points descending
            leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
            // Add positions
            return leaderboard.map((team, index) => ({
                position: index + 1,
                ...team,
            }));
        }
        catch (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch leaderboard',
            });
        }
    }),
    teamStats: publicProcedure
        .input(z.object({
        teamId: z.string(),
    }))
        .query(async ({ input }) => {
        try {
            const result = await query(`SELECT e.name as eventName, se.eventId, SUM(se.points) as points, COUNT(*) as entries
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default se
           JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default e 
           ON META(e).id = CONCAT('event::', se.eventId)
           WHERE se._type = 'score_entry' 
           AND se.teamId = $1
           AND e._type = 'event'
           GROUP BY e.name, se.eventId
           ORDER BY points DESC`, { parameters: [input.teamId] });
            return result.rows;
        }
        catch (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch team statistics',
            });
        }
    }),
    recentActivity: publicProcedure
        .input(z.object({
        tournamentId: z.string(),
        limit: z.number().min(1).max(50).default(10),
    }))
        .query(async ({ input }) => {
        try {
            const result = await query(`SELECT se.*, t.name as teamName, t.colorHex, e.name as eventName
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default se
           JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default t 
           ON META(t).id = CONCAT('team::', se.teamId)
           JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default e 
           ON META(e).id = CONCAT('event::', se.eventId)
           WHERE se._type = 'score_entry' 
           AND se.tournamentId = $1
           AND t._type = 'team'
           AND e._type = 'event'
           ORDER BY se.createdAt DESC
           LIMIT $2`, { parameters: [input.tournamentId, input.limit] });
            return result.rows;
        }
        catch (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch recent activity',
            });
        }
    }),
});
