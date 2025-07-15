import { type RealtimeChannel } from '../services/realtime';
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
export declare function useRealtime(): {
    subscribe: (channelName: string) => RealtimeChannel | null;
    unsubscribe: (channelName: string) => void;
    bind: <K extends keyof TournamentEvents>(channelName: string, event: K, callback: (data: TournamentEvents[K]) => void) => () => void;
    isConnected: () => boolean;
    service: import("../services/realtime").RealtimeService;
};
export declare function useTournamentUpdates(tournamentId: string | undefined, handlers: {
    onScoreUpdate?: (data: TournamentEvents['score-update']) => void;
    onMatchComplete?: (data: TournamentEvents['match-complete']) => void;
    onTeamJoined?: (data: TournamentEvents['team-joined']) => void;
    onStatusChange?: (data: TournamentEvents['tournament-status']) => void;
}): {
    isConnected: boolean;
};
