import type { PlayerStats } from '../types/player-stats';
import { z } from 'zod';
import type { Achievement, PlayerProfile } from '../types';

// Achievement definition types
export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  name: string;
  description: string;
  iconUrl?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  criteria: AchievementCriteria;
  hidden?: boolean; // Hidden until unlocked
  prerequisiteIds?: string[]; // Must unlock these first
}

export type AchievementCategory = 
  | 'performance'
  | 'skill'
  | 'social'
  | 'fun'
  | 'milestone'
  | 'tournament'
  | 'special';

export interface AchievementCriteria {
  type: CriteriaType;
  value: number;
  gameType?: string; // For game-specific achievements
  comparison: 'eq' | 'gte' | 'lte' | 'gt' | 'lt';
  timeframe?: 'all' | 'tournament' | 'season' | 'month';
}

export type CriteriaType =
  | 'games_won'
  | 'games_played'
  | 'win_streak'
  | 'tournaments_won'
  | 'perfect_games'
  | 'comeback_wins'
  | 'accuracy_percentage'
  | 'speed_record'
  | 'teammates_played_with'
  | 'high_fives_given'
  | 'sportsmanship_rating'
  | 'highlights_uploaded'
  | 'friends_invited'
  | 'costume_votes'
  | 'trash_talks_liked'
  | 'losses_with_spirit'
  | 'consecutive_participations'
  | 'overtime_wins'
  | 'different_game_wins';

// Achievement progress tracking
export interface AchievementProgress {
  achievementId: string;
  userId: string;
  currentValue: number;
  targetValue: number;
  startedAt: string;
  lastUpdatedAt: string;
}

