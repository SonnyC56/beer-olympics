export class PushNotificationService {
    constructor() {
        Object.defineProperty(this, "vapidPublicKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: import.meta.env.VITE_VAPID_PUBLIC_KEY
        });
        Object.defineProperty(this, "swRegistration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "notificationQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "isProcessingQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.initializeServiceWorker();
        this.startQueueProcessor();
    }
    static getInstance() {
        if (!PushNotificationService.instance) {
            PushNotificationService.instance = new PushNotificationService();
        }
        return PushNotificationService.instance;
    }
    // Initialize service worker
    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully');
                // Update on new version
                this.swRegistration.addEventListener('updatefound', () => {
                    console.log('New Service Worker version available');
                });
            }
            catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }
    // Check if notifications are supported
    isSupported() {
        return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    }
    // Get current permission status
    getPermissionStatus() {
        return Notification.permission;
    }
    // Request notification permission
    async requestPermission() {
        if (!this.isSupported()) {
            throw new Error('Push notifications are not supported');
        }
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted');
        }
        else {
            console.log('Notification permission denied');
        }
        return permission;
    }
    // Subscribe to push notifications
    async subscribe(preferences) {
        if (!this.swRegistration) {
            await this.initializeServiceWorker();
        }
        if (!this.swRegistration || !this.vapidPublicKey) {
            throw new Error('Service worker or VAPID key not available');
        }
        const permission = await this.requestPermission();
        if (permission !== 'granted') {
            return null;
        }
        try {
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
            });
            const subscriptionData = {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
                    auth: this.arrayBufferToBase64(subscription.getKey('auth')),
                },
                tournamentIds: [],
                preferences: {
                    gameStart: true,
                    gameEnd: true,
                    scoreUpdates: true,
                    leaderboardChanges: true,
                    tournamentUpdates: true,
                    teamMessages: true,
                    yourTurn: true,
                    announcements: true,
                    reminders: true,
                    achievements: true,
                    ...preferences,
                },
                doNotDisturb: {
                    enabled: false,
                    duringMatches: true,
                    exceptions: ['your-turn', 'game-start'],
                },
            };
            // Store subscription locally
            this.storeSubscription(subscriptionData);
            console.log('Push subscription successful');
            return subscriptionData;
        }
        catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            throw error;
        }
    }
    // Unsubscribe from push notifications
    async unsubscribe() {
        if (!this.swRegistration) {
            return false;
        }
        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                this.removeStoredSubscription();
                console.log('Push subscription cancelled');
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Failed to unsubscribe from push notifications:', error);
            throw error;
        }
    }
    // Get current subscription
    async getSubscription() {
        const stored = this.getStoredSubscription();
        if (stored) {
            return stored;
        }
        if (!this.swRegistration) {
            return null;
        }
        const subscription = await this.swRegistration.pushManager.getSubscription();
        return subscription ? {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
                auth: this.arrayBufferToBase64(subscription.getKey('auth')),
            },
            tournamentIds: [],
            preferences: {
                gameStart: true,
                gameEnd: true,
                scoreUpdates: true,
                leaderboardChanges: true,
                tournamentUpdates: true,
                teamMessages: true,
                yourTurn: true,
                announcements: true,
                reminders: true,
                achievements: true,
            },
            doNotDisturb: {
                enabled: false,
                duringMatches: true,
                exceptions: ['your-turn', 'game-start'],
            },
        } : null;
    }
    // Subscribe to tournament notifications
    async subscribeToTournament(tournamentId) {
        const subscription = await this.getSubscription();
        if (!subscription) {
            throw new Error('No active push subscription');
        }
        if (!subscription.tournamentIds.includes(tournamentId)) {
            subscription.tournamentIds.push(tournamentId);
            this.storeSubscription(subscription);
            // Send to server (in production)
            await this.sendSubscriptionToServer(subscription);
        }
    }
    // Unsubscribe from tournament notifications
    async unsubscribeFromTournament(tournamentId) {
        const subscription = await this.getSubscription();
        if (!subscription) {
            return;
        }
        subscription.tournamentIds = subscription.tournamentIds.filter(id => id !== tournamentId);
        this.storeSubscription(subscription);
        // Update server (in production)
        await this.sendSubscriptionToServer(subscription);
    }
    // Update notification preferences
    async updatePreferences(preferences) {
        const subscription = await this.getSubscription();
        if (!subscription) {
            throw new Error('No active push subscription');
        }
        subscription.preferences = { ...subscription.preferences, ...preferences };
        this.storeSubscription(subscription);
        // Update server (in production)
        await this.sendSubscriptionToServer(subscription);
    }
    // Send local notification (for testing)
    async sendLocalNotification(payload) {
        if (!this.swRegistration) {
            throw new Error('Service worker not available');
        }
        // For testing, we can trigger a local notification
        await this.swRegistration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/icon-72x72.png',
            tag: payload.tag || 'beer-olympics',
            data: payload.data,
            // @ts-expect-error actions not in NotificationOptions type
            actions: payload.actions,
            requireInteraction: payload.requireInteraction,
        });
    }
    // Tournament-specific notification helpers
    async notifyGameStart(tournamentId, matchId, teams) {
        const subscription = await this.getSubscription();
        if (!subscription?.preferences.gameStart)
            return;
        await this.queueNotification({
            title: '🏁 Game Starting!',
            body: `${teams.join(' vs ')} - Get ready to play!`,
            tag: `game-start-${matchId}`,
            data: { tournamentId, matchId, type: 'game-start' },
            actions: [
                { action: 'view', title: 'Watch Game' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
            priority: 'urgent',
            vibrate: [200, 100, 200],
            sound: '/sounds/game-start.mp3',
        });
    }
    // "You're up next" notification - CRITICAL
    async notifyYourTurn(tournamentId, matchId, playerName, gameName, timeUntil) {
        const subscription = await this.getSubscription();
        if (!subscription?.preferences.yourTurn)
            return;
        const timeMessage = timeUntil ? ` in ${timeUntil} minutes` : ' now';
        await this.queueNotification({
            title: '🎯 You\'re Up Next!',
            body: `${playerName}, get ready for ${gameName}${timeMessage}!`,
            tag: `your-turn-${matchId}`,
            data: { tournamentId, matchId, type: 'your-turn' },
            actions: [
                { action: 'ready', title: 'I\'m Ready!' },
                { action: 'delay', title: 'Need 5 min' },
            ],
            priority: 'urgent',
            requireInteraction: true,
            vibrate: [500, 250, 500, 250, 500],
            sound: '/sounds/your-turn.mp3',
        });
        // Send SMS if enabled for critical notifications
        if (subscription.smsEnabled && subscription.phoneNumber) {
            await this.sendSMS(subscription.phoneNumber, `Beer Olympics: You're up next for ${gameName}${timeMessage}!`);
        }
    }
    // Tournament announcements
    async notifyAnnouncement(tournamentId, title, message, priority = 'normal') {
        const subscription = await this.getSubscription();
        if (!subscription?.preferences.announcements)
            return;
        await this.queueNotification({
            title: `📢 ${title}`,
            body: message,
            tag: `announcement-${tournamentId}-${Date.now()}`,
            data: { tournamentId, type: 'announcement' },
            priority,
            vibrate: priority === 'urgent' ? [300, 100, 300] : [200],
            sound: priority === 'urgent' ? '/sounds/announcement-urgent.mp3' : '/sounds/announcement.mp3',
        });
    }
    // Reminder notifications
    async notifyReminder(tournamentId, message, matchId) {
        const subscription = await this.getSubscription();
        if (!subscription?.preferences.reminders)
            return;
        await this.queueNotification({
            title: '⏰ Reminder',
            body: message,
            tag: `reminder-${matchId || tournamentId}`,
            data: { tournamentId, matchId, type: 'reminder' },
            priority: 'normal',
            vibrate: [100, 50, 100],
        });
    }
    // Achievement notifications
    async notifyAchievement(tournamentId, playerName, achievement, description) {
        const subscription = await this.getSubscription();
        if (!subscription?.preferences.achievements)
            return;
        await this.queueNotification({
            title: `🏆 ${achievement} Unlocked!`,
            body: `${playerName} ${description}`,
            tag: `achievement-${tournamentId}-${Date.now()}`,
            data: { tournamentId, type: 'achievement' },
            priority: 'info',
            vibrate: [100, 100, 100],
            sound: '/sounds/achievement.mp3',
            image: '/images/achievements/badge.png',
        });
    }
    async notifyScoreUpdate(tournamentId, teamName, score) {
        const subscription = await this.getSubscription();
        if (!subscription?.preferences.scoreUpdates)
            return;
        await this.queueNotification({
            title: '🎯 Score Update',
            body: `${teamName} scored! Current score: ${score}`,
            tag: `score-${tournamentId}`,
            data: { tournamentId, type: 'score-update' },
            requireInteraction: false,
            priority: 'normal',
            vibrate: [100],
        });
    }
    async notifyLeaderboardChange(tournamentId, changes) {
        const subscription = await this.getSubscription();
        if (!subscription?.preferences.leaderboardChanges)
            return;
        const message = changes.length === 1
            ? `${changes[0].team} moved from #${changes[0].oldRank} to #${changes[0].newRank}!`
            : `${changes.length} teams changed positions!`;
        await this.queueNotification({
            title: '📊 Leaderboard Update',
            body: message,
            tag: `leaderboard-${tournamentId}`,
            data: { tournamentId, type: 'leaderboard-update', changes },
            actions: [
                { action: 'view', title: 'View Leaderboard' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
            priority: 'info',
            vibrate: [50, 50],
        });
    }
    async notifyTournamentComplete(tournamentId, winner) {
        const subscription = await this.getSubscription();
        if (!subscription?.preferences.tournamentUpdates)
            return;
        await this.queueNotification({
            title: '🏆 Tournament Complete!',
            body: `Congratulations to ${winner} for winning!`,
            tag: `tournament-complete-${tournamentId}`,
            data: { tournamentId, type: 'tournament-complete', winner },
            actions: [
                { action: 'view', title: 'View Results' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
            requireInteraction: true,
            priority: 'urgent',
            vibrate: [200, 100, 200, 100, 200],
            sound: '/sounds/tournament-complete.mp3',
        });
    }
    // Do Not Disturb management
    async updateDoNotDisturb(settings) {
        const subscription = await this.getSubscription();
        if (!subscription) {
            throw new Error('No active push subscription');
        }
        subscription.doNotDisturb = { ...subscription.doNotDisturb, ...settings };
        this.storeSubscription(subscription);
        await this.sendSubscriptionToServer(subscription);
    }
    // Check if notifications should be sent based on DND settings
    shouldSendNotification(type) {
        const subscription = this.getStoredSubscription();
        if (!subscription?.doNotDisturb?.enabled)
            return true;
        const dnd = subscription.doNotDisturb;
        // Check if this notification type is an exception
        if (dnd.exceptions?.includes(type))
            return true;
        // Check time-based DND
        if (dnd.startTime && dnd.endTime) {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            if (dnd.startTime <= dnd.endTime) {
                // Normal case: DND during the day (e.g., 09:00 to 17:00)
                if (currentTime >= dnd.startTime && currentTime <= dnd.endTime)
                    return false;
            }
            else {
                // Overnight case: DND overnight (e.g., 22:00 to 06:00)
                if (currentTime >= dnd.startTime || currentTime <= dnd.endTime)
                    return false;
            }
        }
        // Check if DND during matches
        if (dnd.duringMatches) {
            // This would check if user is currently in a match
            // Implementation depends on tournament state management
        }
        return true;
    }
    // Queue notification for processing
    async queueNotification(payload) {
        const type = (payload.data?.type || 'general');
        if (!this.shouldSendNotification(type)) {
            console.log('Notification blocked by DND settings:', type);
            return;
        }
        this.notificationQueue.push(payload);
        this.processQueue();
    }
    // Process notification queue
    startQueueProcessor() {
        setInterval(() => {
            if (this.notificationQueue.length > 0 && !this.isProcessingQueue) {
                this.processQueue();
            }
        }, 1000);
    }
    async processQueue() {
        if (this.isProcessingQueue || this.notificationQueue.length === 0)
            return;
        this.isProcessingQueue = true;
        try {
            while (this.notificationQueue.length > 0) {
                const notification = this.notificationQueue.shift();
                // Apply priority-based delays
                if (notification.priority === 'info') {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                else if (notification.priority === 'normal') {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                // Urgent notifications are sent immediately
                await this.sendLocalNotification(notification);
            }
        }
        finally {
            this.isProcessingQueue = false;
        }
    }
    // SMS integration for critical notifications
    async sendSMS(phoneNumber, message) {
        // This would integrate with an SMS service like Twilio
        console.log('Would send SMS to', phoneNumber, ':', message);
        // Example implementation:
        /*
        await fetch('/api/sms/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber, message }),
        });
        */
    }
    // Enable SMS notifications
    async enableSMS(phoneNumber) {
        const subscription = await this.getSubscription();
        if (!subscription) {
            throw new Error('No active push subscription');
        }
        subscription.smsEnabled = true;
        subscription.phoneNumber = phoneNumber;
        this.storeSubscription(subscription);
        await this.sendSubscriptionToServer(subscription);
    }
    // Disable SMS notifications
    async disableSMS() {
        const subscription = await this.getSubscription();
        if (!subscription)
            return;
        subscription.smsEnabled = false;
        subscription.phoneNumber = undefined;
        this.storeSubscription(subscription);
        await this.sendSubscriptionToServer(subscription);
    }
    // Utility methods
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    storeSubscription(subscription) {
        localStorage.setItem('push-subscription', JSON.stringify(subscription));
    }
    getStoredSubscription() {
        const stored = localStorage.getItem('push-subscription');
        return stored ? JSON.parse(stored) : null;
    }
    removeStoredSubscription() {
        localStorage.removeItem('push-subscription');
    }
    // Send subscription to server (placeholder for production implementation)
    async sendSubscriptionToServer(subscription) {
        // In production, this would send the subscription to your backend
        console.log('Would send subscription to server:', subscription);
        // Example implementation:
        /*
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });
        */
    }
}
export const pushNotificationService = PushNotificationService.getInstance();
