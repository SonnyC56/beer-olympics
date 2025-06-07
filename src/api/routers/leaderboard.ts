import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { getCollection } from '../../services/couchbase';

export const leaderboardRouter = router({
  list: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      const collection = await getCollection();
      
      const query = `
        SELECT 
          t.id as teamId,
          t.name as teamName,
          t.colorHex,
          t.flagCode,
          SUM(se.points) as total
        FROM \`beer_olympics\`._default se
        JOIN \`beer_olympics\`._default t ON KEY t FOR se
        WHERE se._type = 'score_entry' 
        AND se.tournamentId = $1
        AND t._type = 'team'
        GROUP BY t.id, t.name, t.colorHex, t.flagCode
        ORDER BY total DESC
      `;
      
      const result = await collection.cluster.query(query, {
        parameters: [input.slug],
      });
      
      return result.rows.map((row: any, index: number) => ({
        position: index + 1,
        teamId: row.teamId,
        teamName: row.teamName,
        colorHex: row.colorHex,
        flagCode: row.flagCode,
        totalPoints: row.total || 0,
      }));
    }),

  teamStats: publicProcedure
    .input(z.object({
      teamId: z.string(),
    }))
    .query(async ({ input }) => {
      const collection = await getCollection();
      
      const query = `
        SELECT 
          e.name as eventName,
          SUM(se.points) as points,
          COUNT(*) as entries
        FROM \`beer_olympics\`._default se
        JOIN \`beer_olympics\`._default e ON KEY e FOR se
        WHERE se._type = 'score_entry' 
        AND se.teamId = $1
        AND e._type = 'event'
        GROUP BY e.name
        ORDER BY points DESC
      `;
      
      const result = await collection.cluster.query(query, {
        parameters: [input.teamId],
      });
      
      return result.rows;
    }),
});