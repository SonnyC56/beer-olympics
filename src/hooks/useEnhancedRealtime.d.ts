import { type RealtimeChannel, type PresenceChannel, type ConnectionState, type ConnectionMetrics, type EnhancedTournamentEvents } from '../services/realtime-enhanced';
export declare function useEnhancedRealtime(): {
    subscribe: (channelName: string) => RealtimeChannel | null;
    subscribePresence: (channelName: string) => PresenceChannel | null;
    unsubscribe: (channelName: string) => void;
    bind: <K extends keyof EnhancedTournamentEvents>(channelName: string, event: K, callback: (data: EnhancedTournamentEvents[K]) => void) => () => void;
    trigger: <K extends keyof EnhancedTournamentEvents>(channelName: string, event: K, data: EnhancedTournamentEvents[K]) => void;
    isConnected: boolean;
    connectionState: ConnectionState;
    metrics: ConnectionMetrics | null;
    getLatency: () => number;
    service: import("../services/realtime-enhanced").EnhancedRealtimeService;
};
export declare function useEnhancedTournamentUpdates(tournamentId: string | undefined, handlers: {
    onScoreUpdate?: (data: EnhancedTournamentEvents['score-update']) => void;
    onMatchComplete?: (data: EnhancedTournamentEvents['match-complete']) => void;
    onTeamJoined?: (data: EnhancedTournamentEvents['team-joined']) => void;
    onStatusChange?: (data: EnhancedTournamentEvents['tournament-status']) => void;
    onGameStart?: (data: EnhancedTournamentEvents['game-start']) => void;
    onGameEnd?: (data: EnhancedTournamentEvents['game-end']) => void;
    onLiveScore?: (data: EnhancedTournamentEvents['live-score']) => void;
    onNotification?: (data: EnhancedTournamentEvents['notification']) => void;
    onLeaderboardUpdate?: (data: EnhancedTournamentEvents['leaderboard-update']) => void;
    onTournamentStart?: (data: EnhancedTournamentEvents['tournament-start']) => void;
    onTournamentComplete?: (data: EnhancedTournamentEvents['tournament-complete']) => void;
}): {
    isConnected: boolean;
    connectionState: ConnectionState;
    metrics: ConnectionMetrics | null;
    activeUsers: any[];
    latency: number;
};
export declare function useLiveScoring(tournamentId: string, matchId: string, teamId: string): {
    score: number;
    isOptimistic: boolean;
    updateScore: (delta: number, playerAction?: {
        playerId: string;
        action: "cup" | "bounce" | "miss";
    }) => void;
};
export declare function useTournamentNotifications(tournamentId: string): void;
