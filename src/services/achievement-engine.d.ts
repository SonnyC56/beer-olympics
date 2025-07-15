import type { PlayerStats } from '../types/player-stats';
import type { Achievement } from '../types';
export interface AchievementDefinition {
    id: string;
    category: AchievementCategory;
    name: string;
    description: string;
    iconUrl?: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xpReward: number;
    criteria: AchievementCriteria;
    hidden?: boolean;
    prerequisiteIds?: string[];
}
export type AchievementCategory = 'performance' | 'skill' | 'social' | 'fun' | 'milestone' | 'tournament' | 'special';
export interface AchievementCriteria {
    type: CriteriaType;
    value: number;
    gameType?: string;
    comparison: 'eq' | 'gte' | 'lte' | 'gt' | 'lt';
    timeframe?: 'all' | 'tournament' | 'season' | 'month';
}
export type CriteriaType = 'games_won' | 'games_played' | 'win_streak' | 'tournaments_won' | 'perfect_games' | 'comeback_wins' | 'accuracy_percentage' | 'speed_record' | 'teammates_played_with' | 'high_fives_given' | 'sportsmanship_rating' | 'highlights_uploaded' | 'friends_invited' | 'costume_votes' | 'trash_talks_liked' | 'losses_with_spirit' | 'consecutive_participations' | 'overtime_wins' | 'different_game_wins';
export interface AchievementProgress {
    achievementId: string;
    userId: string;
    currentValue: number;
    targetValue: number;
    startedAt: string;
    lastUpdatedAt: string;
}
export declare const ACHIEVEMENTS: Record<string, AchievementDefinition>;
export declare class AchievementEngine {
    private db;
    private progressCache;
    constructor(db: any);
    /**
     * Check if a player has earned any new achievements
     */
    checkAchievements(userId: string, context: AchievementContext): Promise<UnlockedAchievement[]>;
    /**
     * Check if specific criteria is met
     */
    private checkCriteria;
    /**
     * Get the current value for a criteria type
     */
    private getCriteriaValue;
    /**
     * Unlock an achievement for a player
     */
    private unlockAchievement;
    /**
     * Update achievement progress
     */
    updateProgress(userId: string, updates: ProgressUpdate[]): Promise<void>;
    /**
     * Get achievement progress for a player
     */
    getPlayerProgress(userId: string): Promise<AchievementProgress[]>;
    private getPlayerProfile;
    private saveAchievement;
    private awardXP;
    private isFirstTimeGlobally;
    private getOrCreateProgress;
    private saveProgress;
}
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
export declare function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[];
export declare function getAchievementDefinition(id: string): AchievementDefinition | undefined;
