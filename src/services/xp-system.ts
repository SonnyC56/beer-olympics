import { z } from 'zod';

// XP System Configuration
export const XP_CONFIG = {
  // Base XP rewards
  GAME_PARTICIPATION: 10,
  GAME_WIN: 25,
  TOURNAMENT_WIN: 100,
  ACHIEVEMENT_UNLOCK: { min: 5, max: 50 }, // Based on rarity
  
  // Social actions
  HIGH_FIVE: 1,
  UPLOAD_HIGHLIGHT: 5,
  RECEIVE_SPORTSMANSHIP_VOTE: 3,
  TEAM_INVITE_ACCEPTED: 10,
  
  // Bonus multipliers
  STREAK_MULTIPLIER: 0.1, // 10% per win in streak
  UNDERDOG_BONUS: 1.5, // 50% bonus for beating higher-ranked team
  PERFECT_GAME_BONUS: 2.0, // 100% bonus
  COMEBACK_BONUS: 1.3, // 30% bonus
  
  // Level thresholds
  LEVELS: [
    { level: 1, name: 'Rookie', minXP: 0, maxXP: 100 },
    { level: 2, name: 'Amateur', minXP: 101, maxXP: 250 },
    { level: 3, name: 'Semi-Pro', minXP: 251, maxXP: 500 },
    { level: 4, name: 'Pro', minXP: 501, maxXP: 1000 },
    { level: 5, name: 'All-Star', minXP: 1001, maxXP: 2000 },
    { level: 6, name: 'Champion', minXP: 2001, maxXP: 3500 },
    { level: 7, name: 'Elite', minXP: 3501, maxXP: 5000 },
    { level: 8, name: 'Master', minXP: 5001, maxXP: 7500 },
    { level: 9, name: 'Grandmaster', minXP: 7501, maxXP: 10000 },
    { level: 10, name: 'Legend', minXP: 10001, maxXP: null }
  ]
};

// Player XP and Level data
export interface PlayerXP {
  _type: 'player_xp';
  userId: string;
  currentXP: number;
  totalXP: number;
  level: number;
  levelName: string;
  nextLevelXP: number | null;
  xpToNextLevel: number | null;
  levelProgress: number; // Percentage 0-100
  lastXPGain: XPGain | null;
  xpHistory: XPGain[];
  seasonXP: number; // XP earned this season
  monthlyXP: number; // XP earned this month
  updatedAt: string;
}

export interface XPGain {
  amount: number;
  reason: XPReason;
  timestamp: string;
  tournamentId?: string;
  matchId?: string;
  achievementId?: string;
  multipliers?: XPMultiplier[];
}

export type XPReason = 
  | 'game_participation'
  | 'game_win'
  | 'tournament_win'
  | 'achievement_unlock'
  | 'social_action'
  | 'daily_bonus'
  | 'streak_bonus'
  | 'special_event';

export interface XPMultiplier {
  type: 'streak' | 'underdog' | 'perfect' | 'comeback' | 'event';
  value: number;
  description: string;
}

// Level rewards and unlocks
export interface LevelReward {
  level: number;
  rewards: Reward[];
}

export interface Reward {
  type: RewardType;
  value: string | number;
  name: string;
  description: string;
  imageUrl?: string;
}

export type RewardType = 
  | 'badge'
  | 'title'
  | 'avatar_border'
  | 'theme'
  | 'sound_pack'
  | 'emote'
  | 'tournament_slot'
  | 'customization';

