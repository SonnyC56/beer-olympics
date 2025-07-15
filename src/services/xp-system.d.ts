export declare const XP_CONFIG: {
    GAME_PARTICIPATION: number;
    GAME_WIN: number;
    TOURNAMENT_WIN: number;
    ACHIEVEMENT_UNLOCK: {
        min: number;
        max: number;
    };
    HIGH_FIVE: number;
    UPLOAD_HIGHLIGHT: number;
    RECEIVE_SPORTSMANSHIP_VOTE: number;
    TEAM_INVITE_ACCEPTED: number;
    STREAK_MULTIPLIER: number;
    UNDERDOG_BONUS: number;
    PERFECT_GAME_BONUS: number;
    COMEBACK_BONUS: number;
    LEVELS: ({
        level: number;
        name: string;
        minXP: number;
        maxXP: number;
    } | {
        level: number;
        name: string;
        minXP: number;
        maxXP: null;
    })[];
};
export interface PlayerXP {
    _type: 'player_xp';
    userId: string;
    currentXP: number;
    totalXP: number;
    level: number;
    levelName: string;
    nextLevelXP: number | null;
    xpToNextLevel: number | null;
    levelProgress: number;
    lastXPGain: XPGain | null;
    xpHistory: XPGain[];
    seasonXP: number;
    monthlyXP: number;
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
export type XPReason = 'game_participation' | 'game_win' | 'tournament_win' | 'achievement_unlock' | 'social_action' | 'daily_bonus' | 'streak_bonus' | 'special_event';
export interface XPMultiplier {
    type: 'streak' | 'underdog' | 'perfect' | 'comeback' | 'event';
    value: number;
    description: string;
}
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
export type RewardType = 'badge' | 'title' | 'avatar_border' | 'theme' | 'sound_pack' | 'emote' | 'tournament_slot' | 'customization';
export declare const LEVEL_REWARDS: LevelReward[];
export declare class XPSystem {
    private db;
    constructor(db: any);
    /**
     * Award XP to a player
     */
    awardXP(userId: string, amount: number, reason: XPReason, context?: XPContext): Promise<XPAwardResult>;
    /**
     * Calculate multipliers based on context
     */
    private calculateMultipliers;
    /**
     * Calculate level from total XP
     */
    private calculateLevel;
    /**
     * Get rewards for reaching a specific level
     */
    private getRewardsForLevel;
    /**
     * Get player XP data
     */
    getPlayerXP(userId: string): Promise<PlayerXP | null>;
    /**
     * Get leaderboard data
     */
    getXPLeaderboard(type: 'all_time' | 'season' | 'month', limit?: number): Promise<LeaderboardEntry[]>;
    /**
     * Get or create player XP record
     */
    private getOrCreatePlayerXP;
    /**
     * Save player XP to database
     */
    private savePlayerXP;
}
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
    change: number;
}
export declare function getXPForAchievementRarity(rarity: string): number;
