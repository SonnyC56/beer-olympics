export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  url?: string;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface SubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  tournamentIds: string[];
  preferences: {
    gameStart: boolean;
    gameEnd: boolean;
    scoreUpdates: boolean;
    leaderboardChanges: boolean;
    tournamentUpdates: boolean;
    teamMessages: boolean;
  };
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  private swRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.initializeServiceWorker();
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Initialize service worker
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // Update on new version
        this.swRegistration.addEventListener('updatefound', () => {
          console.log('New Service Worker version available');
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission denied');
    }

    return permission;
  }

  // Subscribe to push notifications
  async subscribe(preferences?: Partial<SubscriptionData['preferences']>): Promise<SubscriptionData | null> {
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

      const subscriptionData: SubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
        },
        tournamentIds: [],
        preferences: {
          gameStart: true,
          gameEnd: true,
          scoreUpdates: true,
          leaderboardChanges: true,
          tournamentUpdates: true,
          teamMessages: true,
          ...preferences,
        },
      };

      // Store subscription locally
      this.storeSubscription(subscriptionData);

      console.log('Push subscription successful');
      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
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
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  // Get current subscription
  async getSubscription(): Promise<SubscriptionData | null> {
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
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
      },
      tournamentIds: [],
      preferences: {
        gameStart: true,
        gameEnd: true,
        scoreUpdates: true,
        leaderboardChanges: true,
        tournamentUpdates: true,
        teamMessages: true,
      },
    } : null;
  }

  // Subscribe to tournament notifications
  async subscribeToTournament(tournamentId: string): Promise<void> {
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
  async unsubscribeFromTournament(tournamentId: string): Promise<void> {
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
  async updatePreferences(preferences: Partial<SubscriptionData['preferences']>): Promise<void> {
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
  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
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
  async notifyGameStart(tournamentId: string, matchId: string, teams: string[]): Promise<void> {
    const subscription = await this.getSubscription();
    if (!subscription?.preferences.gameStart) return;

    await this.sendLocalNotification({
      title: '🏁 Game Starting!',
      body: `${teams.join(' vs ')} - Get ready to play!`,
      tag: `game-start-${matchId}`,
      data: { tournamentId, matchId, type: 'game-start' },
      actions: [
        { action: 'view', title: 'Watch Game' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });
  }

  async notifyScoreUpdate(tournamentId: string, teamName: string, score: number): Promise<void> {
    const subscription = await this.getSubscription();
    if (!subscription?.preferences.scoreUpdates) return;

    await this.sendLocalNotification({
      title: '🎯 Score Update',
      body: `${teamName} scored! Current score: ${score}`,
      tag: `score-${tournamentId}`,
      data: { tournamentId, type: 'score-update' },
      requireInteraction: false,
    });
  }

  async notifyLeaderboardChange(tournamentId: string, changes: Array<{ team: string; oldRank: number; newRank: number }>): Promise<void> {
    const subscription = await this.getSubscription();
    if (!subscription?.preferences.leaderboardChanges) return;

    const message = changes.length === 1 
      ? `${changes[0].team} moved from #${changes[0].oldRank} to #${changes[0].newRank}!`
      : `${changes.length} teams changed positions!`;

    await this.sendLocalNotification({
      title: '📊 Leaderboard Update',
      body: message,
      tag: `leaderboard-${tournamentId}`,
      data: { tournamentId, type: 'leaderboard-update', changes },
      actions: [
        { action: 'view', title: 'View Leaderboard' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });
  }

  async notifyTournamentComplete(tournamentId: string, winner: string): Promise<void> {
    const subscription = await this.getSubscription();
    if (!subscription?.preferences.tournamentUpdates) return;

    await this.sendLocalNotification({
      title: '🏆 Tournament Complete!',
      body: `Congratulations to ${winner} for winning!`,
      tag: `tournament-complete-${tournamentId}`,
      data: { tournamentId, type: 'tournament-complete', winner },
      actions: [
        { action: 'view', title: 'View Results' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      requireInteraction: true,
    });
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
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

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private storeSubscription(subscription: SubscriptionData): void {
    localStorage.setItem('push-subscription', JSON.stringify(subscription));
  }

  private getStoredSubscription(): SubscriptionData | null {
    const stored = localStorage.getItem('push-subscription');
    return stored ? JSON.parse(stored) : null;
  }

  private removeStoredSubscription(): void {
    localStorage.removeItem('push-subscription');
  }

  // Send subscription to server (placeholder for production implementation)
  private async sendSubscriptionToServer(subscription: SubscriptionData): Promise<void> {
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