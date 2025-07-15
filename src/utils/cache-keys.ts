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
    byTournament: (tournamentId: string) => 
      `${CACHE_PREFIX}:leaderboard:tournament:${tournamentId}`,
    
    byGame: (tournamentId: string, gameId: string) => 
      `${CACHE_PREFIX}:leaderboard:tournament:${tournamentId}:game:${gameId}`,
    
    overall: (tournamentId: string) => 
      `${CACHE_PREFIX}:leaderboard:overall:${tournamentId}`,
    
    pattern: (tournamentId?: string) => 
      tournamentId 
        ? `${CACHE_PREFIX}:leaderboard:*:${tournamentId}*`
        : `${CACHE_PREFIX}:leaderboard:*`,
  },

  // User/Session keys
  user: {
    session: (sessionId: string) => 
      `${CACHE_PREFIX}:session:${sessionId}`,
    
    profile: (userId: string) => 
      `${CACHE_PREFIX}:user:profile:${userId}`,
    
    permissions: (userId: string) => 
      `${CACHE_PREFIX}:user:permissions:${userId}`,
    
    pattern: (userId?: string) => 
      userId 
        ? `${CACHE_PREFIX}:user:*:${userId}`
        : `${CACHE_PREFIX}:user:*`,
  },

  // Tournament keys
  tournament: {
    state: (tournamentId: string) => 
      `${CACHE_PREFIX}:tournament:state:${tournamentId}`,
    
    standings: (tournamentId: string) => 
      `${CACHE_PREFIX}:tournament:standings:${tournamentId}`,
    
    details: (tournamentId: string) => 
      `${CACHE_PREFIX}:tournament:details:${tournamentId}`,
    
    schedule: (tournamentId: string) => 
      `${CACHE_PREFIX}:tournament:schedule:${tournamentId}`,
    
    participants: (tournamentId: string) => 
      `${CACHE_PREFIX}:tournament:participants:${tournamentId}`,
    
    pattern: (tournamentId?: string) => 
      tournamentId 
        ? `${CACHE_PREFIX}:tournament:*:${tournamentId}`
        : `${CACHE_PREFIX}:tournament:*`,
  },

  // Match keys
  match: {
    details: (matchId: string) => 
      `${CACHE_PREFIX}:match:details:${matchId}`,
    
    results: (matchId: string) => 
      `${CACHE_PREFIX}:match:results:${matchId}`,
    
    byTournament: (tournamentId: string) => 
      `${CACHE_PREFIX}:match:tournament:${tournamentId}`,
    
    live: (matchId: string) => 
      `${CACHE_PREFIX}:match:live:${matchId}`,
    
    pattern: (matchId?: string) => 
      matchId 
        ? `${CACHE_PREFIX}:match:*:${matchId}`
        : `${CACHE_PREFIX}:match:*`,
  },

  // Team keys
  team: {
    details: (teamId: string) => 
      `${CACHE_PREFIX}:team:details:${teamId}`,
    
    stats: (teamId: string, tournamentId?: string) => 
      tournamentId 
        ? `${CACHE_PREFIX}:team:stats:${teamId}:tournament:${tournamentId}`
        : `${CACHE_PREFIX}:team:stats:${teamId}`,
    
    members: (teamId: string) => 
      `${CACHE_PREFIX}:team:members:${teamId}`,
    
    pattern: (teamId?: string) => 
      teamId 
        ? `${CACHE_PREFIX}:team:*:${teamId}`
        : `${CACHE_PREFIX}:team:*`,
  },

  // Statistics keys
  stats: {
    game: (gameId: string) => 
      `${CACHE_PREFIX}:stats:game:${gameId}`,
    
    player: (playerId: string) => 
      `${CACHE_PREFIX}:stats:player:${playerId}`,
    
    tournament: (tournamentId: string) => 
      `${CACHE_PREFIX}:stats:tournament:${tournamentId}`,
    
    global: () => 
      `${CACHE_PREFIX}:stats:global`,
    
    pattern: () => 
      `${CACHE_PREFIX}:stats:*`,
  },

  // Real-time data keys (shorter TTL)
  realtime: {
    scoreboard: (tournamentId: string) => 
      `${CACHE_PREFIX}:realtime:scoreboard:${tournamentId}`,
    
    liveMatches: () => 
      `${CACHE_PREFIX}:realtime:matches:live`,
    
    notifications: (userId: string) => 
      `${CACHE_PREFIX}:realtime:notifications:${userId}`,
    
    pattern: () => 
      `${CACHE_PREFIX}:realtime:*`,
  },

  // API response cache
  api: {
    endpoint: (method: string, path: string, params?: string) => 
      params 
        ? `${CACHE_PREFIX}:api:${method}:${path}:${params}`
        : `${CACHE_PREFIX}:api:${method}:${path}`,
    
    pattern: (path?: string) => 
      path 
        ? `${CACHE_PREFIX}:api:*:${path}*`
        : `${CACHE_PREFIX}:api:*`,
  },
};

/**
 * Helper function to generate cache key from request
 */
export function getApiCacheKey(
  method: string, 
  path: string, 
  query?: Record<string, any>
): string {
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
  onMatchUpdate: async (
    matchId: string, 
    tournamentId: string,
    teamIds: string[]
  ): Promise<string[]> => {
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
  onTournamentUpdate: async (tournamentId: string): Promise<string[]> => {
    return [
      CacheKeys.tournament.pattern(tournamentId),
      CacheKeys.leaderboard.pattern(tournamentId),
      CacheKeys.match.byTournament(tournamentId),
    ];
  },

  // When team data changes
  onTeamUpdate: async (teamId: string): Promise<string[]> => {
    return [
      CacheKeys.team.pattern(teamId),
    ];
  },

  // Clear all caches for a user
  onUserUpdate: async (userId: string): Promise<string[]> => {
    return [
      CacheKeys.user.pattern(userId),
    ];
  },
};

export default CacheKeys;