export const LEVEL_REWARDS: LevelReward[] = [
  {
    level: 1,
    rewards: [
      {
        type: 'badge',
        value: 'rookie_badge',
        name: 'Rookie Badge',
        description: 'Welcome to Beer Olympics!'
      },
      {
        type: 'avatar_border',
        value: 'basic_border',
        name: 'Basic Border',
        description: 'A simple border for your avatar'
      }
    ]
  },
  {
    level: 2,
    rewards: [
      {
        type: 'title',
        value: 'The Newcomer',
        name: 'The Newcomer',
        description: 'Display your amateur status with pride'
      },
      {
        type: 'emote',
        value: 'cheers',
        name: 'Cheers Emote',
        description: 'Celebrate with your opponents'
      }
    ]
  },
  {
    level: 3,
    rewards: [
      {
        type: 'theme',
        value: 'bronze_theme',
        name: 'Bronze Theme',
        description: 'Unlock bronze UI accents'
      },
      {
        type: 'customization',
        value: 'team_banner_1',
        name: 'Team Banner Style',
        description: 'New banner design for your team'
      }
    ]
  },
  {
    level: 4,
    rewards: [
      {
        type: 'badge',
        value: 'pro_badge',
        name: 'Pro Badge',
        description: 'You\'re officially a pro!'
      },
      {
        type: 'sound_pack',
        value: 'pro_sounds',
        name: 'Pro Sound Pack',
        description: 'Enhanced victory sounds'
      }
    ]
  },
  {
    level: 5,
    rewards: [
      {
        type: 'title',
        value: 'The All-Star',
        name: 'The All-Star',
        description: 'Show off your elite status'
      },
      {
        type: 'avatar_border',
        value: 'animated_border',
        name: 'Animated Border',
        description: 'Animated effects for your avatar'
      },
      {
        type: 'tournament_slot',
        value: 1,
        name: 'Extra Tournament Slot',
        description: 'Create one additional tournament'
      }
    ]
  },
  {
    level: 10,
    rewards: [
      {
        type: 'badge',
        value: 'legend_badge',
        name: 'Legend Badge',
        description: 'The ultimate achievement'
      },
      {
        type: 'title',
        value: 'The Legend',
        name: 'The Legend',
        description: 'A title reserved for the best'
      },
      {
        type: 'theme',
        value: 'legendary_theme',
        name: 'Legendary Theme',
        description: 'Exclusive legendary UI theme with animations'
      },
      {
        type: 'customization',
        value: 'hall_of_fame_entry',
        name: 'Hall of Fame Entry',
        description: 'Permanent entry in the Beer Olympics Hall of Fame'
      }
    ]
  }
];

// XP System Manager
export class XPSystem {
  constructor(private db: any) {} // Will use actual DB connection

  /**
   * Award XP to a player
   */
  async awardXP(
    userId: string,
    amount: number,
    reason: XPReason,
    context?: XPContext
  ): Promise<XPAwardResult> {
    const playerXP = await this.getOrCreatePlayerXP(userId);
    const previousLevel = playerXP.level;
    
    // Calculate multipliers
    const multipliers = this.calculateMultipliers(context);
    const totalMultiplier = multipliers.reduce((acc, m) => acc * m.value, 1);
    const finalAmount = Math.round(amount * totalMultiplier);
    
    // Create XP gain record
    const xpGain: XPGain = {
      amount: finalAmount,
      reason,
      timestamp: new Date().toISOString(),
      tournamentId: context?.tournamentId,
      matchId: context?.matchId,
      achievementId: context?.achievementId,
      multipliers: multipliers.length > 0 ? multipliers : undefined
    };
    
    // Update player XP
    playerXP.currentXP += finalAmount;
    playerXP.totalXP += finalAmount;
    playerXP.seasonXP += finalAmount;
    playerXP.monthlyXP += finalAmount;
    playerXP.lastXPGain = xpGain;
    playerXP.xpHistory.push(xpGain);
    
    // Check for level up
    const newLevel = this.calculateLevel(playerXP.totalXP);
    const leveledUp = newLevel.level > previousLevel;
    
    if (leveledUp) {
      playerXP.level = newLevel.level;
      playerXP.levelName = newLevel.name;
    }
    
    // Update level progress
    playerXP.nextLevelXP = newLevel.nextLevelXP;
    playerXP.xpToNextLevel = newLevel.xpToNextLevel;
    playerXP.levelProgress = newLevel.progress;
    playerXP.updatedAt = new Date().toISOString();
    
    // Save to database
    await this.savePlayerXP(playerXP);
    
    return {
      xpAwarded: finalAmount,
      totalXP: playerXP.totalXP,
      currentLevel: playerXP.level,
      levelName: playerXP.levelName,
      leveledUp,
      newRewards: leveledUp ? this.getRewardsForLevel(playerXP.level) : [],
      multipliers
    };
  }

