import { EventEmitter } from 'events';
export interface EnhancedRealtimeService extends RealtimeService {
    connect(): Promise<void>;
    disconnect(): void;
    reconnect(): Promise<void>;
    getConnectionState(): ConnectionState;
    onConnectionStateChange(callback: (state: ConnectionState) => void): () => void;
    subscribePresence(channel: string): PresenceChannel | null;
    getLatency(): number;
    getMetrics(): ConnectionMetrics;
}
export interface ConnectionState {
    state: 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'failed';
    error?: Error;
    retryCount: number;
}
export interface ConnectionMetrics {
    messagesSent: number;
    messagesReceived: number;
    averageLatency: number;
    connectionUptime: number;
    reconnectCount: number;
}
export interface PresenceChannel extends RealtimeChannel {
    getMembers(): Map<string, any>;
    getMe(): any;
    onMemberAdded(callback: (member: any) => void): () => void;
    onMemberRemoved(callback: (member: any) => void): () => void;
}
export interface RealtimeService {
    subscribe(channel: string): RealtimeChannel | null;
    unsubscribe(channel: string): void;
    isConnected(): boolean;
}
export interface RealtimeChannel {
    bind(event: string, callback: (data: any) => void): () => void;
    unbind(event?: string, callback?: (data: any) => void): void;
    trigger(event: string, data: any): void;
}
export interface EnhancedTournamentEvents extends TournamentEvents {
    'game-start': {
        tournamentId: string;
        matchId: string;
        gameType: string;
        teams: string[];
        startTime: number;
    };
    'game-end': {
        tournamentId: string;
        matchId: string;
        finalScores: Record<string, number>;
        duration: number;
    };
    'live-score': {
        tournamentId: string;
        matchId: string;
        teamId: string;
        score: number;
        delta: number;
        timestamp: number;
        playerAction?: {
            playerId: string;
            action: 'cup' | 'bounce' | 'miss';
        };
    };
    'notification': {
        tournamentId: string;
        type: 'info' | 'warning' | 'success' | 'error';
        title: string;
        message: string;
        targetTeams?: string[];
    };
    'leaderboard-update': {
        tournamentId: string;
        rankings: Array<{
            teamId: string;
            rank: number;
            points: number;
            wins: number;
            losses: number;
            pointDiff: number;
        }>;
        changedPositions: Array<{
            teamId: string;
            oldRank: number;
            newRank: number;
        }>;
    };
    'tournament-start': {
        tournamentId: string;
        totalTeams: number;
        totalMatches: number;
    };
    'tournament-complete': {
        tournamentId: string;
        winner: string;
        finalRankings: string[];
    };
    'media-upload': {
        tournamentId: string;
        matchId: string;
        media: {
            id: string;
            type: 'photo' | 'video';
            url: string;
            thumbnailUrl?: string;
            uploaderId: string;
            uploaderName?: string;
            testimonial?: string;
        };
        timestamp: number;
    };
    'media-delete': {
        matchId: string;
        mediaId: string;
        timestamp: number;
    };
    'highlight-detected': {
        tournamentId: string;
        type: 'fastestChug' | 'biggestUpset' | 'funnyMoments';
        mediaId: string;
        confidence: number;
        timestamp: number;
    };
    'reel-generated': {
        tournamentId: string;
        reelUrl: string;
        mediaIds: string[];
        timestamp: number;
    };
    'ping': {
        timestamp: number;
    };
    'pong': {
        timestamp: number;
        latency: number;
    };
}
export interface TournamentEvents {
    'score-update': {
        tournamentId: string;
        matchId: string;
        teamId: string;
        points: number;
    };
    'match-complete': {
        tournamentId: string;
        matchId: string;
        winner: string;
    };
    'team-joined': {
        tournamentId: string;
        team: {
            id: string;
            name: string;
            colorHex: string;
            flagCode: string;
        };
    };
    'tournament-status': {
        tournamentId: string;
        isOpen: boolean;
    };
}
export declare abstract class BaseRealtimeService extends EventEmitter implements EnhancedRealtimeService {
    protected connectionState: ConnectionState;
    protected metrics: ConnectionMetrics;
    protected latencyBuffer: number[];
    protected connectionStartTime: number;
    abstract subscribe(channel: string): RealtimeChannel | null;
    abstract unsubscribe(channel: string): void;
    abstract isConnected(): boolean;
    abstract connect(): Promise<void>;
    abstract disconnect(): void;
    abstract reconnect(): Promise<void>;
    abstract subscribePresence(channel: string): PresenceChannel | null;
    getConnectionState(): ConnectionState;
    onConnectionStateChange(callback: (state: ConnectionState) => void): () => void;
    getLatency(): number;
    getMetrics(): ConnectionMetrics;
    protected updateConnectionState(state: ConnectionState['state'], error?: Error): void;
    protected addLatencySample(latency: number): void;
}
export declare const enhancedRealtimeService: EnhancedRealtimeService;
export declare function isEnhancedRealtimeService(service: any): service is EnhancedRealtimeService;
