import { useEffect, useRef, useCallback } from 'react';
import { getPusherClient } from '../services/pusher';
import type { Channel } from 'pusher-js';

// Type definition for Pusher events
interface PusherEvents {
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

export function usePusher() {
  const pusherRef = useRef(getPusherClient());
  const channelsRef = useRef<Map<string, Channel>>(new Map());

  useEffect(() => {
    return () => {
      // Cleanup all channels on unmount
      channelsRef.current.forEach((channel) => {
        channel.unbind_all();
        pusherRef.current?.unsubscribe(channel.name);
      });
    };
  }, []);

  const subscribe = useCallback((channelName: string) => {
    if (!pusherRef.current) {
      console.warn('Pusher client not available');
      return null;
    }

    // Check if already subscribed
    const existing = channelsRef.current.get(channelName);
    if (existing) {
      return existing;
    }

    // Subscribe to channel
    const channel = pusherRef.current.subscribe(channelName);
    channelsRef.current.set(channelName, channel);
    
    return channel;
  }, []);

  const unsubscribe = useCallback((channelName: string) => {
    const channel = channelsRef.current.get(channelName);
    if (channel) {
      channel.unbind_all();
      pusherRef.current?.unsubscribe(channelName);
      channelsRef.current.delete(channelName);
    }
  }, []);

  const bind = useCallback(<K extends keyof PusherEvents>(
    channelName: string,
    event: K,
    callback: (data: PusherEvents[K]) => void
  ) => {
    const channel = subscribe(channelName);
    if (channel) {
      channel.bind(event, callback);
    }

    // Return cleanup function
    return () => {
      channel?.unbind(event, callback);
    };
  }, [subscribe]);

  return {
    subscribe,
    unsubscribe,
    bind,
    pusher: pusherRef.current,
  };
}

// Hook for tournament-specific events
export function useTournamentUpdates(
  tournamentId: string | undefined,
  handlers: {
    onScoreUpdate?: (data: PusherEvents['score-update']) => void;
    onMatchComplete?: (data: PusherEvents['match-complete']) => void;
    onTeamJoined?: (data: PusherEvents['team-joined']) => void;
    onStatusChange?: (data: PusherEvents['tournament-status']) => void;
  }
) {
  const { bind } = usePusher();

  useEffect(() => {
    if (!tournamentId) return;

    const channelName = `tournament-${tournamentId}`;
    const cleanups: (() => void)[] = [];

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
  }, [tournamentId, bind, handlers]);
}