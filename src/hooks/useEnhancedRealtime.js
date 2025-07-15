import { useEffect, useRef, useCallback, useState } from 'react';
import { enhancedRealtimeService, isEnhancedRealtimeService } from '../services/realtime-enhanced';
import { toast } from 'sonner';
export function useEnhancedRealtime() {
    const channelsRef = useRef(new Map());
    const presenceChannelsRef = useRef(new Map());
    const [connectionState, setConnectionState] = useState({
        state: 'disconnected',
        retryCount: 0
    });
    const [metrics, setMetrics] = useState(null);
    useEffect(() => {
        // Auto-connect if enhanced service
        if (isEnhancedRealtimeService(enhancedRealtimeService)) {
            enhancedRealtimeService.connect().catch(console.error);
            // Monitor connection state
            const unsubState = enhancedRealtimeService.onConnectionStateChange(setConnectionState);
            // Update metrics periodically
            const metricsInterval = setInterval(() => {
                setMetrics(enhancedRealtimeService.getMetrics());
            }, 5000);
            return () => {
                unsubState();
                clearInterval(metricsInterval);
                // Cleanup all channels
                channelsRef.current.forEach((_, channelName) => {
                    enhancedRealtimeService.unsubscribe(channelName);
                });
                presenceChannelsRef.current.forEach((_, channelName) => {
                    enhancedRealtimeService.unsubscribe(channelName);
                });
                channelsRef.current.clear();
                presenceChannelsRef.current.clear();
            };
        }
        return () => {
            // Cleanup for basic service
            channelsRef.current.forEach((_, channelName) => {
                enhancedRealtimeService.unsubscribe(channelName);
            });
            channelsRef.current.clear();
        };
    }, []);
    const subscribe = useCallback((channelName) => {
        const existing = channelsRef.current.get(channelName);
        if (existing)
            return existing;
        const channel = enhancedRealtimeService.subscribe(channelName);
        if (channel) {
            channelsRef.current.set(channelName, channel);
        }
        return channel;
    }, []);
    const subscribePresence = useCallback((channelName) => {
        if (!isEnhancedRealtimeService(enhancedRealtimeService)) {
            console.warn('Presence channels not available');
            return null;
        }
        const existing = presenceChannelsRef.current.get(channelName);
        if (existing)
            return existing;
        const channel = enhancedRealtimeService.subscribePresence(channelName);
        if (channel) {
            presenceChannelsRef.current.set(channelName, channel);
        }
        return channel;
    }, []);
    const unsubscribe = useCallback((channelName) => {
        const channel = channelsRef.current.get(channelName) ||
            presenceChannelsRef.current.get(channelName);
        if (channel) {
            enhancedRealtimeService.unsubscribe(channelName);
            channelsRef.current.delete(channelName);
            presenceChannelsRef.current.delete(channelName);
        }
    }, []);
    const bind = useCallback((channelName, event, callback) => {
        const channel = subscribe(channelName);
        if (!channel)
            return () => { };
        return channel.bind(event, callback);
    }, [subscribe]);
    const trigger = useCallback((channelName, event, data) => {
        const channel = subscribe(channelName);
        if (!channel)
            return;
        channel.trigger(event, data);
    }, [subscribe]);
    const getLatency = useCallback(() => {
        if (isEnhancedRealtimeService(enhancedRealtimeService)) {
            return enhancedRealtimeService.getLatency();
        }
        return 0;
    }, []);
    return {
        subscribe,
        subscribePresence,
        unsubscribe,
        bind,
        trigger,
        isConnected: enhancedRealtimeService.isConnected(),
        connectionState,
        metrics,
        getLatency,
        service: enhancedRealtimeService,
    };
}
// Enhanced tournament updates hook with more features
export function useEnhancedTournamentUpdates(tournamentId, handlers) {
    const { bind, subscribePresence, connectionState, metrics, getLatency } = useEnhancedRealtime();
    const [activeUsers, setActiveUsers] = useState(new Map());
    useEffect(() => {
        if (!tournamentId)
            return;
        const channelName = `tournament-${tournamentId}`;
        const presenceChannelName = `presence-tournament-${tournamentId}`;
        const cleanups = [];
        // Bind to all events
        Object.entries(handlers).forEach(([key, handler]) => {
            if (handler && key.startsWith('on')) {
                const eventName = key.replace(/^on/, '').replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);
                cleanups.push(bind(channelName, eventName, handler));
            }
        });
        // Subscribe to presence channel for active users
        const presenceChannel = subscribePresence(presenceChannelName);
        if (presenceChannel) {
            setActiveUsers(presenceChannel.getMembers());
            cleanups.push(presenceChannel.onMemberAdded((member) => {
                setActiveUsers(prev => new Map(prev).set(member.id, member));
                // Show notification for new viewer
                if (handlers.onNotification) {
                    handlers.onNotification({
                        tournamentId,
                        type: 'info',
                        title: 'New viewer',
                        message: `${member.info?.name || 'Someone'} is now watching`,
                    });
                }
            }));
            cleanups.push(presenceChannel.onMemberRemoved((member) => {
                setActiveUsers(prev => {
                    const next = new Map(prev);
                    next.delete(member.id);
                    return next;
                });
            }));
        }
        // Show connection status
        if (connectionState.state === 'connected') {
            toast.success('Connected to live updates', {
                description: `Latency: ${getLatency()}ms`,
            });
        }
        else if (connectionState.state === 'failed') {
            toast.error('Failed to connect to live updates', {
                description: connectionState.error?.message,
            });
        }
        return () => {
            cleanups.forEach(cleanup => cleanup());
        };
    }, [tournamentId, bind, subscribePresence, connectionState, getLatency]);
    return {
        isConnected: connectionState.state === 'connected',
        connectionState,
        metrics,
        activeUsers: Array.from(activeUsers.values()),
        latency: getLatency(),
    };
}
// Hook for live scoring with optimistic updates
export function useLiveScoring(tournamentId, matchId, teamId) {
    const { bind, trigger } = useEnhancedRealtime();
    const [optimisticScore, setOptimisticScore] = useState(null);
    const [confirmedScore, setConfirmedScore] = useState(0);
    useEffect(() => {
        const channelName = `tournament-${tournamentId}`;
        // Listen for confirmed score updates
        const cleanup = bind(channelName, 'live-score', (data) => {
            if (data.matchId === matchId && data.teamId === teamId) {
                setConfirmedScore(data.score);
                setOptimisticScore(null); // Clear optimistic update
            }
        });
        return cleanup;
    }, [tournamentId, matchId, teamId, bind]);
    const updateScore = useCallback((delta, playerAction) => {
        const newScore = (optimisticScore ?? confirmedScore) + delta;
        setOptimisticScore(newScore);
        // Send update
        trigger(`tournament-${tournamentId}`, 'live-score', {
            tournamentId,
            matchId,
            teamId,
            score: newScore,
            delta,
            timestamp: Date.now(),
            playerAction,
        });
    }, [tournamentId, matchId, teamId, confirmedScore, optimisticScore, trigger]);
    return {
        score: optimisticScore ?? confirmedScore,
        isOptimistic: optimisticScore !== null,
        updateScore,
    };
}
// Hook for tournament notifications
export function useTournamentNotifications(tournamentId) {
    const { bind } = useEnhancedRealtime();
    useEffect(() => {
        const cleanup = bind(`tournament-${tournamentId}`, 'notification', (data) => {
            // Show toast based on notification type
            const toastFn = {
                info: toast.info,
                warning: toast.warning,
                success: toast.success,
                error: toast.error,
            }[data.type];
            toastFn(data.title, {
                description: data.message,
                duration: 5000,
            });
        });
        return cleanup;
    }, [tournamentId, bind]);
}
