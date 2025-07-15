import { couchbaseService } from '../services/couchbase';
import redisService, { CACHE_TTL } from '../services/redis';
import { CacheKeys } from './cache-keys';
export class CacheWarmer {
    constructor() {
        Object.defineProperty(this, "isWarming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "warmingInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * Warm cache with initial data
     */
    async warmCache(options = {}) {
        if (this.isWarming) {
            console.log('Cache warming already in progress...');
            return;
        }
        this.isWarming = true;
        const startTime = Date.now();
        console.log('Starting cache warming...');
        try {
            const { tournamentIds = [], teamIds = [], warmLeaderboards = true, warmTournaments = true, warmTeams = true, warmStats = true, } = options;
            // If no specific IDs provided, fetch active tournaments
            let activeTournamentIds = tournamentIds;
            if (activeTournamentIds.length === 0) {
                activeTournamentIds = await this.getActiveTournamentIds();
            }
            const warmingTasks = [];
            // Warm leaderboards (most critical for performance)
            if (warmLeaderboards) {
                for (const tournamentId of activeTournamentIds) {
                    warmingTasks.push(this.warmLeaderboard(tournamentId).catch(err => console.error(`Failed to warm leaderboard for ${tournamentId}:`, err)));
                }
            }
            // Warm tournament data
            if (warmTournaments) {
                for (const tournamentId of activeTournamentIds) {
                    warmingTasks.push(this.warmTournamentData(tournamentId).catch(err => console.error(`Failed to warm tournament data for ${tournamentId}:`, err)));
                }
            }
            // Warm team data
            if (warmTeams && teamIds.length > 0) {
                for (const teamId of teamIds) {
                    warmingTasks.push(this.warmTeamData(teamId).catch(err => console.error(`Failed to warm team data for ${teamId}:`, err)));
                }
            }
            // Warm global stats
            if (warmStats) {
                warmingTasks.push(this.warmGlobalStats().catch(err => console.error('Failed to warm global stats:', err)));
            }
            // Execute all warming tasks in parallel
            await Promise.all(warmingTasks);
            const duration = Date.now() - startTime;
            console.log(`Cache warming completed in ${duration}ms. Warmed ${warmingTasks.length} cache entries.`);
        }
        catch (error) {
            console.error('Cache warming error:', error);
        }
        finally {
            this.isWarming = false;
        }
    }
    /**
     * Start periodic cache warming
     */
    startPeriodicWarming(intervalMs = 60000, options = {}) {
        if (this.warmingInterval) {
            console.log('Periodic cache warming already running');
            return;
        }
        console.log(`Starting periodic cache warming every ${intervalMs}ms`);
        // Initial warming
        this.warmCache(options);
        // Set up periodic warming
        this.warmingInterval = setInterval(() => {
            this.warmCache(options);
        }, intervalMs);
    }
    /**
     * Stop periodic cache warming
     */
    stopPeriodicWarming() {
        if (this.warmingInterval) {
            clearInterval(this.warmingInterval);
            this.warmingInterval = null;
            console.log('Stopped periodic cache warming');
        }
    }
    /**
     * Get active tournament IDs from database
     */
    async getActiveTournamentIds() {
        try {
            const result = await couchbaseService.query(`
        SELECT tournament_id
        FROM beer_olympics
        WHERE type = 'tournament'
          AND status IN ['active', 'in_progress']
        ORDER BY created_at DESC
        LIMIT 10
      `);
            return result.rows?.map((row) => row.tournament_id) || [];
        }
        catch (error) {
            console.error('Failed to fetch active tournaments:', error);
            return [];
        }
    }
    /**
     * Warm leaderboard data for a tournament
     */
    async warmLeaderboard(tournamentId) {
        await couchbaseService.getTournamentLeaderboard(tournamentId);
        console.log(`Warmed leaderboard for tournament ${tournamentId}`);
    }
    /**
     * Warm tournament data
     */
    async warmTournamentData(tournamentId) {
        // Warm tournament standings
        await couchbaseService.getTournamentStandings(tournamentId);
        // Warm tournament details
        const detailsKey = CacheKeys.tournament.details(tournamentId);
        await redisService.warm(detailsKey, async () => {
            const result = await couchbaseService.query(`
        SELECT *
        FROM beer_olympics
        WHERE type = 'tournament'
          AND tournament_id = $tournamentId
      `, [tournamentId]);
            return result.rows?.[0] || null;
        }, CACHE_TTL.TOURNAMENT_STATE);
        console.log(`Warmed tournament data for ${tournamentId}`);
    }
    /**
     * Warm team data
     */
    async warmTeamData(teamId) {
        await couchbaseService.getTeamStats(teamId);
        console.log(`Warmed team data for ${teamId}`);
    }
    /**
     * Warm global statistics
     */
    async warmGlobalStats() {
        const statsKey = CacheKeys.stats.global();
        await redisService.warm(statsKey, async () => {
            const result = await couchbaseService.query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN type = 'tournament' THEN tournament_id END) as totalTournaments,
          COUNT(DISTINCT CASE WHEN type = 'team' THEN team_id END) as totalTeams,
          COUNT(DISTINCT CASE WHEN type = 'match' THEN match_id END) as totalMatches,
          COUNT(DISTINCT CASE WHEN type = 'user' THEN user_id END) as totalUsers
        FROM beer_olympics
      `);
            return result.rows?.[0] || null;
        }, CACHE_TTL.STATS);
        console.log('Warmed global statistics');
    }
    /**
     * Invalidate all caches
     */
    async invalidateAll() {
        const patterns = [
            'beer_olympics:*',
            'api:*',
            'doc:*',
            'query:*',
        ];
        for (const pattern of patterns) {
            await redisService.deletePattern(pattern);
        }
        console.log('Invalidated all caches');
    }
    /**
     * Get cache statistics
     */
    async getCacheStats() {
        try {
            const client = await redisService['getRedisClient']();
            // Get total keys
            const keys = await client.keys('beer_olympics:*');
            const totalKeys = keys.length;
            // Count keys by pattern
            const keysByPattern = {};
            const patterns = ['leaderboard', 'tournament', 'team', 'match', 'user', 'stats', 'api'];
            for (const pattern of patterns) {
                const patternKeys = keys.filter(key => key.includes(pattern));
                keysByPattern[pattern] = patternKeys.length;
            }
            // Get memory info
            const info = await client.info('memory');
            const memoryMatch = info.match(/used_memory_human:(.+)/);
            const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'Unknown';
            return {
                totalKeys,
                keysByPattern,
                memoryUsage,
            };
        }
        catch (error) {
            console.error('Failed to get cache stats:', error);
            return {
                totalKeys: 0,
                keysByPattern: {},
                memoryUsage: 'Unknown',
            };
        }
    }
}
// Export singleton instance
export const cacheWarmer = new CacheWarmer();
// CLI usage
if (require.main === module) {
    const command = process.argv[2];
    switch (command) {
        case 'warm':
            cacheWarmer.warmCache().then(() => process.exit(0));
            break;
        case 'stats':
            cacheWarmer.getCacheStats().then(stats => {
                console.log('Cache Statistics:', stats);
                process.exit(0);
            });
            break;
        case 'invalidate':
            cacheWarmer.invalidateAll().then(() => process.exit(0));
            break;
        default:
            console.log('Usage: cache-warmer [warm|stats|invalidate]');
            process.exit(1);
    }
}
