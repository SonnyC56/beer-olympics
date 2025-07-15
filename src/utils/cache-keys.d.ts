/**
 * Centralized cache key management for Redis
 * Ensures consistent naming conventions and easy cache invalidation
 */
/**
 * Cache key generators for different data types
 */
export declare const CacheKeys: {
    leaderboard: {
        byTournament: (tournamentId: string) => string;
        byGame: (tournamentId: string, gameId: string) => string;
        overall: (tournamentId: string) => string;
        pattern: (tournamentId?: string) => string;
    };
    user: {
        session: (sessionId: string) => string;
        profile: (userId: string) => string;
        permissions: (userId: string) => string;
        pattern: (userId?: string) => string;
    };
    tournament: {
        state: (tournamentId: string) => string;
        standings: (tournamentId: string) => string;
        details: (tournamentId: string) => string;
        schedule: (tournamentId: string) => string;
        participants: (tournamentId: string) => string;
        pattern: (tournamentId?: string) => string;
    };
    match: {
        details: (matchId: string) => string;
        results: (matchId: string) => string;
        byTournament: (tournamentId: string) => string;
        live: (matchId: string) => string;
        pattern: (matchId?: string) => string;
    };
    team: {
        details: (teamId: string) => string;
        stats: (teamId: string, tournamentId?: string) => string;
        members: (teamId: string) => string;
        pattern: (teamId?: string) => string;
    };
    stats: {
        game: (gameId: string) => string;
        player: (playerId: string) => string;
        tournament: (tournamentId: string) => string;
        global: () => string;
        pattern: () => string;
    };
    realtime: {
        scoreboard: (tournamentId: string) => string;
        liveMatches: () => string;
        notifications: (userId: string) => string;
        pattern: () => string;
    };
    api: {
        endpoint: (method: string, path: string, params?: string) => string;
        pattern: (path?: string) => string;
    };
};
/**
 * Helper function to generate cache key from request
 */
export declare function getApiCacheKey(method: string, path: string, query?: Record<string, any>): string;
/**
 * Invalidation helpers for related data
 */
export declare const CacheInvalidation: {
    onMatchUpdate: (matchId: string, tournamentId: string, teamIds: string[]) => Promise<string[]>;
    onTournamentUpdate: (tournamentId: string) => Promise<string[]>;
    onTeamUpdate: (teamId: string) => Promise<string[]>;
    onUserUpdate: (userId: string) => Promise<string[]>;
};
export default CacheKeys;
