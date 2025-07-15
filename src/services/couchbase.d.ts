import { Cluster, Bucket, Collection, QueryResult } from 'couchbase';
export declare class CouchbaseError extends Error {
    code?: string;
    constructor(message: string, code?: string);
}
export declare function getCouchbaseConnection(): Promise<{
    cluster: Cluster;
    bucket: Bucket;
}>;
export declare function getCollection(collectionName?: string): Promise<Collection>;
export declare function query(statement: string, options?: any): Promise<QueryResult>;
export declare function closeConnection(): Promise<void>;
export declare function getDocument(key: string, collection?: string, cacheOptions?: {
    enableCache?: boolean;
    cacheTTL?: number;
    cacheKey?: string;
}): Promise<any>;
export declare function upsertDocument(key: string, value: any, collection?: string, cacheOptions?: {
    invalidateCache?: boolean;
    cacheKey?: string;
    relatedCacheKeys?: string[];
}): Promise<import("couchbase").MutationResult>;
export declare function removeDocument(key: string, collection?: string, cacheOptions?: {
    invalidateCache?: boolean;
    cacheKey?: string;
    relatedCacheKeys?: string[];
}): Promise<import("couchbase").MutationResult | null>;
export declare function executeQuery(statement: string, params?: any[], cacheOptions?: {
    enableCache?: boolean;
    cacheTTL?: number;
    cacheKey?: string;
}): Promise<QueryResult>;
export declare function getTournamentLeaderboard(tournamentId: string): Promise<any[]>;
export declare function getTournamentStandings(tournamentId: string): Promise<any>;
export declare function getTeamStats(teamId: string, tournamentId?: string): Promise<any>;
export declare function warmLeaderboardCache(tournamentId: string): Promise<void>;
export declare const couchbaseService: {
    get: typeof getDocument;
    upsert: typeof upsertDocument;
    remove: typeof removeDocument;
    query: typeof executeQuery;
    getCouchbaseConnection: typeof getCouchbaseConnection;
    getCollection: typeof getCollection;
    CouchbaseError: typeof CouchbaseError;
    getTournamentLeaderboard: typeof getTournamentLeaderboard;
    getTournamentStandings: typeof getTournamentStandings;
    getTeamStats: typeof getTeamStats;
    warmLeaderboardCache: typeof warmLeaderboardCache;
    invalidateMatch: (matchId: string, tournamentId: string, teamIds: string[]) => Promise<void>;
    invalidateTournament: (tournamentId: string) => Promise<void>;
};
export declare const couchbase: {
    get: typeof getDocument;
    upsert: typeof upsertDocument;
    remove: typeof removeDocument;
    query: typeof executeQuery;
    getCouchbaseConnection: typeof getCouchbaseConnection;
    getCollection: typeof getCollection;
    CouchbaseError: typeof CouchbaseError;
    getTournamentLeaderboard: typeof getTournamentLeaderboard;
    getTournamentStandings: typeof getTournamentStandings;
    getTeamStats: typeof getTeamStats;
    warmLeaderboardCache: typeof warmLeaderboardCache;
    invalidateMatch: (matchId: string, tournamentId: string, teamIds: string[]) => Promise<void>;
    invalidateTournament: (tournamentId: string) => Promise<void>;
};
