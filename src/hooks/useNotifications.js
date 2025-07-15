import { useState, useEffect, useCallback, useRef } from 'react';
import { pushNotificationService } from '../services/push-notifications';
export const useNotifications = (options = {}) => {
    const { tournamentId, userId } = options;
    const [state, setState] = useState({
        isSupported: false,
        permission: 'default',
        subscription: null,
        isLoading: false,
        error: null,
        unreadCount: 0,
    });
    const notificationHandlerRef = useRef(null);
    // Initialize notification state
    useEffect(() => {
        const init = async () => {
            const isSupported = pushNotificationService.isSupported();
            const permission = pushNotificationService.getPermissionStatus();
            const subscription = await pushNotificationService.getSubscription();
            setState(prev => ({
                ...prev,
                isSupported,
                permission,
                subscription,
            }));
            // Load unread count from localStorage
            const history = localStorage.getItem('notification-history');
            if (history) {
                const notifications = JSON.parse(history);
                const unreadCount = notifications.filter((n) => !n.read).length;
                setState(prev => ({ ...prev, unreadCount }));
            }
        };
        init();
    }, []);
    // Listen for notification events
    useEffect(() => {
        if (!state.isSupported)
            return;
        const handleNotification = (event) => {
            const customEvent = event;
            // Store notification in history
            const history = JSON.parse(localStorage.getItem('notification-history') || '[]');
            history.unshift({
                id: Date.now().toString(),
                type: customEvent.detail.data?.type || 'general',
                title: customEvent.detail.title,
                body: customEvent.detail.body,
                timestamp: new Date().toISOString(),
                read: false,
            });
            // Keep only last 100 notifications
            if (history.length > 100) {
                history.splice(100);
            }
            localStorage.setItem('notification-history', JSON.stringify(history));
            // Update unread count
            setState(prev => ({ ...prev, unreadCount: prev.unreadCount + 1 }));
        };
        notificationHandlerRef.current = handleNotification;
        window.addEventListener('notification', handleNotification);
        return () => {
            if (notificationHandlerRef.current) {
                window.removeEventListener('notification', notificationHandlerRef.current);
            }
        };
    }, [state.isSupported]);
    // Request notification permission
    const requestPermission = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const permission = await pushNotificationService.requestPermission();
            setState(prev => ({ ...prev, permission }));
            if (permission === 'granted') {
                const subscription = await pushNotificationService.subscribe();
                setState(prev => ({ ...prev, subscription }));
                // Subscribe to tournament if provided
                if (subscription && tournamentId) {
                    await pushNotificationService.subscribeToTournament(tournamentId);
                }
            }
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to enable notifications'
            }));
        }
        finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [tournamentId]);
    // Subscribe to tournament
    const subscribeToTournament = useCallback(async (id) => {
        if (!state.subscription)
            return;
        try {
            await pushNotificationService.subscribeToTournament(id);
        }
        catch (error) {
            console.error('Failed to subscribe to tournament:', error);
        }
    }, [state.subscription]);
    // Unsubscribe from tournament
    const unsubscribeFromTournament = useCallback(async (id) => {
        if (!state.subscription)
            return;
        try {
            await pushNotificationService.unsubscribeFromTournament(id);
        }
        catch (error) {
            console.error('Failed to unsubscribe from tournament:', error);
        }
    }, [state.subscription]);
    // Update notification preferences
    const updatePreferences = useCallback(async (preferences) => {
        if (!state.subscription)
            return;
        try {
            await pushNotificationService.updatePreferences(preferences);
            const updatedSubscription = await pushNotificationService.getSubscription();
            setState(prev => ({ ...prev, subscription: updatedSubscription }));
        }
        catch (error) {
            console.error('Failed to update preferences:', error);
        }
    }, [state.subscription]);
    // Update Do Not Disturb settings
    const updateDoNotDisturb = useCallback(async (settings) => {
        if (!state.subscription)
            return;
        try {
            await pushNotificationService.updateDoNotDisturb(settings);
            const updatedSubscription = await pushNotificationService.getSubscription();
            setState(prev => ({ ...prev, subscription: updatedSubscription }));
        }
        catch (error) {
            console.error('Failed to update DND settings:', error);
        }
    }, [state.subscription]);
    // Enable SMS notifications
    const enableSMS = useCallback(async (phoneNumber) => {
        if (!state.subscription)
            return;
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await pushNotificationService.enableSMS(phoneNumber);
            const updatedSubscription = await pushNotificationService.getSubscription();
            setState(prev => ({ ...prev, subscription: updatedSubscription }));
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to enable SMS'
            }));
        }
        finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [state.subscription]);
    // Disable SMS notifications
    const disableSMS = useCallback(async () => {
        if (!state.subscription)
            return;
        try {
            await pushNotificationService.disableSMS();
            const updatedSubscription = await pushNotificationService.getSubscription();
            setState(prev => ({ ...prev, subscription: updatedSubscription }));
        }
        catch (error) {
            console.error('Failed to disable SMS:', error);
        }
    }, [state.subscription]);
    // Send notifications (for testing or manual triggers)
    const sendNotification = useCallback(async (type, data) => {
        if (!state.subscription || !tournamentId)
            return;
        try {
            switch (type) {
                case 'your-turn':
                    await pushNotificationService.notifyYourTurn(tournamentId, data.matchId, data.playerName, data.gameName, data.timeUntil);
                    break;
                case 'game-start':
                    await pushNotificationService.notifyGameStart(tournamentId, data.matchId, data.teams);
                    break;
                case 'score-update':
                    await pushNotificationService.notifyScoreUpdate(tournamentId, data.teamName, data.score);
                    break;
                case 'leaderboard-change':
                    await pushNotificationService.notifyLeaderboardChange(tournamentId, data.changes);
                    break;
                case 'tournament-update':
                    if (data.complete) {
                        await pushNotificationService.notifyTournamentComplete(tournamentId, data.winner);
                    }
                    break;
                case 'announcement':
                    await pushNotificationService.notifyAnnouncement(tournamentId, data.title, data.message, data.priority);
                    break;
                case 'reminder':
                    await pushNotificationService.notifyReminder(tournamentId, data.message, data.matchId);
                    break;
                case 'achievement':
                    await pushNotificationService.notifyAchievement(tournamentId, data.playerName, data.achievement, data.description);
                    break;
            }
        }
        catch (error) {
            console.error('Failed to send notification:', error);
        }
    }, [state.subscription, tournamentId]);
    // Mark notifications as read
    const markAsRead = useCallback((notificationIds) => {
        const history = JSON.parse(localStorage.getItem('notification-history') || '[]');
        if (notificationIds) {
            // Mark specific notifications as read
            history.forEach((n) => {
                if (notificationIds.includes(n.id)) {
                    n.read = true;
                }
            });
        }
        else {
            // Mark all as read
            history.forEach((n) => {
                n.read = true;
            });
        }
        localStorage.setItem('notification-history', JSON.stringify(history));
        setState(prev => ({ ...prev, unreadCount: 0 }));
    }, []);
    // Clear notification history
    const clearHistory = useCallback(() => {
        localStorage.removeItem('notification-history');
        setState(prev => ({ ...prev, unreadCount: 0 }));
    }, []);
    // Test notifications
    const testNotification = useCallback(async () => {
        await pushNotificationService.sendLocalNotification({
            title: '🎯 Test Notification',
            body: 'This is a test notification from Beer Olympics!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'test',
            data: { type: 'test' },
            actions: [
                { action: 'view', title: 'View' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
            vibrate: [200, 100, 200],
        });
    }, []);
    return {
        // State
        isSupported: state.isSupported,
        permission: state.permission,
        subscription: state.subscription,
        isLoading: state.isLoading,
        error: state.error,
        unreadCount: state.unreadCount,
        // Actions
        requestPermission,
        subscribeToTournament,
        unsubscribeFromTournament,
        updatePreferences,
        updateDoNotDisturb,
        enableSMS,
        disableSMS,
        sendNotification,
        markAsRead,
        clearHistory,
        testNotification,
    };
};
