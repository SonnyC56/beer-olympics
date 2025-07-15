interface CacheWarmingOptions {
    tournamentIds?: string[];
    teamIds?: string[];
    matchIds?: string[];
    warmLeaderboards?: boolean;
    warmTournaments?: boolean;
    warmTeams?: boolean;
    warmStats?: boolean;
}
export declare class CacheWarmer {
    private isWarming;
    private warmingInterval;
    /**
     * Warm cache with initial data
     */
    warmCache(options?: CacheWarmingOptions): Promise<void>;
    /**
     * Start periodic cache warming
     */
    startPeriodicWarming(intervalMs?: number, options?: CacheWarmingOptions): void;
    /**
     * Stop periodic cache warming
     */
    stopPeriodicWarming(): void;
    /**
     * Get active tournament IDs from database
     */
    private getActiveTournamentIds;
    /**
     * Warm leaderboard data for a tournament
     */
    private warmLeaderboard;
    /**
     * Warm tournament data
     */
    private warmTournamentData;
    /**
     * Warm team data
     */
    private warmTeamData;
    /**
     * Warm global statistics
     */
    private warmGlobalStats;
    /**
     * Invalidate all caches
     */
    invalidateAll(): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): Promise<{
        totalKeys: number;
        keysByPattern: Record<string, number>;
        memoryUsage: string;
    }>;
}
export declare const cacheWarmer: CacheWarmer;
export {};
