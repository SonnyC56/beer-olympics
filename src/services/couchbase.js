import { connect } from 'couchbase';
import redisService, { CACHE_TTL } from './redis';
import { CacheKeys, CacheInvalidation } from '../utils/cache-keys';
let cluster = null;
let bucket = null;
let isConnecting = false;
export class CouchbaseError extends Error {
    constructor(message, code) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = 'CouchbaseError';
        this.code = code;
    }
}
export async function getCouchbaseConnection() {
    if (cluster && bucket) {
        return { cluster, bucket };
    }
    if (isConnecting) {
        // Wait for ongoing connection
        while (isConnecting) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (cluster && bucket) {
            return { cluster, bucket };
        }
    }
    isConnecting = true;
    try {
        const connectionString = process.env.COUCHBASE_CONNECTION_STRING;
        const username = process.env.COUCHBASE_USERNAME;
        const password = process.env.COUCHBASE_PASSWORD;
        const bucketName = process.env.COUCHBASE_BUCKET || 'beer_olympics';
        if (!connectionString || !username || !password) {
            throw new CouchbaseError('Missing Couchbase configuration. Please check environment variables.');
        }
        cluster = await connect(connectionString, {
            username,
            password,
            timeouts: {
                kvTimeout: 10000,
                queryTimeout: 20000,
                connectTimeout: 10000,
                managementTimeout: 20000,
            },
        });
        bucket = cluster.bucket(bucketName);
        // Wait for bucket to be ready
        await bucket.defaultCollection().exists('test', { timeout: 1000 }).catch(() => { });
        return { cluster, bucket };
    }
    catch (error) {
        cluster = null;
        bucket = null;
        throw new CouchbaseError(`Failed to connect to Couchbase: ${error instanceof Error ? error.message : String(error)}`);
    }
    finally {
        isConnecting = false;
    }
}
export async function getCollection(collectionName = '_default') {
    const { bucket } = await getCouchbaseConnection();
    return bucket.defaultScope().collection(collectionName);
}
export async function query(statement, options) {
    const { cluster } = await getCouchbaseConnection();
    return cluster.query(statement, options);
}
export async function closeConnection() {
    if (cluster) {
        await cluster.close();
        cluster = null;
        bucket = null;
    }
}
// Helper functions for common operations with caching
export async function getDocument(key, collection = '_default', cacheOptions) {
    const { enableCache = true, cacheTTL = CACHE_TTL.DEFAULT, cacheKey } = cacheOptions || {};
    const redisCacheKey = cacheKey || `doc:${collection}:${key}`;
    // Try cache first if enabled
    if (enableCache) {
        const cached = await redisService.get(redisCacheKey);
        if (cached !== null) {
            return cached;
        }
    }
    try {
        const coll = await getCollection(collection);
        const result = await coll.get(key);
        const content = result.content;
        // Cache the result if enabled
        if (enableCache && content) {
            await redisService.set(redisCacheKey, content, cacheTTL);
        }
        return content;
    }
    catch (error) {
        if (error instanceof Error && error.name === 'DocumentNotFoundError') {
            return null;
        }
        throw new CouchbaseError(`Failed to get document ${key}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
export async function upsertDocument(key, value, collection = '_default', cacheOptions) {
    const { invalidateCache = true, cacheKey, relatedCacheKeys = [] } = cacheOptions || {};
    try {
        const coll = await getCollection(collection);
        const result = await coll.upsert(key, value);
        // Invalidate cache if enabled
        if (invalidateCache) {
            const keysToInvalidate = [
                cacheKey || `doc:${collection}:${key}`,
                ...relatedCacheKeys
            ];
            await redisService.delete(keysToInvalidate);
        }
        return result;
    }
    catch (error) {
        throw new CouchbaseError(`Failed to upsert document ${key}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
export async function removeDocument(key, collection = '_default', cacheOptions) {
    const { invalidateCache = true, cacheKey, relatedCacheKeys = [] } = cacheOptions || {};
    try {
        const coll = await getCollection(collection);
        const result = await coll.remove(key);
        // Invalidate cache if enabled
        if (invalidateCache) {
            const keysToInvalidate = [
                cacheKey || `doc:${collection}:${key}`,
                ...relatedCacheKeys
            ];
            await redisService.delete(keysToInvalidate);
        }
        return result;
    }
    catch (error) {
        if (error instanceof Error && error.name === 'DocumentNotFoundError') {
            return null;
        }
        throw new CouchbaseError(`Failed to remove document ${key}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
// Execute query with caching support
export async function executeQuery(statement, params, cacheOptions) {
    const { enableCache = false, cacheTTL = CACHE_TTL.DEFAULT, cacheKey } = cacheOptions || {};
    // Generate cache key if not provided
    const redisCacheKey = cacheKey || `query:${Buffer.from(statement + JSON.stringify(params || [])).toString('base64').substring(0, 50)}`;
    // Try cache first if enabled
    if (enableCache) {
        const cached = await redisService.get(redisCacheKey);
        if (cached !== null) {
            return cached;
        }
    }
    const { cluster } = await getCouchbaseConnection();
    const result = await cluster.query(statement, { parameters: params });
    // Cache the result if enabled
    if (enableCache) {
        await redisService.set(redisCacheKey, result, cacheTTL);
    }
    return result;
}
// Specialized query functions with built-in caching
export async function getTournamentLeaderboard(tournamentId) {
    const cacheKey = CacheKeys.leaderboard.byTournament(tournamentId);
    return redisService.warm(cacheKey, async () => {
        const statement = `
      SELECT 
        t.team_id as teamId,
        t.name as teamName,
        t.color_hex as colorHex,
        t.flag_code as flagCode,
        COALESCE(SUM(mr.points), 0) as totalPoints,
        COUNT(DISTINCT mr.match_id) as matchesPlayed,
        COUNT(CASE WHEN mr.position = 1 THEN 1 END) as wins
      FROM beer_olympics t
      LEFT JOIN beer_olympics mr ON mr.type = 'match_result' 
        AND mr.team_id = t.team_id 
        AND mr.tournament_id = $tournamentId
      WHERE t.type = 'team'
        AND t.tournament_id = $tournamentId
      GROUP BY t.team_id, t.name, t.color_hex, t.flag_code
      ORDER BY totalPoints DESC, wins DESC, teamName
    `;
        const result = await executeQuery(statement, [tournamentId]);
        const rows = result.rows || [];
        // Add position numbers
        return rows.map((row, index) => ({
            ...row,
            position: index + 1
        }));
    }, CACHE_TTL.LEADERBOARD);
}
export async function getTournamentStandings(tournamentId) {
    const cacheKey = CacheKeys.tournament.standings(tournamentId);
    return redisService.warm(cacheKey, async () => {
        const statement = `
      SELECT 
        tournament_id,
        current_round,
        total_rounds,
        status,
        standings
      FROM beer_olympics
      WHERE type = 'tournament'
        AND tournament_id = $tournamentId
    `;
        const result = await executeQuery(statement, [tournamentId]);
        return result.rows?.[0] || null;
    }, CACHE_TTL.TOURNAMENT_STANDINGS);
}
export async function getTeamStats(teamId, tournamentId) {
    const cacheKey = CacheKeys.team.stats(teamId, tournamentId);
    const ttl = CACHE_TTL.TEAM_DATA;
    return redisService.warm(cacheKey, async () => {
        let statement = `
      SELECT 
        COUNT(*) as totalMatches,
        COALESCE(SUM(points), 0) as totalPoints,
        COUNT(CASE WHEN position = 1 THEN 1 END) as wins,
        COUNT(CASE WHEN position = 2 THEN 1 END) as secondPlace,
        COUNT(CASE WHEN position = 3 THEN 1 END) as thirdPlace,
        AVG(points) as avgPoints
      FROM beer_olympics
      WHERE type = 'match_result'
        AND team_id = $teamId
    `;
        const params = [teamId];
        if (tournamentId) {
            statement += ' AND tournament_id = $tournamentId';
            params.push(tournamentId);
        }
        const result = await executeQuery(statement, params);
        return result.rows?.[0] || null;
    }, ttl);
}
// Cache warming for popular data
export async function warmLeaderboardCache(tournamentId) {
    await getTournamentLeaderboard(tournamentId);
    await getTournamentStandings(tournamentId);
}
// Export couchbaseService for compatibility
export const couchbaseService = {
    get: getDocument,
    upsert: upsertDocument,
    remove: removeDocument,
    query: executeQuery,
    getCouchbaseConnection,
    getCollection,
    CouchbaseError,
    // New cached methods
    getTournamentLeaderboard,
    getTournamentStandings,
    getTeamStats,
    warmLeaderboardCache,
    // Cache invalidation helpers
    invalidateMatch: async (matchId, tournamentId, teamIds) => {
        const keys = await CacheInvalidation.onMatchUpdate(matchId, tournamentId, teamIds);
        await redisService.delete(keys);
    },
    invalidateTournament: async (tournamentId) => {
        const patterns = await CacheInvalidation.onTournamentUpdate(tournamentId);
        for (const pattern of patterns) {
            await redisService.deletePattern(pattern);
        }
    },
};
// Also export default couchbase object for RSVP router
export const couchbase = couchbaseService;
