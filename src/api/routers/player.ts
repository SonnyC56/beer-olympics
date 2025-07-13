/**
 * Player Profile Router
 * Manages individual player profiles, stats, and achievements
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getDocument, upsertDocument, query } from '../../services/couchbase';
// import { nanoid } from 'nanoid'; // Currently unused
import type { 
  PlayerProfile, 
  GameSpecificStats,
  Achievement 
} from '../../types';
import { TRPCError } from '@trpc/server';

// Achievement definitions
const ACHIEVEMENTS = {
  // Milestone achievements
  first_win: {
    id: 'first_win',
    type: 'milestone' as const,
    name: 'First Victory',
    description: 'Win your first game',
    rarity: 'common' as const
  },
  ten_wins: {
    id: 'ten_wins',
    type: 'milestone' as const,
    name: 'Winning Streak',
    description: 'Win 10 games total',
    rarity: 'rare' as const
  },
  fifty_wins: {
    id: 'fifty_wins',
    type: 'milestone' as const,
    name: 'Veteran Player',
    description: 'Win 50 games total',
    rarity: 'epic' as const
  },
  hundred_wins: {
    id: 'hundred_wins',
    type: 'milestone' as const,
    name: 'Century Club',
    description: 'Win 100 games total',
    rarity: 'legendary' as const
  },
  
  // Tournament achievements
  tournament_winner: {
    id: 'tournament_winner',
    type: 'tournament' as const,
    name: 'Champion',
    description: 'Win a tournament',
    rarity: 'epic' as const
  },
  podium_finish: {
    id: 'podium_finish',
    type: 'tournament' as const,
    name: 'Podium Finish',
    description: 'Finish in top 3 of a tournament',
    rarity: 'rare' as const
  },
  
  // Special achievements
  comeback_king: {
    id: 'comeback_king',
    type: 'special' as const,
    name: 'Comeback King',
    description: 'Win 5 games after being behind',
    rarity: 'rare' as const
  },
  perfect_game: {
    id: 'perfect_game',
    type: 'special' as const,
    name: 'Perfect Game',
    description: 'Win a game without opponent scoring',
    rarity: 'epic' as const
  },
  
  // Social achievements
  team_player: {
    id: 'team_player',
    type: 'social' as const,
    name: 'Team Player',
    description: 'Play in 5 different teams',
    rarity: 'common' as const
  },
  social_butterfly: {
    id: 'social_butterfly',
    type: 'social' as const,
    name: 'Social Butterfly',
    description: 'Play against 50 different opponents',
    rarity: 'rare' as const
  }
};

export const playerRouter = router({
  // Get or create player profile
  getOrCreateProfile: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        let profile = await getDocument(`player_profile::${ctx.user.id}`) as PlayerProfile;
        
        if (!profile) {
          // Create new profile
          profile = {
            _type: 'player_profile',
            userId: ctx.user.id,
            displayName: ctx.user.name,
            stats: {
              totalGamesPlayed: 0,
              totalWins: 0,
              totalLosses: 0,
              winRate: 0,
              totalPoints: 0,
              averagePointsPerGame: 0,
              currentStreak: 0,
              longestStreak: 0,
              gameStats: {},
              tournamentHistory: []
            },
            achievements: [],
            preferences: {
              visibility: 'public',
              allowTeamInvites: true,
              showStats: true,
              emailNotifications: true,
              pushNotifications: true
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          await upsertDocument(`player_profile::${ctx.user.id}`, profile);
        }
        
        return profile;
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch player profile',
        });
      }
    }),

  // Update player profile
  updateProfile: protectedProcedure
    .input(z.object({
      displayName: z.string().min(1).max(50).optional(),
      bio: z.string().max(500).optional(),
      avatarUrl: z.string().url().optional(),
      nationality: z.string().optional(),
      favoriteGame: z.string().optional(),
      motto: z.string().max(100).optional(),
      socialLinks: z.object({
        instagram: z.string().optional(),
        twitter: z.string().optional(),
        tiktok: z.string().optional(),
        youtube: z.string().optional()
      }).optional(),
      preferences: z.object({
        visibility: z.enum(['public', 'team', 'private']).optional(),
        allowTeamInvites: z.boolean().optional(),
        showStats: z.boolean().optional(),
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional()
      }).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const profile = await getDocument(`player_profile::${ctx.user.id}`) as PlayerProfile;
        
        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Player profile not found',
          });
        }
        
        // Update profile fields
        if (input.displayName) profile.displayName = input.displayName;
        if (input.bio !== undefined) profile.bio = input.bio;
        if (input.avatarUrl !== undefined) profile.avatarUrl = input.avatarUrl;
        if (input.nationality !== undefined) profile.nationality = input.nationality;
        if (input.favoriteGame !== undefined) profile.favoriteGame = input.favoriteGame;
        if (input.motto !== undefined) profile.motto = input.motto;
        if (input.socialLinks) profile.socialLinks = { ...profile.socialLinks, ...input.socialLinks };
        if (input.preferences) profile.preferences = { ...profile.preferences, ...input.preferences };
        
        profile.updatedAt = new Date().toISOString();
        
        await upsertDocument(`player_profile::${ctx.user.id}`, profile);
        
        return profile;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update player profile',
        });
      }
    }),

  // Get public player profile
  getPublicProfile: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const profile = await getDocument(`player_profile::${input.userId}`) as PlayerProfile;
        
        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Player profile not found',
          });
        }
        
        // Check visibility settings
        if (profile.preferences.visibility === 'private') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'This profile is private',
          });
        }
        
        // Filter sensitive data based on visibility
        const publicProfile = {
          ...profile,
          preferences: undefined, // Don't expose preferences
          stats: profile.preferences.showStats ? profile.stats : undefined
        };
        
        return publicProfile;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch player profile',
        });
      }
    }),

  // Get player stats with detailed breakdown
  getDetailedStats: publicProcedure
    .input(z.object({
      userId: z.string(),
      timeframe: z.enum(['all', 'month', 'week']).optional()
    }))
    .query(async ({ input }) => {
      try {
        const profile = await getDocument(`player_profile::${input.userId}`) as PlayerProfile;
        
        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Player profile not found',
          });
        }
        
        // Check if stats are public
        if (profile.preferences.visibility === 'private' || !profile.preferences.showStats) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Player stats are not public',
          });
        }
        
        // Get all matches for the player
        const teamsResult = await query(
          `SELECT id FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND $1 IN memberIds`,
          { parameters: [input.userId] }
        );
        
        const teamIds = teamsResult.rows.map((row: Record<string, unknown>) => row.id as string);
        
        if (teamIds.length === 0) {
          return {
            ...profile.stats,
            recentPerformance: [],
            gameBreakdown: [],
            tournamentHistory: []
          };
        }
        
        // Get matches
        let dateFilter = '';
        if (input.timeframe === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateFilter = `AND m.endTime >= '${weekAgo.toISOString()}'`;
        } else if (input.timeframe === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          dateFilter = `AND m.endTime >= '${monthAgo.toISOString()}'`;
        }
        
        const matchesResult = await query(
          `SELECT m.*, e.name as eventName 
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m
           LEFT JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default e
           ON e.id = m.eventId
           WHERE m._type = 'match' 
           AND m.isComplete = true
           AND (m.teamA IN $1 OR m.teamB IN $1)
           ${dateFilter}
           ORDER BY m.endTime DESC`,
          { parameters: [teamIds] }
        );
        
        // Calculate performance metrics
        const matches = matchesResult.rows;
        const recentPerformance = matches.slice(0, 10).map((match: Record<string, unknown>) => {
          const playerTeamId = teamIds.find(id => id === match.teamA || id === match.teamB);
          const isTeamA = match.teamA === playerTeamId;
          const finalScore = match.finalScore as { a?: number; b?: number } | undefined;
          const teamScore = isTeamA ? finalScore?.a : finalScore?.b;
          const opponentScore = isTeamA ? finalScore?.b : finalScore?.a;
          
          return {
            matchId: match.id,
            eventName: match.eventName,
            date: match.endTime,
            result: (teamScore ?? 0) > (opponentScore ?? 0) ? 'W' : 'L',
            score: `${teamScore}-${opponentScore}`,
            points: teamScore
          };
        });
        
        // Game-specific breakdown
        const gameBreakdown: { [key: string]: GameSpecificStats } = {};
        matches.forEach((match: any) => {
          if (!match.eventName) return;
          
          if (!gameBreakdown[match.eventName]) {
            gameBreakdown[match.eventName] = {
              gamesPlayed: 0,
              wins: 0,
              losses: 0,
              averageScore: 0,
              bestScore: 0,
              lastPlayed: match.endTime
            };
          }
          
          const playerTeamId = teamIds.find(id => id === match.teamA || id === match.teamB);
          const isTeamA = match.teamA === playerTeamId;
          const finalScore = match.finalScore as { a?: number; b?: number } | undefined;
          const teamScore = isTeamA ? finalScore?.a : finalScore?.b;
          const opponentScore = isTeamA ? finalScore?.b : finalScore?.a;
          
          gameBreakdown[match.eventName].gamesPlayed++;
          if ((teamScore ?? 0) > (opponentScore ?? 0)) {
            gameBreakdown[match.eventName].wins++;
          } else {
            gameBreakdown[match.eventName].losses++;
          }
          gameBreakdown[match.eventName].bestScore = Math.max(gameBreakdown[match.eventName].bestScore, teamScore ?? 0);
          
          // Update last played
          if (new Date(match.endTime) > new Date(gameBreakdown[match.eventName].lastPlayed)) {
            gameBreakdown[match.eventName].lastPlayed = match.endTime;
          }
        });
        
        // Calculate averages
        Object.values(gameBreakdown).forEach(stats => {
          stats.averageScore = stats.gamesPlayed > 0 ? 
            matches
              .filter((m: any) => m.eventName === Object.keys(gameBreakdown).find(k => gameBreakdown[k] === stats))
              .reduce((sum: number, m: any) => {
                const playerTeamId = teamIds.find(id => id === m.teamA || id === m.teamB);
                const isTeamA = m.teamA === playerTeamId;
                return sum + (isTeamA ? m.finalScore?.a : m.finalScore?.b);
              }, 0) / stats.gamesPlayed : 0;
        });
        
        return {
          basicStats: profile.stats,
          recentPerformance,
          gameBreakdown,
          tournamentHistory: profile.stats.tournamentHistory,
          timeframe: input.timeframe || 'all'
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch player stats',
        });
      }
    }),

  // Search players
  searchPlayers: publicProcedure
    .input(z.object({
      query: z.string().min(2),
      limit: z.number().min(1).max(50).default(20)
    }))
    .query(async ({ input }) => {
      try {
        const result = await query(
          `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'player_profile' 
           AND (LOWER(displayName) LIKE LOWER($1) OR userId = $2)
           AND preferences.visibility != 'private'
           LIMIT $3`,
          { parameters: [`%${input.query}%`, input.query, input.limit] }
        );
        
        return result.rows.map((profile: PlayerProfile) => ({
          userId: profile.userId,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          nationality: profile.nationality,
          totalWins: profile.preferences.showStats ? profile.stats.totalWins : undefined,
          winRate: profile.preferences.showStats ? profile.stats.winRate : undefined
        }));
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search players',
        });
      }
    }),

  // Get achievements
  getAchievements: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const profile = await getDocument(`player_profile::${input.userId}`) as PlayerProfile;
        
        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Player profile not found',
          });
        }
        
        // Get all possible achievements with unlock status
        const allAchievements = Object.values(ACHIEVEMENTS).map(achievement => {
          const unlocked = profile.achievements.find(a => a.id === achievement.id);
          return {
            ...achievement,
            unlocked: !!unlocked,
            unlockedAt: unlocked?.unlockedAt
          };
        });
        
        // Sort by rarity and unlock status
        const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
        allAchievements.sort((a, b) => {
          if (a.unlocked !== b.unlocked) return b.unlocked ? 1 : -1;
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        });
        
        return {
          achievements: allAchievements,
          totalUnlocked: profile.achievements.length,
          totalPossible: Object.keys(ACHIEVEMENTS).length,
          completionPercentage: (profile.achievements.length / Object.keys(ACHIEVEMENTS).length) * 100
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch achievements',
        });
      }
    }),

  // Check and award achievements (internal use)
  checkAchievements: protectedProcedure
    .input(z.object({
      userId: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const profile = await getDocument(`player_profile::${input.userId}`) as PlayerProfile;
        
        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Player profile not found',
          });
        }
        
        const newAchievements: Achievement[] = [];
        const existingIds = profile.achievements.map(a => a.id);
        
        // Check milestone achievements
        if (!existingIds.includes('first_win') && profile.stats.totalWins >= 1) {
          newAchievements.push({
            ...ACHIEVEMENTS.first_win,
            unlockedAt: new Date().toISOString()
          });
        }
        
        if (!existingIds.includes('ten_wins') && profile.stats.totalWins >= 10) {
          newAchievements.push({
            ...ACHIEVEMENTS.ten_wins,
            unlockedAt: new Date().toISOString()
          });
        }
        
        if (!existingIds.includes('fifty_wins') && profile.stats.totalWins >= 50) {
          newAchievements.push({
            ...ACHIEVEMENTS.fifty_wins,
            unlockedAt: new Date().toISOString()
          });
        }
        
        if (!existingIds.includes('hundred_wins') && profile.stats.totalWins >= 100) {
          newAchievements.push({
            ...ACHIEVEMENTS.hundred_wins,
            unlockedAt: new Date().toISOString()
          });
        }
        
        // Check tournament achievements
        const tournamentWins = profile.stats.tournamentHistory.filter(t => t.placement === 1).length;
        const podiumFinishes = profile.stats.tournamentHistory.filter(t => t.placement <= 3).length;
        
        if (!existingIds.includes('tournament_winner') && tournamentWins >= 1) {
          newAchievements.push({
            ...ACHIEVEMENTS.tournament_winner,
            unlockedAt: new Date().toISOString()
          });
        }
        
        if (!existingIds.includes('podium_finish') && podiumFinishes >= 1) {
          newAchievements.push({
            ...ACHIEVEMENTS.podium_finish,
            unlockedAt: new Date().toISOString()
          });
        }
        
        // Add new achievements
        if (newAchievements.length > 0) {
          profile.achievements.push(...newAchievements);
          profile.updatedAt = new Date().toISOString();
          await upsertDocument(`player_profile::${input.userId}`, profile);
        }
        
        return {
          newAchievements,
          totalAchievements: profile.achievements.length
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check achievements',
        });
      }
    }),

  // Get player comparison
  compareProfiles: publicProcedure
    .input(z.object({
      userId1: z.string(),
      userId2: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const [profile1, profile2] = await Promise.all([
          getDocument(`player_profile::${input.userId1}`) as Promise<PlayerProfile>,
          getDocument(`player_profile::${input.userId2}`) as Promise<PlayerProfile>
        ]);
        
        if (!profile1 || !profile2) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'One or both player profiles not found',
          });
        }
        
        // Check visibility
        if (profile1.preferences.visibility === 'private' || profile2.preferences.visibility === 'private') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'One or both profiles are private',
          });
        }
        
        // Get head-to-head stats
        const teamsResult1 = await query(
          `SELECT id FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND $1 IN memberIds`,
          { parameters: [input.userId1] }
        );
        
        const teamsResult2 = await query(
          `SELECT id FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND $1 IN memberIds`,
          { parameters: [input.userId2] }
        );
        
        const teamIds1 = teamsResult1.rows.map((row: any) => row.id);
        const teamIds2 = teamsResult2.rows.map((row: any) => row.id);
        
        // Find head-to-head matches
        const h2hResult = await query(
          `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'match' 
           AND isComplete = true
           AND ((teamA IN $1 AND teamB IN $2) OR (teamA IN $2 AND teamB IN $1))
           ORDER BY endTime DESC`,
          { parameters: [teamIds1, teamIds2] }
        );
        
        let player1Wins = 0;
        let player2Wins = 0;
        
        h2hResult.rows.forEach((match: any) => {
          const isPlayer1TeamA = teamIds1.includes(match.teamA);
          const player1Score = isPlayer1TeamA ? match.finalScore?.a : match.finalScore?.b;
          const player2Score = isPlayer1TeamA ? match.finalScore?.b : match.finalScore?.a;
          
          if ((player1Score ?? 0) > (player2Score ?? 0)) {
            player1Wins++;
          } else {
            player2Wins++;
          }
        });
        
        return {
          player1: {
            profile: {
              displayName: profile1.displayName,
              avatarUrl: profile1.avatarUrl,
              nationality: profile1.nationality
            },
            stats: profile1.preferences.showStats ? profile1.stats : null,
            achievements: profile1.achievements.length
          },
          player2: {
            profile: {
              displayName: profile2.displayName,
              avatarUrl: profile2.avatarUrl,
              nationality: profile2.nationality
            },
            stats: profile2.preferences.showStats ? profile2.stats : null,
            achievements: profile2.achievements.length
          },
          headToHead: {
            totalMatches: h2hResult.rows.length,
            player1Wins,
            player2Wins,
            recentMatches: h2hResult.rows.slice(0, 5)
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to compare profiles',
        });
      }
    })
});