// Achievement definitions database
export const ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  // Performance Achievements
  first_blood: {
    id: 'first_blood',
    category: 'performance',
    name: 'First Blood',
    description: 'Win your first game',
    rarity: 'common',
    xpReward: 10,
    criteria: {
      type: 'games_won',
      value: 1,
      comparison: 'gte',
      timeframe: 'all'
    }
  },
  hat_trick: {
    id: 'hat_trick',
    category: 'performance',
    name: 'Hat Trick',
    description: 'Win 3 games in a row',
    rarity: 'rare',
    xpReward: 30,
    criteria: {
      type: 'win_streak',
      value: 3,
      comparison: 'gte',
      timeframe: 'tournament'
    }
  },
  comeback_kid: {
    id: 'comeback_kid',
    category: 'performance',
    name: 'Comeback Kid',
    description: 'Win after being down 5+ points',
    rarity: 'epic',
    xpReward: 50,
    criteria: {
      type: 'comeback_wins',
      value: 1,
      comparison: 'gte',
      timeframe: 'all'
    }
  },
  perfect_game: {
    id: 'perfect_game',
    category: 'performance',
    name: 'Perfect Game',
    description: 'Win without opponent scoring',
    rarity: 'legendary',
    xpReward: 100,
    criteria: {
      type: 'perfect_games',
      value: 1,
      comparison: 'gte',
      timeframe: 'all'
    }
  },
  dynasty: {
    id: 'dynasty',
    category: 'performance',
    name: 'Dynasty',
    description: 'Win 3 tournaments',
    rarity: 'legendary',
    xpReward: 200,
    criteria: {
      type: 'tournaments_won',
      value: 3,
      comparison: 'gte',
      timeframe: 'all'
    }
  },

  // Skill Achievements
  sharpshooter: {
    id: 'sharpshooter',
    category: 'skill',
    name: 'Sharpshooter',
    description: '90% accuracy in Beer Pong',
    rarity: 'epic',
    xpReward: 75,
    criteria: {
      type: 'accuracy_percentage',
      value: 90,
      comparison: 'gte',
      gameType: 'beer_pong',
      timeframe: 'tournament'
    }
  },
  speed_demon: {
    id: 'speed_demon',
    category: 'skill',
    name: 'Speed Demon',
    description: 'Complete Flip Cup in under 10 seconds',
    rarity: 'rare',
    xpReward: 40,
    criteria: {
      type: 'speed_record',
      value: 10,
      comparison: 'lte',
      gameType: 'flip_cup',
      timeframe: 'all'
    }
  },
  iron_liver: {
    id: 'iron_liver',
    category: 'skill',
    name: 'Iron Liver',
    description: 'Play 10+ games in one tournament',
    rarity: 'epic',
    xpReward: 60,
    criteria: {
      type: 'games_played',
      value: 10,
      comparison: 'gte',
      timeframe: 'tournament'
    }
  },
  clutch_player: {
    id: 'clutch_player',
    category: 'skill',
    name: 'Clutch Player',
    description: 'Win 5 games in overtime/sudden death',
    rarity: 'legendary',
    xpReward: 100,
    criteria: {
      type: 'overtime_wins',
      value: 5,
      comparison: 'gte',
      timeframe: 'all'
    }
  },
  swiss_army_knife: {
    id: 'swiss_army_knife',
    category: 'skill',
    name: 'Swiss Army Knife',
    description: 'Win in 5 different event types',
    rarity: 'epic',
    xpReward: 80,
    criteria: {
      type: 'different_game_wins',
      value: 5,
      comparison: 'gte',
      timeframe: 'all'
    }
  },

  // Social Achievements
  team_player: {
    id: 'team_player',
    category: 'social',
    name: 'Team Player',
    description: 'Play with 10 different teammates',
    rarity: 'rare',
    xpReward: 35,
    criteria: {
      type: 'teammates_played_with',
      value: 10,
      comparison: 'gte',
      timeframe: 'all'
    }
  },
  social_butterfly: {
    id: 'social_butterfly',
    category: 'social',
    name: 'Social Butterfly',
    description: 'High-five 20 opponents',
    rarity: 'common',
    xpReward: 20,
    criteria: {
      type: 'high_fives_given',
      value: 20,
      comparison: 'gte',
      timeframe: 'all'
    }
  },
  good_sport: {
    id: 'good_sport',
    category: 'social',
    name: 'Good Sport',
    description: 'Maintain 5-star sportsmanship rating',
    rarity: 'epic',
    xpReward: 70,
    criteria: {
      type: 'sportsmanship_rating',
      value: 5,
      comparison: 'eq',
      timeframe: 'season'
    }
  },
  hype_master: {
    id: 'hype_master',
    category: 'social',
    name: 'Hype Master',
    description: 'Upload 10 game highlights',
    rarity: 'rare',
    xpReward: 45,
    criteria: {
      type: 'highlights_uploaded',
      value: 10,
      comparison: 'gte',
      timeframe: 'all'
    }
  },
  recruiter: {
    id: 'recruiter',
    category: 'social',
    name: 'Recruiter',
    description: 'Invite 5 friends who join',
    rarity: 'epic',
    xpReward: 90,
    criteria: {
      type: 'friends_invited',
      value: 5,
      comparison: 'gte',
      timeframe: 'all'
    }
  },

  // Fun Achievements
  butterfingers: {
    id: 'butterfingers',
    category: 'fun',
    name: 'Butterfingers',
    description: 'Drop the ball/cup 3 times in one game',
    rarity: 'common',
    xpReward: 15,
    hidden: true,
    criteria: {
      type: 'games_played', // Will need custom tracking
      value: 1,
      comparison: 'gte',
      timeframe: 'tournament'
    }
  },
  participation_trophy: {
    id: 'participation_trophy',
    category: 'fun',
    name: 'Participation Trophy',
    description: 'Lose every game but maintain positive spirit',
    rarity: 'rare',
    xpReward: 50,
    criteria: {
      type: 'losses_with_spirit',
      value: 1,
      comparison: 'gte',
      timeframe: 'tournament'
    }
  },
  fashion_police: {
    id: 'fashion_police',
    category: 'fun',
    name: 'Fashion Police',
    description: 'Win best team costume vote',
    rarity: 'epic',
    xpReward: 60,
    criteria: {
      type: 'costume_votes',
      value: 1,
      comparison: 'gte',
      timeframe: 'tournament'
    }
  },
  trash_talk_champion: {
    id: 'trash_talk_champion',
    category: 'fun',
    name: 'Trash Talk Champion',
    description: 'Have most liked trash talk',
    rarity: 'rare',
    xpReward: 40,
    criteria: {
      type: 'trash_talks_liked',
      value: 10,
      comparison: 'gte',
      timeframe: 'season'
    }
  },
  party_animal: {
    id: 'party_animal',
    category: 'fun',
    name: 'Party Animal',
    description: 'Be the last team at 3 consecutive afterparties',
    rarity: 'legendary',
    xpReward: 100,
    hidden: true,
    criteria: {
      type: 'consecutive_participations',
      value: 3,
      comparison: 'gte',
      timeframe: 'all'
    }
  }
};

// Achievement Engine class
export class AchievementEngine {
  private progressCache: Map<string, AchievementProgress[]> = new Map();

  constructor(private db: any) {} // Will use actual DB connection

