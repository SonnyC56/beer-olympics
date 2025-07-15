/**
 * Centralized cache key management for Redis
 * Ensures consistent naming conventions and easy cache invalidation
 */
const CACHE_PREFIX = 'beer_olympics';
/**
 * Cache key generators for different data types
 */
export const CacheKeys = {
    // Leaderboard keys
    leaderboard: {
        byTournament: (tournamentId) => `${CACHE_PREFIX}:leaderboard:tournament:${tournamentId}`,
        byGame: (tournamentId, gameId) => `${CACHE_PREFIX}:leaderboard:tournament:${tournamentId}:game:${gameId}`,
        overall: (tournamentId) => `${CACHE_PREFIX}:leaderboard:overall:${tournamentId}`,
        pattern: (tournamentId) => tournamentId
            ? `${CACHE_PREFIX}:leaderboard:*:${tournamentId}*`
            : `${CACHE_PREFIX}:leaderboard:*`,
    },
    // User/Session keys
    user: {
        session: (sessionId) => `${CACHE_PREFIX}:session:${sessionId}`,
        profile: (userId) => `${CACHE_PREFIX}:user:profile:${userId}`,
        permissions: (userId) => `${CACHE_PREFIX}:user:permissions:${userId}`,
        pattern: (userId) => userId
            ? `${CACHE_PREFIX}:user:*:${userId}`
            : `${CACHE_PREFIX}:user:*`,
    },
    // Tournament keys
    tournament: {
        state: (tournamentId) => `${CACHE_PREFIX}:tournament:state:${tournamentId}`,
        standings: (tournamentId) => `${CACHE_PREFIX}:tournament:standings:${tournamentId}`,
        details: (tournamentId) => `${CACHE_PREFIX}:tournament:details:${tournamentId}`,
        schedule: (tournamentId) => `${CACHE_PREFIX}:tournament:schedule:${tournamentId}`,
        participants: (tournamentId) => `${CACHE_PREFIX}:tournament:participants:${tournamentId}`,
        pattern: (tournamentId) => tournamentId
            ? `${CACHE_PREFIX}:tournament:*:${tournamentId}`
            : `${CACHE_PREFIX}:tournament:*`,
    },
    // Match keys
    match: {
        details: (matchId) => `${CACHE_PREFIX}:match:details:${matchId}`,
        results: (matchId) => `${CACHE_PREFIX}:match:results:${matchId}`,
        byTournament: (tournamentId) => `${CACHE_PREFIX}:match:tournament:${tournamentId}`,
        live: (matchId) => `${CACHE_PREFIX}:match:live:${matchId}`,
        pattern: (matchId) => matchId
            ? `${CACHE_PREFIX}:match:*:${matchId}`
            : `${CACHE_PREFIX}:match:*`,
    },
    // Team keys
    team: {
        details: (teamId) => `${CACHE_PREFIX}:team:details:${teamId}`,
        stats: (teamId, tournamentId) => tournamentId
            ? `${CACHE_PREFIX}:team:stats:${teamId}:tournament:${tournamentId}`
            : `${CACHE_PREFIX}:team:stats:${teamId}`,
        members: (teamId) => `${CACHE_PREFIX}:team:members:${teamId}`,
        pattern: (teamId) => teamId
            ? `${CACHE_PREFIX}:team:*:${teamId}`
            : `${CACHE_PREFIX}:team:*`,
    },
    // Statistics keys
    stats: {
        game: (gameId) => `${CACHE_PREFIX}:stats:game:${gameId}`,
        player: (playerId) => `${CACHE_PREFIX}:stats:player:${playerId}`,
        tournament: (tournamentId) => `${CACHE_PREFIX}:stats:tournament:${tournamentId}`,
        global: () => `${CACHE_PREFIX}:stats:global`,
        pattern: () => `${CACHE_PREFIX}:stats:*`,
    },
    // Real-time data keys (shorter TTL)
    realtime: {
        scoreboard: (tournamentId) => `${CACHE_PREFIX}:realtime:scoreboard:${tournamentId}`,
        liveMatches: () => `${CACHE_PREFIX}:realtime:matches:live`,
        notifications: (userId) => `${CACHE_PREFIX}:realtime:notifications:${userId}`,
        pattern: () => `${CACHE_PREFIX}:realtime:*`,
    },
    // API response cache
    api: {
        endpoint: (method, path, params) => params
            ? `${CACHE_PREFIX}:api:${method}:${path}:${params}`
            : `${CACHE_PREFIX}:api:${method}:${path}`,
        pattern: (path) => path
            ? `${CACHE_PREFIX}:api:*:${path}*`
            : `${CACHE_PREFIX}:api:*`,
    },
};
/**
 * Helper function to generate cache key from request
 */
export function getApiCacheKey(method, path, query) {
    const sortedQuery = query
        ? Object.keys(query)
            .sort()
            .map(key => `${key}=${query[key]}`)
            .join('&')
        : undefined;
    return CacheKeys.api.endpoint(method, path, sortedQuery);
}
/**
 * Invalidation helpers for related data
 */
export const CacheInvalidation = {
    // When a match is updated, invalidate related caches
    onMatchUpdate: async (matchId, tournamentId, teamIds) => {
        return [
            CacheKeys.match.details(matchId),
            CacheKeys.match.results(matchId),
            CacheKeys.match.live(matchId),
            CacheKeys.tournament.standings(tournamentId),
            CacheKeys.leaderboard.byTournament(tournamentId),
            CacheKeys.leaderboard.overall(tournamentId),
            ...teamIds.map(teamId => CacheKeys.team.stats(teamId, tournamentId)),
        ];
    },
    // When tournament state changes
    onTournamentUpdate: async (tournamentId) => {
        return [
            CacheKeys.tournament.pattern(tournamentId),
            CacheKeys.leaderboard.pattern(tournamentId),
            CacheKeys.match.byTournament(tournamentId),
        ];
    },
    // When team data changes
    onTeamUpdate: async (teamId) => {
        return [
            CacheKeys.team.pattern(teamId),
        ];
    },
    // Clear all caches for a user
    onUserUpdate: async (userId) => {
        return [
            CacheKeys.user.pattern(userId),
        ];
    },
};
export default CacheKeys;