  /**
   * Calculate multipliers based on context
   */
  private calculateMultipliers(context?: XPContext): XPMultiplier[] {
    const multipliers: XPMultiplier[] = [];
    
    if (!context) return multipliers;
    
    if (context.winStreak && context.winStreak > 1) {
      multipliers.push({
        type: 'streak',
        value: 1 + (XP_CONFIG.STREAK_MULTIPLIER * context.winStreak),
        description: `${context.winStreak} win streak`
      });
    }
    
    if (context.isUnderdog) {
      multipliers.push({
        type: 'underdog',
        value: XP_CONFIG.UNDERDOG_BONUS,
        description: 'Underdog victory'
      });
    }
    
    if (context.isPerfectGame) {
      multipliers.push({
        type: 'perfect',
        value: XP_CONFIG.PERFECT_GAME_BONUS,
        description: 'Perfect game'
      });
    }
    
    if (context.isComebackWin) {
      multipliers.push({
        type: 'comeback',
        value: XP_CONFIG.COMEBACK_BONUS,
        description: 'Comeback victory'
      });
    }
    
    return multipliers;
  }

  /**
   * Calculate level from total XP
   */
  private calculateLevel(totalXP: number): LevelInfo {
    let currentLevel = XP_CONFIG.LEVELS[0];
    let nextLevel = XP_CONFIG.LEVELS[1];
    
    for (let i = 0; i < XP_CONFIG.LEVELS.length; i++) {
      const level = XP_CONFIG.LEVELS[i];
      if (totalXP >= level.minXP && (level.maxXP === null || totalXP <= level.maxXP)) {
        currentLevel = level;
        nextLevel = XP_CONFIG.LEVELS[i + 1] || null;
        break;
      }
    }
    
    const xpInCurrentLevel = totalXP - currentLevel.minXP;
    const xpNeededForLevel = nextLevel 
      ? (nextLevel.minXP - currentLevel.minXP)
      : 0;
    const progress = nextLevel
      ? Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)
      : 100;
    
    return {
      level: currentLevel.level,
      name: currentLevel.name,
      nextLevelXP: nextLevel?.minXP || null,
      xpToNextLevel: nextLevel ? (nextLevel.minXP - totalXP) : null,
      progress
    };
  }

  /**
   * Get rewards for reaching a specific level
   */
  private getRewardsForLevel(level: number): Reward[] {
    const levelReward = LEVEL_REWARDS.find(lr => lr.level === level);
    return levelReward?.rewards || [];
  }

  /**
   * Get player XP data
   */
  async getPlayerXP(userId: string): Promise<PlayerXP | null> {
    // Fetch from database
    return null; // Placeholder
  }

  /**
   * Get leaderboard data
   */
  async getXPLeaderboard(
    type: 'all_time' | 'season' | 'month',
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    // Fetch from database based on type
    return []; // Placeholder
  }

  /**
   * Get or create player XP record
   */
  private async getOrCreatePlayerXP(userId: string): Promise<PlayerXP> {
    // Implementation would fetch or create from database
    const levelInfo = this.calculateLevel(0);
    return {
      _type: 'player_xp',
      userId,
      currentXP: 0,
      totalXP: 0,
      level: 1,
      levelName: levelInfo.name,
      nextLevelXP: levelInfo.nextLevelXP,
      xpToNextLevel: levelInfo.xpToNextLevel,
      levelProgress: levelInfo.progress,
      lastXPGain: null,
      xpHistory: [],
      seasonXP: 0,
      monthlyXP: 0,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Save player XP to database
   */
  private async savePlayerXP(playerXP: PlayerXP): Promise<void> {
    // Save to database
  }
}

// Supporting types
export interface XPContext {
  tournamentId?: string;
  matchId?: string;
  achievementId?: string;
  winStreak?: number;
  isUnderdog?: boolean;
  isPerfectGame?: boolean;
  isComebackWin?: boolean;
}

export interface XPAwardResult {
  xpAwarded: number;
  totalXP: number;
  currentLevel: number;
  levelName: string;
  leveledUp: boolean;
  newRewards: Reward[];
  multipliers: XPMultiplier[];
}

export interface LevelInfo {
  level: number;
  name: string;
  nextLevelXP: number | null;
  xpToNextLevel: number | null;
  progress: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  levelName: string;
  totalXP: number;
  change: number; // Position change
}

// Helper function to get XP for achievement rarity
export function getXPForAchievementRarity(rarity: string): number {
  switch (rarity) {
    case 'common': return 10;
    case 'rare': return 25;
    case 'epic': return 50;
    case 'legendary': return 100;
    default: return 5;
  }
}