  /**
   * Check if a player has earned any new achievements
   */
  async checkAchievements(
    userId: string,
    context: AchievementContext
  ): Promise<UnlockedAchievement[]> {
    const unlockedAchievements: UnlockedAchievement[] = [];
    const playerProfile = await this.getPlayerProfile(userId);
    const currentAchievements = new Set(playerProfile.achievements.map(a => a.id));

    for (const [id, definition] of Object.entries(ACHIEVEMENTS)) {
      // Skip if already unlocked
      if (currentAchievements.has(id)) continue;

      // Check prerequisites
      if (definition.prerequisiteIds?.length) {
        const hasAllPrereqs = definition.prerequisiteIds.every(
          prereqId => currentAchievements.has(prereqId)
        );
        if (!hasAllPrereqs) continue;
      }

      // Check if criteria is met
      const isMet = await this.checkCriteria(
        userId,
        definition.criteria,
        context
      );

      if (isMet) {
        const unlocked = await this.unlockAchievement(userId, definition);
        unlockedAchievements.push(unlocked);
        currentAchievements.add(id); // Update set for prerequisite checking
      }
    }

    return unlockedAchievements;
  }

  /**
   * Check if specific criteria is met
   */
  private async checkCriteria(
    userId: string,
    criteria: AchievementCriteria,
    context: AchievementContext
  ): Promise<boolean> {
    const value = await this.getCriteriaValue(userId, criteria, context);
    
    switch (criteria.comparison) {
      case 'eq': return value === criteria.value;
      case 'gte': return value >= criteria.value;
      case 'lte': return value <= criteria.value;
      case 'gt': return value > criteria.value;
      case 'lt': return value < criteria.value;
      default: return false;
    }
  }

  /**
   * Get the current value for a criteria type
   */
  private async getCriteriaValue(
    userId: string,
    criteria: AchievementCriteria,
    context: AchievementContext
  ): Promise<number> {
    // This would query the database for actual stats
    // For now, returning sample logic
    switch (criteria.type) {
      case 'games_won':
        return context.stats?.totalWins || 0;
      case 'win_streak':
        return context.currentStreak || 0;
      case 'tournaments_won':
        return context.stats?.tournamentHistory?.filter(t => t.placement === 1).length || 0;
      case 'games_played':
        return context.stats?.totalGamesPlayed || 0;
      case 'accuracy_percentage':
        if (criteria.gameType && context.gameType === criteria.gameType) {
          return context.accuracy || 0;
        }
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Unlock an achievement for a player
   */
  private async unlockAchievement(
    userId: string,
    definition: AchievementDefinition
  ): Promise<UnlockedAchievement> {
    const achievement: Achievement = {
      id: definition.id,
      type: definition.category === 'performance' ? 'milestone' : definition.category as any,
      name: definition.name,
      description: definition.description,
      iconUrl: definition.iconUrl,
      unlockedAt: new Date().toISOString(),
      rarity: definition.rarity
    };

    // Save to database
    await this.saveAchievement(userId, achievement);

    // Award XP
    await this.awardXP(userId, definition.xpReward);

    return {
      achievement,
      xpAwarded: definition.xpReward,
      isFirstTime: await this.isFirstTimeGlobally(definition.id)
    };
  }

  /**
   * Update achievement progress
   */
  async updateProgress(
    userId: string,
    updates: ProgressUpdate[]
  ): Promise<void> {
    for (const update of updates) {
      const progress = await this.getOrCreateProgress(userId, update.achievementId);
      progress.currentValue = Math.min(
        progress.currentValue + update.increment,
        progress.targetValue
      );
      progress.lastUpdatedAt = new Date().toISOString();
      
      await this.saveProgress(progress);
    }
  }

  /**
   * Get achievement progress for a player
   */
  async getPlayerProgress(userId: string): Promise<AchievementProgress[]> {
    // Implementation would fetch from database
    return this.progressCache.get(userId) || [];
  }

  // Database helper methods (to be implemented with actual DB)
  private async getPlayerProfile(userId: string): Promise<PlayerProfile> {
    // Fetch from database
    throw new Error('Not implemented');
  }

  private async saveAchievement(userId: string, achievement: Achievement): Promise<void> {
    // Save to database
  }

  private async awardXP(userId: string, xp: number): Promise<void> {
    // Update player XP in database
  }

  private async isFirstTimeGlobally(achievementId: string): Promise<boolean> {
    // Check if anyone else has this achievement
    return false;
  }

  private async getOrCreateProgress(
    userId: string,
    achievementId: string
  ): Promise<AchievementProgress> {
    // Fetch or create progress record
    throw new Error('Not implemented');
  }

  private async saveProgress(progress: AchievementProgress): Promise<void> {
    // Save progress to database
  }
}

// Supporting types
export interface AchievementContext {
  stats?: PlayerStats;
  currentStreak?: number;
  gameType?: string;
  accuracy?: number;
  matchResult?: any;
  tournamentId?: string;
}

export interface UnlockedAchievement {
  achievement: Achievement;
  xpAwarded: number;
  isFirstTime: boolean;
}

export interface ProgressUpdate {
  achievementId: string;
  increment: number;
}

// Export a function to get achievements by category
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
}

// Export a function to get achievement definition
export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS[id];
}