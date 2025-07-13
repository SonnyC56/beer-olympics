/**
 * Admin Router for Tournament Management and Analytics
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { getDocument, upsertDocument, query } from '../../services/couchbase';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';
import type { 
  Tournament, 
  Team, 
  Match
} from '../../types';

// Helper to check if user is tournament owner or admin
async function checkTournamentAdmin(tournamentId: string, userId: string): Promise<boolean> {
  const tournament = await getDocument(`tournament::${tournamentId}`) as Tournament;
  if (!tournament) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Tournament not found',
    });
  }
  
  return tournament.ownerId === userId;
}

export const adminRouter = router({
  // Get tournament dashboard data
  getTournamentDashboard: protectedProcedure
    .input(z.object({
      tournamentId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const isAdmin = await checkTournamentAdmin(input.tournamentId, ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to view tournament admin data',
          });
        }
        
        const tournament = await getDocument(`tournament::${input.tournamentId}`) as Tournament;
        
        // Get comprehensive stats
        const [teamsResult, matchesResult, pendingScoresResult, disputesResult] = await Promise.all([
          query(
            `SELECT COUNT(*) as count FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'team' AND tournamentId = $1`,
            { parameters: [input.tournamentId] }
          ),
          query(
            `SELECT COUNT(*) as total, 
                    COUNT(CASE WHEN isComplete = true THEN 1 END) as completed,
                    AVG(CASE WHEN isComplete = true AND endTime IS NOT NULL AND startTime IS NOT NULL 
                        THEN TIMESTAMP_DIFF(endTime, startTime, MINUTE) END) as avgDuration
             FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'match' AND tournamentId = $1`,
            { parameters: [input.tournamentId] }
          ),
          query(
            `SELECT COUNT(*) as count FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default s
             JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m ON m.id = s.matchId
             WHERE s._type = 'score_submission' AND s.status = 'PENDING' AND m.tournamentId = $1`,
            { parameters: [input.tournamentId] }
          ),
          query(
            `SELECT COUNT(*) as count FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default d
             WHERE d._type = 'dispute' AND d.status = 'OPEN' AND d.tournamentId = $1`,
            { parameters: [input.tournamentId] }
          )
        ]);
        
        // Get activity timeline
        const recentActivity = await query(
          `SELECT * FROM (
            SELECT 'team_joined' as type, createdAt, name as description
            FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
            WHERE _type = 'team' AND tournamentId = $1
            UNION ALL
            SELECT 'match_completed' as type, endTime as createdAt, 
                   CONCAT(teamAName, ' vs ', teamBName) as description
            FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
            WHERE _type = 'match' AND tournamentId = $1 AND isComplete = true
          ) as activity
          ORDER BY createdAt DESC
          LIMIT 20`,
          { parameters: [input.tournamentId] }
        );
        
        // Get sub-tournaments if mega tournament
        let subTournamentStats = null;
        if (tournament.isMegaTournament && tournament.subTournamentIds) {
          const subStats = await Promise.all(
            tournament.subTournamentIds.map(async (subId) => {
              const subTournament = await getDocument(`tournament::${subId}`) as Tournament;
              const subMatchesResult = await query(
                `SELECT COUNT(*) as total, COUNT(CASE WHEN isComplete = true THEN 1 END) as completed
                 FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
                 WHERE _type = 'match' AND tournamentId = $1`,
                { parameters: [subId] }
              );
              
              return {
                id: subId,
                name: subTournament?.name || 'Unknown',
                format: subTournament?.format,
                totalMatches: subMatchesResult.rows[0]?.total || 0,
                completedMatches: subMatchesResult.rows[0]?.completed || 0,
                isComplete: subTournament?.isComplete || false
              };
            })
          );
          subTournamentStats = subStats;
        }
        
        return {
          tournament: {
            ...tournament,
            progress: matchesResult.rows[0]?.total > 0 
              ? (matchesResult.rows[0]?.completed / matchesResult.rows[0]?.total) * 100 
              : 0
          },
          stats: {
            totalTeams: teamsResult.rows[0]?.count || 0,
            totalMatches: matchesResult.rows[0]?.total || 0,
            completedMatches: matchesResult.rows[0]?.completed || 0,
            avgMatchDuration: matchesResult.rows[0]?.avgDuration || 0,
            pendingScores: pendingScoresResult.rows[0]?.count || 0,
            openDisputes: disputesResult.rows[0]?.count || 0
          },
          recentActivity: recentActivity.rows,
          subTournamentStats
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tournament dashboard',
        });
      }
    }),

  // Manage tournament settings
  updateTournamentSettings: protectedProcedure
    .input(z.object({
      tournamentId: z.string(),
      updates: z.object({
        name: z.string().optional(),
        date: z.string().optional(),
        isOpen: z.boolean().optional(),
        settings: z.object({
          venue: z.string().optional(),
          rules: z.array(z.string()).optional(),
          matchDuration: z.number().optional(),
          breakBetweenMatches: z.number().optional(),
          allowTies: z.boolean().optional(),
          autoAdvance: z.boolean().optional()
        }).optional()
      })
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const isAdmin = await checkTournamentAdmin(input.tournamentId, ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to update tournament settings',
          });
        }
        
        const tournament = await getDocument(`tournament::${input.tournamentId}`) as Tournament;
        
        // Apply updates
        if (input.updates.name) tournament.name = input.updates.name;
        if (input.updates.date) tournament.date = input.updates.date;
        if (input.updates.isOpen !== undefined) tournament.isOpen = input.updates.isOpen;
        if (input.updates.settings) {
          tournament.settings = { ...tournament.settings, ...input.updates.settings };
        }
        
        tournament.updatedAt = new Date().toISOString();
        await upsertDocument(`tournament::${input.tournamentId}`, tournament);
        
        return { ok: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tournament settings',
        });
      }
    }),

  // Get detailed analytics
  getTournamentAnalytics: protectedProcedure
    .input(z.object({
      tournamentId: z.string(),
      timeframe: z.enum(['all', 'today', 'week', 'month']).default('all')
    }))
    .query(async ({ input, ctx }) => {
      try {
        const isAdmin = await checkTournamentAdmin(input.tournamentId, ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to view tournament analytics',
          });
        }
        
        // Build date filter
        let dateFilter = '';
        const now = new Date();
        if (input.timeframe === 'today') {
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFilter = `AND createdAt >= '${startOfDay.toISOString()}'`;
        } else if (input.timeframe === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = `AND createdAt >= '${weekAgo.toISOString()}'`;
        } else if (input.timeframe === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = `AND createdAt >= '${monthAgo.toISOString()}'`;
        }
        
        // Get team performance analytics
        const teamPerformance = await query(
          `SELECT 
            t.id, t.name, t.colorHex,
            COUNT(DISTINCT CASE WHEN m.teamA = t.id OR m.teamB = t.id THEN m.id END) as matchesPlayed,
            COUNT(DISTINCT CASE WHEN m.winner = t.id THEN m.id END) as wins,
            SUM(CASE WHEN m.teamA = t.id THEN m.finalScore.a ELSE m.finalScore.b END) as totalPoints,
            AVG(CASE WHEN m.teamA = t.id THEN m.finalScore.a ELSE m.finalScore.b END) as avgPoints
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default t
           LEFT JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m 
             ON (m.teamA = t.id OR m.teamB = t.id) AND m._type = 'match' AND m.isComplete = true ${dateFilter}
           WHERE t._type = 'team' AND t.tournamentId = $1
           GROUP BY t.id, t.name, t.colorHex
           ORDER BY wins DESC, totalPoints DESC`,
          { parameters: [input.tournamentId] }
        );
        
        // Get match completion trends
        const matchTrends = await query(
          `SELECT 
            DATE_FORMAT(endTime, '%Y-%m-%d') as date,
            COUNT(*) as matchesCompleted,
            AVG(TIMESTAMP_DIFF(endTime, startTime, MINUTE)) as avgDuration
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'match' 
           AND tournamentId = $1 
           AND isComplete = true 
           AND endTime IS NOT NULL
           ${dateFilter}
           GROUP BY DATE_FORMAT(endTime, '%Y-%m-%d')
           ORDER BY date`,
          { parameters: [input.tournamentId] }
        );
        
        // Get player participation stats
        const playerStats = await query(
          `SELECT 
            COUNT(DISTINCT p.userId) as totalPlayers,
            AVG(p.stats.totalGamesPlayed) as avgGamesPerPlayer,
            MAX(p.stats.totalWins) as topPlayerWins,
            AVG(p.stats.winRate) as avgWinRate
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default p
           WHERE p._type = 'player_profile'
           AND p.userId IN (
             SELECT DISTINCT UNNEST(memberIds) as userId
             FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'team' AND tournamentId = $1
           )`,
          { parameters: [input.tournamentId] }
        );
        
        // Get event popularity
        const eventPopularity = await query(
          `SELECT 
            e.name, e.type,
            COUNT(m.id) as timesPlayed,
            AVG(m.finalScore.a + m.finalScore.b) as avgTotalScore,
            AVG(ABS(m.finalScore.a - m.finalScore.b)) as avgScoreDiff
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default e
           JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m 
             ON m.eventId = e.id AND m._type = 'match' AND m.isComplete = true ${dateFilter}
           WHERE e._type = 'event' AND e.tournamentId = $1
           GROUP BY e.name, e.type
           ORDER BY timesPlayed DESC`,
          { parameters: [input.tournamentId] }
        );
        
        // Get engagement metrics
        const engagement = await query(
          `SELECT 
            COUNT(DISTINCT s.reporterId) as uniqueScoreReporters,
            COUNT(s.id) as totalScoreSubmissions,
            AVG(CASE WHEN s.status = 'DISPUTED' THEN 1 ELSE 0 END) * 100 as disputeRate,
            COUNT(DISTINCT m.id) as matchesWithMedia
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default s
           JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m 
             ON m.id = s.matchId AND m.tournamentId = $1
           LEFT JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default media
             ON media.matchId = m.id
           WHERE s._type = 'score_submission' ${dateFilter}`,
          { parameters: [input.tournamentId] }
        );
        
        return {
          teamPerformance: teamPerformance.rows,
          matchTrends: matchTrends.rows,
          playerStats: playerStats.rows[0] || {},
          eventPopularity: eventPopularity.rows,
          engagement: engagement.rows[0] || {},
          timeframe: input.timeframe
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tournament analytics',
        });
      }
    }),

  // Manage teams (remove, edit)
  manageTeam: protectedProcedure
    .input(z.object({
      tournamentId: z.string(),
      teamId: z.string(),
      action: z.enum(['remove', 'edit', 'warn']),
      updates: z.object({
        name: z.string().optional(),
        colorHex: z.string().optional(),
        flagCode: z.string().optional()
      }).optional(),
      reason: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const isAdmin = await checkTournamentAdmin(input.tournamentId, ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to manage teams',
          });
        }
        
        const team = await getDocument(`team::${input.teamId}`) as Team;
        if (!team || team.tournamentId !== input.tournamentId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Team not found in this tournament',
          });
        }
        
        switch (input.action) {
          case 'remove': {
            // Check if team has played matches
            const matchesPlayed = await query(
              `SELECT COUNT(*) as count FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
               WHERE _type = 'match' 
               AND (teamA = $1 OR teamB = $1)
               AND isComplete = true`,
              { parameters: [input.teamId] }
            );
            
            if (matchesPlayed.rows[0]?.count > 0) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Cannot remove team that has played matches',
              });
            }
            
            // Soft delete by marking as removed
            team.isRemoved = true;
            team.removedAt = new Date().toISOString();
            team.removedReason = input.reason;
            break;
          }
            
          case 'edit':
            if (input.updates) {
              if (input.updates.name) team.name = input.updates.name;
              if (input.updates.colorHex) team.colorHex = input.updates.colorHex;
              if (input.updates.flagCode) team.flagCode = input.updates.flagCode;
            }
            break;
            
          case 'warn':
            // Add warning to team record
            if (!team.warnings) team.warnings = [];
            team.warnings.push({
              reason: input.reason || 'Admin warning',
              issuedBy: ctx.user.id,
              issuedAt: new Date().toISOString()
            });
            break;
        }
        
        team.updatedAt = new Date().toISOString();
        await upsertDocument(`team::${input.teamId}`, team);
        
        // Log admin action
        await upsertDocument(`admin_action::${nanoid()}`, {
          _type: 'admin_action',
          tournamentId: input.tournamentId,
          adminId: ctx.user.id,
          action: input.action,
          targetType: 'team',
          targetId: input.teamId,
          reason: input.reason,
          timestamp: new Date().toISOString()
        });
        
        return { ok: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to manage team',
        });
      }
    }),

  // Override match results
  overrideMatch: protectedProcedure
    .input(z.object({
      tournamentId: z.string(),
      matchId: z.string(),
      winnerId: z.string(),
      score: z.object({
        a: z.number().min(0),
        b: z.number().min(0)
      }),
      reason: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const isAdmin = await checkTournamentAdmin(input.tournamentId, ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to override matches',
          });
        }
        
        const match = await getDocument(`match::${input.matchId}`) as Match;
        if (!match || match.tournamentId !== input.tournamentId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Match not found in this tournament',
          });
        }
        
        // Store original values for audit
        const originalValues = {
          winner: match.winner,
          score: match.finalScore,
          isComplete: match.isComplete
        };
        
        // Override match
        match.winner = input.winnerId;
        match.finalScore = input.score;
        match.isComplete = true;
        match.endTime = match.endTime || new Date().toISOString();
        match.adminOverride = {
          overriddenBy: ctx.user.id,
          overriddenAt: new Date().toISOString(),
          reason: input.reason,
          originalValues
        };
        
        await upsertDocument(`match::${input.matchId}`, match);
        
        // Log admin action
        await upsertDocument(`admin_action::${nanoid()}`, {
          _type: 'admin_action',
          tournamentId: input.tournamentId,
          adminId: ctx.user.id,
          action: 'override_match',
          targetType: 'match',
          targetId: input.matchId,
          reason: input.reason,
          data: { winnerId: input.winnerId, score: input.score, originalValues },
          timestamp: new Date().toISOString()
        });
        
        return { ok: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to override match',
        });
      }
    }),

  // Get admin activity log
  getAdminLog: protectedProcedure
    .input(z.object({
      tournamentId: z.string(),
      limit: z.number().min(1).max(100).default(50)
    }))
    .query(async ({ input, ctx }) => {
      try {
        const isAdmin = await checkTournamentAdmin(input.tournamentId, ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to view admin log',
          });
        }
        
        const result = await query(
          `SELECT a.*, u.name as adminName
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default a
           LEFT JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default u
             ON u.id = a.adminId
           WHERE a._type = 'admin_action' AND a.tournamentId = $1
           ORDER BY a.timestamp DESC
           LIMIT $2`,
          { parameters: [input.tournamentId, input.limit] }
        );
        
        return result.rows;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch admin log',
        });
      }
    }),

  // Export tournament data
  exportTournamentData: protectedProcedure
    .input(z.object({
      tournamentId: z.string(),
      format: z.enum(['json', 'csv']).default('json'),
      includePlayerData: z.boolean().default(false)
    }))
    .query(async ({ input, ctx }) => {
      try {
        const isAdmin = await checkTournamentAdmin(input.tournamentId, ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to export tournament data',
          });
        }
        
        const tournament = await getDocument(`tournament::${input.tournamentId}`) as Tournament;
        
        // Get all related data
        const [teams, matches, events, scores] = await Promise.all([
          query(
            `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'team' AND tournamentId = $1`,
            { parameters: [input.tournamentId] }
          ),
          query(
            `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'match' AND tournamentId = $1`,
            { parameters: [input.tournamentId] }
          ),
          query(
            `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'event' AND tournamentId = $1`,
            { parameters: [input.tournamentId] }
          ),
          query(
            `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'score_entry' AND tournamentId = $1`,
            { parameters: [input.tournamentId] }
          )
        ]);
        
        let playerData = null;
        if (input.includePlayerData) {
          // Get all player IDs from teams
          const allPlayerIds = (teams.rows || []).flatMap((team: Team) => team.memberIds || []);
          const uniquePlayerIds = [...new Set(allPlayerIds)];
          
          const playerProfiles = await Promise.all(
            uniquePlayerIds.map(id => getDocument(`player_profile::${id}`))
          );
          
          playerData = playerProfiles.filter(p => p !== null);
        }
        
        const exportData = {
          tournament,
          teams: teams.rows,
          matches: matches.rows,
          events: events.rows,
          scores: scores.rows,
          players: playerData,
          exportedAt: new Date().toISOString(),
          exportedBy: ctx.user.id
        };
        
        if (input.format === 'csv') {
          // Convert to CSV format (simplified example)
          // In production, use a proper CSV library
          const csv = convertToCSV(exportData);
          return { format: 'csv', data: csv };
        }
        
        return { format: 'json', data: exportData };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export tournament data',
        });
      }
    }),

  // Broadcast announcement
  broadcastAnnouncement: protectedProcedure
    .input(z.object({
      tournamentId: z.string(),
      title: z.string().max(100),
      message: z.string().max(1000),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      targetAudience: z.enum(['all', 'teams', 'captains']).default('all')
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const isAdmin = await checkTournamentAdmin(input.tournamentId, ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to broadcast announcements',
          });
        }
        
        const announcementId = nanoid();
        const announcement = {
          _type: 'announcement',
          id: announcementId,
          tournamentId: input.tournamentId,
          title: input.title,
          message: input.message,
          priority: input.priority,
          targetAudience: input.targetAudience,
          createdBy: ctx.user.id,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        
        await upsertDocument(`announcement::${announcementId}`, announcement);
        
        // In production, trigger push notifications and emails here
        // based on targetAudience and player preferences
        
        return { 
          announcementId,
          recipientCount: 0 // Would be actual count in production
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to broadcast announcement',
        });
      }
    })
});

// Helper function to convert data to CSV
function convertToCSV(data: any): string {
  // Simplified CSV conversion - in production use a proper library
  const teams = (data.teams || []).map((team: Team) => ({
    Name: team.name,
    'Member Count': team.memberIds.length,
    Color: team.colorHex,
    'Created At': team.createdAt
  }));
  
  const headers = Object.keys(teams[0] || {}).join(',');
  const rows = teams.map((team: any) => Object.values(team).join(','));
  
  return [headers, ...rows].join('\n');
}