import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { AchievementEngine, ACHIEVEMENTS, getAchievementsByCategory } from '../../services/achievement-engine';
import { XPSystem, XP_CONFIG } from '../../services/xp-system';
import { VotingSystem, VOTE_CATEGORIES, getActiveVoteCategories } from '../../services/voting-system';

// Initialize services (would use actual DB connection)
const achievementEngine = new AchievementEngine(null);
const xpSystem = new XPSystem(null);
const votingSystem = new VotingSystem(null);

export const gamificationRouter = router({
  // Achievement routes
  getPlayerAchievements: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query(async () => {
      // This would fetch from database
      return {
        achievements: [],
        progress: [],
        unlockedCount: 0,
        totalCount: Object.keys(ACHIEVEMENTS).length
      };
    }),

  getAllAchievements: publicProcedure
    .query(async () => {
      return {
        achievements: Object.values(ACHIEVEMENTS),
        categories: ['performance', 'skill', 'social', 'fun']
      };
    }),

  getAchievementsByCategory: publicProcedure
    .input(z.object({
      category: z.enum(['performance', 'skill', 'social', 'fun', 'milestone', 'tournament', 'special'])
    }))
    .query(async ({ input }) => {
      return getAchievementsByCategory(input.category);
    }),

  checkAchievements: publicProcedure
    .input(z.object({
      userId: z.string(),
      context: z.object({
        stats: z.any().optional(),
        currentStreak: z.number().optional(),
        gameType: z.string().optional(),
        accuracy: z.number().optional(),
        matchResult: z.any().optional(),
        tournamentId: z.string().optional()
      })
    }))
    .mutation(async ({ input }) => {
      return await achievementEngine.checkAchievements(input.userId, input.context);
    }),

  updateAchievementProgress: publicProcedure
    .input(z.object({
      userId: z.string(),
      updates: z.array(z.object({
        achievementId: z.string(),
        increment: z.number()
      }))
    }))
    .mutation(async ({ input }) => {
      await achievementEngine.updateProgress(input.userId, input.updates);
      return { success: true };
    }),

  // XP and Leveling routes
  getPlayerXP: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query(async ({ input }) => {
      return await xpSystem.getPlayerXP(input.userId);
    }),

  awardXP: publicProcedure
    .input(z.object({
      userId: z.string(),
      amount: z.number(),
      reason: z.enum([
        'game_participation',
        'game_win', 
        'tournament_win',
        'achievement_unlock',
        'social_action',
        'daily_bonus',
        'streak_bonus',
        'special_event'
      ]),
      context: z.object({
        tournamentId: z.string().optional(),
        matchId: z.string().optional(),
        achievementId: z.string().optional(),
        winStreak: z.number().optional(),
        isUnderdog: z.boolean().optional(),
        isPerfectGame: z.boolean().optional(),
        isComebackWin: z.boolean().optional()
      }).optional()
    }))
    .mutation(async ({ input }) => {
      return await xpSystem.awardXP(
        input.userId,
        input.amount,
        input.reason,
        input.context
      );
    }),

  getXPLeaderboard: publicProcedure
    .input(z.object({
      type: z.enum(['all_time', 'season', 'month']).default('all_time'),
      limit: z.number().default(100)
    }))
    .query(async ({ input }) => {
      return await xpSystem.getXPLeaderboard(input.type, input.limit);
    }),

  getXPConfig: publicProcedure
    .query(() => {
      return XP_CONFIG;
    }),

  // Voting routes
  startTournamentVoting: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
      categories: z.array(z.string()).optional()
    }))
    .mutation(async ({ input }) => {
      return await votingSystem.startVoting(input.tournamentId, input.categories);
    }),

  submitVote: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
      categoryId: z.string(),
      voterId: z.string(),
      nomineeId: z.string(),
      nomineeType: z.enum(['player', 'team'])
    }))
    .mutation(async ({ input }) => {
      return await votingSystem.submitVote(
        input.tournamentId,
        input.categoryId,
        input.voterId,
        input.nomineeId,
        input.nomineeType
      );
    }),

  getVotingSession: publicProcedure
    .input(z.object({
      tournamentId: z.string()
    }))
    .query(async ({ input }) => {
      return await votingSystem.getVotingStatus(input.tournamentId);
    }),

  getVotingResults: publicProcedure
    .input(z.object({
      tournamentId: z.string()
    }))
    .query(async ({ input }) => {
      return await votingSystem.getVotingResults(input.tournamentId);
    }),

  closeVoting: publicProcedure
    .input(z.object({
      tournamentId: z.string()
    }))
    .mutation(async ({ input }) => {
      return await votingSystem.closeVoting(input.tournamentId);
    }),

  getVoteCategories: publicProcedure
    .query(() => {
      return {
        categories: Object.values(VOTE_CATEGORIES),
        active: getActiveVoteCategories()
      };
    }),

  // Leaderboard and stats routes
  getTournamentLeaderboard: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
      type: z.enum(['points', 'wins', 'achievements', 'xp']).default('points')
    }))
    .query(async ({ }) => {
      // This would fetch and calculate leaderboard data
      return {
        rankings: [],
        lastUpdated: new Date().toISOString()
      };
    }),

  getPlayerStats: publicProcedure
    .input(z.object({
      userId: z.string(),
      timeframe: z.enum(['all', 'season', 'month']).default('all')
    }))
    .query(async ({ }) => {
      // This would aggregate player statistics
      return {
        xp: null,
        achievements: [],
        gameStats: {},
        socialStats: {},
        recentActivity: []
      };
    }),

  getGamificationSummary: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query(async ({ input }) => {
      // Get comprehensive gamification data for a player
      const [xpData, achievements, recentVotes] = await Promise.all([
        xpSystem.getPlayerXP(input.userId),
        // achievementEngine.getPlayerAchievements(input.userId),
        // votingSystem.getRecentVotes(input.userId)
        [], // Placeholder
        [] // Placeholder
      ]);

      return {
        xp: xpData,
        achievements,
        recentVotes,
        nextLevelRewards: [], // Would calculate based on current level
        suggestedAchievements: [], // Achievements close to unlocking
        socialRank: null // Position in social leaderboards
      };
    }),

  // Reward and customization routes
  getPlayerRewards: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query(async ({ }) => {
      // Fetch unlocked customizations, themes, etc.
      return {
        badges: [],
        titles: [],
        themes: [],
        avatarBorders: [],
        emotes: [],
        soundPacks: []
      };
    }),

  claimReward: publicProcedure
    .input(z.object({
      userId: z.string(),
      rewardId: z.string(),
      rewardType: z.enum(['badge', 'title', 'theme', 'avatar_border', 'emote', 'sound_pack'])
    }))
    .mutation(async ({ }) => {
      // Mark reward as claimed/equipped
      return { success: true, message: 'Reward claimed successfully' };
    }),

  // Social features
  getPlayerProfile: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query(async ({ }) => {
      // Get enhanced player profile with gamification data
      return {
        basic: {}, // Basic profile info
        xp: null,
        level: 1,
        achievements: [],
        badges: [],
        currentTitle: null,
        stats: {},
        recentActivity: []
      };
    }),

  shareAchievement: publicProcedure
    .input(z.object({
      userId: z.string(),
      achievementId: z.string(),
      platform: z.enum(['twitter', 'facebook', 'instagram', 'copy_link'])
    }))
    .mutation(async ({ input }) => {
      // Generate shareable content for achievement
      const achievement = ACHIEVEMENTS[input.achievementId];
      if (!achievement) {
        throw new Error('Achievement not found');
      }

      const shareContent = {
        text: `Just unlocked "${achievement.name}" in Beer Olympics! ${achievement.description}`,
        url: `https://beer-olympics.app/achievement/${input.achievementId}`,
        hashtags: ['BeerOlympics', 'Achievement', 'Gaming']
      };

      return shareContent;
    }),

  // Analytics and insights
  getGamificationInsights: publicProcedure
    .input(z.object({
      tournamentId: z.string().optional(),
      timeframe: z.enum(['week', 'month', 'season', 'all']).default('all')
    }))
    .query(async ({ }) => {
      // Generate insights about player engagement, popular achievements, etc.
      return {
        totalPlayers: 0,
        averageLevel: 0,
        mostPopularAchievements: [],
        xpDistribution: {},
        engagementMetrics: {},
        votingParticipation: 0
      };
    })
});

export type GamificationRouter = typeof gamificationRouter;