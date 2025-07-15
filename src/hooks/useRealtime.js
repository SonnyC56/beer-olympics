import { useEffect, useRef, useCallback } from 'react';
import { realtimeService } from '../services/realtime';
export function useRealtime() {
    const channelsRef = useRef(new Map());
    useEffect(() => {
        return () => {
            // Cleanup all channels on unmount
            channelsRef.current.forEach((_, channelName) => {
                realtimeService.unsubscribe(channelName);
            });
            channelsRef.current.clear();
        };
    }, []);
    const subscribe = useCallback((channelName) => {
        // Check if already subscribed
        const existing = channelsRef.current.get(channelName);
        if (existing) {
            return existing;
        }
        // Subscribe to channel
        const channel = realtimeService.subscribe(channelName);
        if (channel) {
            channelsRef.current.set(channelName, channel);
        }
        return channel;
    }, []);
    const unsubscribe = useCallback((channelName) => {
        const channel = channelsRef.current.get(channelName);
        if (channel) {
            realtimeService.unsubscribe(channelName);
            channelsRef.current.delete(channelName);
        }
    }, []);
    const bind = useCallback((channelName, event, callback) => {
        const channel = subscribe(channelName);
        if (!channel) {
            // Return no-op cleanup function
            return () => { };
        }
        const cleanup = channel.bind(event, callback);
        // Return cleanup function
        return cleanup;
    }, [subscribe]);
    const isConnected = useCallback(() => {
        return realtimeService.isConnected();
    }, []);
    return {
        subscribe,
        unsubscribe,
        bind,
        isConnected,
        service: realtimeService,
    };
}
// Hook for tournament-specific events - completely safe to use
export function useTournamentUpdates(tournamentId, handlers) {
    const { bind, isConnected } = useRealtime();
    useEffect(() => {
        // Skip if no tournament ID
        if (!tournamentId) {
            return;
        }
        const channelName = `tournament-${tournamentId}`;
        const cleanups = [];
        // Log connection status
        console.log(`Tournament updates for ${tournamentId}:`, {
            connected: isConnected(),
            channelName
        });
        if (handlers.onScoreUpdate) {
            cleanups.push(bind(channelName, 'score-update', handlers.onScoreUpdate));
        }
        if (handlers.onMatchComplete) {
            cleanups.push(bind(channelName, 'match-complete', handlers.onMatchComplete));
        }
        if (handlers.onTeamJoined) {
            cleanups.push(bind(channelName, 'team-joined', handlers.onTeamJoined));
        }
        if (handlers.onStatusChange) {
            cleanups.push(bind(channelName, 'tournament-status', handlers.onStatusChange));
        }
        return () => {
            cleanups.forEach((cleanup) => cleanup());
        };
    }, [tournamentId, bind, isConnected, handlers]);
    // Return connection status for UI feedback
    return {
        isConnected: isConnected(),
    };
}
