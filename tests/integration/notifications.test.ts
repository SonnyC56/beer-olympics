import { describe, it, expect, beforeEach, afterEach, vi, MockedFunction } from 'vitest';
import { pushNotificationService } from '@/services/push-notifications';
import type { NotificationPayload, SubscriptionData, DoNotDisturbSettings } from '@/services/push-notifications';

// Mock service worker and notification API
const mockServiceWorker = {
  register: vi.fn(),
  addEventListener: vi.fn(),
  pushManager: {
    subscribe: vi.fn(),
    getSubscription: vi.fn(),
  },
  showNotification: vi.fn(),
};

const mockSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
  unsubscribe: vi.fn(),
  getKey: vi.fn((name: string) => {
    if (name === 'p256dh') return new Uint8Array([1, 2, 3, 4]);
    if (name === 'auth') return new Uint8Array([5, 6, 7, 8]);
    return null;
  }),
};

// Mock environment variables
vi.stubEnv('VITE_VAPID_PUBLIC_KEY', 'test-vapid-public-key');

describe('PushNotificationService Integration Tests', () => {
  let originalNavigator: any;
  let originalNotification: any;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    originalLocalStorage = global.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock navigator.serviceWorker
    originalNavigator = global.navigator;
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
      configurable: true,
    });

    // Mock Notification API
    originalNotification = global.Notification;
    Object.defineProperty(window, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
      writable: true,
      configurable: true,
    });

    // Mock PushManager
    Object.defineProperty(window, 'PushManager', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });

    // Setup default mock behaviors
    mockServiceWorker.register.mockResolvedValue({ 
      addEventListener: vi.fn(),
      pushManager: mockServiceWorker.pushManager,
      showNotification: mockServiceWorker.showNotification,
    });
    mockServiceWorker.pushManager.subscribe.mockResolvedValue(mockSubscription);
    mockServiceWorker.pushManager.getSubscription.mockResolvedValue(null);
  });

  afterEach(() => {
    // Restore original objects
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    }
    if (originalNotification) {
      Object.defineProperty(window, 'Notification', {
        value: originalNotification,
        writable: true,
        configurable: true,
      });
    }
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  describe('Service Initialization', () => {
    it('should check if notifications are supported', () => {
      const isSupported = pushNotificationService.isSupported();
      expect(isSupported).toBe(true);
    });

    it('should handle unsupported browsers gracefully', () => {
      // Remove serviceWorker support
      delete (global.navigator as any).serviceWorker;
      
      const isSupported = pushNotificationService.isSupported();
      expect(isSupported).toBe(false);
    });

    it('should get current permission status', () => {
      const permission = pushNotificationService.getPermissionStatus();
      expect(permission).toBe('default');
    });
  });

  describe('Permission Management', () => {
    it('should request notification permission', async () => {
      const permission = await pushNotificationService.requestPermission();
      
      expect(window.Notification.requestPermission).toHaveBeenCalled();
      expect(permission).toBe('granted');
    });

    it('should handle permission denial', async () => {
      (window.Notification.requestPermission as MockedFunction<any>).mockResolvedValue('denied');
      
      const permission = await pushNotificationService.requestPermission();
      expect(permission).toBe('denied');
    });

    it('should throw error when notifications not supported', async () => {
      delete (window as any).Notification;
      
      await expect(pushNotificationService.requestPermission()).rejects.toThrow(
        'Push notifications are not supported'
      );
    });
  });

  describe('Subscription Management', () => {
    it('should subscribe to push notifications', async () => {
      const subscription = await pushNotificationService.subscribe();
      
      expect(mockServiceWorker.pushManager.subscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array),
      });
      
      expect(subscription).toMatchObject({
        endpoint: mockSubscription.endpoint,
        keys: {
          p256dh: expect.any(String),
          auth: expect.any(String),
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
      });
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'push-subscription',
        expect.any(String)
      );
    });

    it('should subscribe with custom preferences', async () => {
      const customPreferences = {
        gameStart: false,
        scoreUpdates: false,
        achievements: true,
      };
      
      const subscription = await pushNotificationService.subscribe(customPreferences);
      
      expect(subscription?.preferences).toMatchObject({
        ...subscription?.preferences,
        ...customPreferences,
      });
    });

    it('should return null when permission denied', async () => {
      (window.Notification.requestPermission as MockedFunction<any>).mockResolvedValue('denied');
      
      const subscription = await pushNotificationService.subscribe();
      expect(subscription).toBeNull();
    });

    it('should unsubscribe from push notifications', async () => {
      // First subscribe
      await pushNotificationService.subscribe();
      
      // Mock existing subscription
      mockServiceWorker.pushManager.getSubscription.mockResolvedValue(mockSubscription);
      mockSubscription.unsubscribe.mockResolvedValue(true);
      
      const result = await pushNotificationService.unsubscribe();
      
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('push-subscription');
      expect(result).toBe(true);
    });

    it('should get current subscription from storage', async () => {
      const storedSubscription: SubscriptionData = {
        endpoint: 'test-endpoint',
        keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
        tournamentIds: ['tournament-1'],
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
      };
      
      (localStorage.getItem as MockedFunction<any>).mockReturnValue(
        JSON.stringify(storedSubscription)
      );
      
      const subscription = await pushNotificationService.getSubscription();
      expect(subscription).toEqual(storedSubscription);
    });
  });

  describe('Tournament Subscription', () => {
    beforeEach(async () => {
      // Setup an active subscription
      await pushNotificationService.subscribe();
    });

    it('should subscribe to tournament notifications', async () => {
      await pushNotificationService.subscribeToTournament('tournament-123');
      
      const lastCall = (localStorage.setItem as MockedFunction<any>).mock.calls.slice(-1)[0];
      const savedData = JSON.parse(lastCall[1]);
      
      expect(savedData.tournamentIds).toContain('tournament-123');
    });

    it('should not duplicate tournament subscriptions', async () => {
      await pushNotificationService.subscribeToTournament('tournament-123');
      await pushNotificationService.subscribeToTournament('tournament-123');
      
      const lastCall = (localStorage.setItem as MockedFunction<any>).mock.calls.slice(-1)[0];
      const savedData = JSON.parse(lastCall[1]);
      
      const count = savedData.tournamentIds.filter((id: string) => id === 'tournament-123').length;
      expect(count).toBe(1);
    });

    it('should unsubscribe from tournament notifications', async () => {
      await pushNotificationService.subscribeToTournament('tournament-123');
      await pushNotificationService.subscribeToTournament('tournament-456');
      
      await pushNotificationService.unsubscribeFromTournament('tournament-123');
      
      const lastCall = (localStorage.setItem as MockedFunction<any>).mock.calls.slice(-1)[0];
      const savedData = JSON.parse(lastCall[1]);
      
      expect(savedData.tournamentIds).not.toContain('tournament-123');
      expect(savedData.tournamentIds).toContain('tournament-456');
    });
  });

  describe('Preference Management', () => {
    beforeEach(async () => {
      await pushNotificationService.subscribe();
    });

    it('should update notification preferences', async () => {
      const newPreferences = {
        gameStart: false,
        scoreUpdates: false,
        achievements: true,
      };
      
      await pushNotificationService.updatePreferences(newPreferences);
      
      const lastCall = (localStorage.setItem as MockedFunction<any>).mock.calls.slice(-1)[0];
      const savedData = JSON.parse(lastCall[1]);
      
      expect(savedData.preferences).toMatchObject(newPreferences);
    });

    it('should throw error when no active subscription', async () => {
      // Clear subscription
      (localStorage.getItem as MockedFunction<any>).mockReturnValue(null);
      
      await expect(
        pushNotificationService.updatePreferences({ gameStart: false })
      ).rejects.toThrow('No active push subscription');
    });
  });

  describe('Notification Sending', () => {
    let swRegistration: any;

    beforeEach(async () => {
      swRegistration = await mockServiceWorker.register();
      await pushNotificationService.subscribe();
    });

    it('should send game start notification', async () => {
      await pushNotificationService.notifyGameStart(
        'tournament-1',
        'match-1',
        ['Team A', 'Team B']
      );
      
      // Wait for queue processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(swRegistration.showNotification).toHaveBeenCalledWith(
        '🏁 Game Starting!',
        expect.objectContaining({
          body: 'Team A vs Team B - Get ready to play!',
          tag: 'game-start-match-1',
          data: { tournamentId: 'tournament-1', matchId: 'match-1', type: 'game-start' },
        })
      );
    });

    it('should send your turn notification', async () => {
      await pushNotificationService.notifyYourTurn(
        'tournament-1',
        'match-2',
        'John Doe',
        'Beer Pong',
        5
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(swRegistration.showNotification).toHaveBeenCalledWith(
        "🎯 You're Up Next!",
        expect.objectContaining({
          body: 'John Doe, get ready for Beer Pong in 5 minutes!',
          tag: 'your-turn-match-2',
          requireInteraction: true,
        })
      );
    });

    it('should send announcement notification', async () => {
      await pushNotificationService.notifyAnnouncement(
        'tournament-1',
        'Important Update',
        'Tournament will start in 10 minutes!',
        'urgent'
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(swRegistration.showNotification).toHaveBeenCalledWith(
        '📢 Important Update',
        expect.objectContaining({
          body: 'Tournament will start in 10 minutes!',
        })
      );
    });

    it('should send achievement notification', async () => {
      await pushNotificationService.notifyAchievement(
        'tournament-1',
        'Jane Smith',
        'First Blood',
        'won the first match of the tournament!'
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(swRegistration.showNotification).toHaveBeenCalledWith(
        '🏆 First Blood Unlocked!',
        expect.objectContaining({
          body: 'Jane Smith won the first match of the tournament!',
        })
      );
    });

    it('should respect notification preferences', async () => {
      // Disable game start notifications
      await pushNotificationService.updatePreferences({ gameStart: false });
      
      await pushNotificationService.notifyGameStart(
        'tournament-1',
        'match-1',
        ['Team A', 'Team B']
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(swRegistration.showNotification).not.toHaveBeenCalled();
    });
  });

  describe('Do Not Disturb', () => {
    beforeEach(async () => {
      await pushNotificationService.subscribe();
    });

    it('should update DND settings', async () => {
      const dndSettings: Partial<DoNotDisturbSettings> = {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        exceptions: ['your-turn', 'game-start'],
      };
      
      await pushNotificationService.updateDoNotDisturb(dndSettings);
      
      const lastCall = (localStorage.setItem as MockedFunction<any>).mock.calls.slice(-1)[0];
      const savedData = JSON.parse(lastCall[1]);
      
      expect(savedData.doNotDisturb).toMatchObject(dndSettings);
    });

    it('should block notifications during DND hours', async () => {
      // Set DND for current time
      const now = new Date();
      const currentHour = now.getHours();
      const dndStart = `${currentHour.toString().padStart(2, '0')}:00`;
      const dndEnd = `${((currentHour + 1) % 24).toString().padStart(2, '0')}:00`;
      
      await pushNotificationService.updateDoNotDisturb({
        enabled: true,
        startTime: dndStart,
        endTime: dndEnd,
        exceptions: [],
      });
      
      await pushNotificationService.notifyAnnouncement(
        'tournament-1',
        'Test',
        'This should be blocked'
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockServiceWorker.showNotification).not.toHaveBeenCalled();
    });

    it('should allow exception notifications during DND', async () => {
      // Set DND with exceptions
      await pushNotificationService.updateDoNotDisturb({
        enabled: true,
        startTime: '00:00',
        endTime: '23:59',
        exceptions: ['your-turn'],
      });
      
      await pushNotificationService.notifyYourTurn(
        'tournament-1',
        'match-1',
        'Player',
        'Game'
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockServiceWorker.showNotification).toHaveBeenCalled();
    });
  });

  describe('SMS Integration', () => {
    beforeEach(async () => {
      await pushNotificationService.subscribe();
    });

    it('should enable SMS notifications', async () => {
      await pushNotificationService.enableSMS('+1234567890');
      
      const lastCall = (localStorage.setItem as MockedFunction<any>).mock.calls.slice(-1)[0];
      const savedData = JSON.parse(lastCall[1]);
      
      expect(savedData.smsEnabled).toBe(true);
      expect(savedData.phoneNumber).toBe('+1234567890');
    });

    it('should disable SMS notifications', async () => {
      await pushNotificationService.enableSMS('+1234567890');
      await pushNotificationService.disableSMS();
      
      const lastCall = (localStorage.setItem as MockedFunction<any>).mock.calls.slice(-1)[0];
      const savedData = JSON.parse(lastCall[1]);
      
      expect(savedData.smsEnabled).toBe(false);
      expect(savedData.phoneNumber).toBeUndefined();
    });

    it('should send SMS for critical notifications when enabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      await pushNotificationService.enableSMS('+1234567890');
      await pushNotificationService.notifyYourTurn(
        'tournament-1',
        'match-1',
        'Player',
        'Beer Pong'
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Would send SMS to',
        '+1234567890',
        ':',
        expect.stringContaining('Beer Olympics: You\'re up next for Beer Pong')
      );
    });
  });

  describe('Queue Processing', () => {
    let swRegistration: any;

    beforeEach(async () => {
      swRegistration = await mockServiceWorker.register();
      await pushNotificationService.subscribe();
    });

    it('should process notifications in priority order', async () => {
      // Send notifications with different priorities
      await pushNotificationService.notifyAnnouncement('t1', 'Info', 'Info message', 'info');
      await pushNotificationService.notifyYourTurn('t1', 'm1', 'Player', 'Game'); // urgent
      await pushNotificationService.notifyScoreUpdate('t1', 'Team A', 10); // normal
      
      // Wait for all notifications to process
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const calls = swRegistration.showNotification.mock.calls;
      expect(calls.length).toBe(3);
      
      // Urgent should be processed first (no delay)
      expect(calls[0][0]).toContain("You're Up Next");
    });

    it('should handle queue overflow gracefully', async () => {
      // Send many notifications quickly
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          pushNotificationService.notifyScoreUpdate('t1', `Team ${i}`, i)
        );
      }
      
      await Promise.all(promises);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // All notifications should eventually be processed
      expect(swRegistration.showNotification).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle service worker registration failure', async () => {
      mockServiceWorker.register.mockRejectedValue(new Error('Registration failed'));
      
      // Service should still function without SW
      const isSupported = pushNotificationService.isSupported();
      expect(isSupported).toBe(true);
    });

    it('should handle subscription failure gracefully', async () => {
      mockServiceWorker.pushManager.subscribe.mockRejectedValue(new Error('Subscribe failed'));
      
      await expect(pushNotificationService.subscribe()).rejects.toThrow('Subscribe failed');
    });

    it('should handle missing VAPID key', async () => {
      // Remove VAPID key
      vi.stubEnv('VITE_VAPID_PUBLIC_KEY', '');
      
      await expect(pushNotificationService.subscribe()).rejects.toThrow(
        'Service worker or VAPID key not available'
      );
    });
  });

  describe('Notification Types', () => {
    let swRegistration: any;

    beforeEach(async () => {
      swRegistration = await mockServiceWorker.register();
      await pushNotificationService.subscribe();
    });

    it('should send score update notification', async () => {
      await pushNotificationService.notifyScoreUpdate('tournament-1', 'Team Alpha', 42);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(swRegistration.showNotification).toHaveBeenCalledWith(
        '🎯 Score Update',
        expect.objectContaining({
          body: 'Team Alpha scored! Current score: 42',
        })
      );
    });

    it('should send leaderboard change notification', async () => {
      const changes = [
        { team: 'Team A', oldRank: 3, newRank: 1 },
        { team: 'Team B', oldRank: 1, newRank: 2 },
      ];
      
      await pushNotificationService.notifyLeaderboardChange('tournament-1', changes);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(swRegistration.showNotification).toHaveBeenCalledWith(
        '📊 Leaderboard Update',
        expect.objectContaining({
          body: '2 teams changed positions!',
        })
      );
    });

    it('should send tournament complete notification', async () => {
      await pushNotificationService.notifyTournamentComplete('tournament-1', 'Team Champions');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(swRegistration.showNotification).toHaveBeenCalledWith(
        '🏆 Tournament Complete!',
        expect.objectContaining({
          body: 'Congratulations to Team Champions for winning!',
          requireInteraction: true,
        })
      );
    });

    it('should send reminder notification', async () => {
      await pushNotificationService.notifyReminder(
        'tournament-1',
        'Your match starts in 15 minutes',
        'match-123'
      );
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(swRegistration.showNotification).toHaveBeenCalledWith(
        '⏰ Reminder',
        expect.objectContaining({
          body: 'Your match starts in 15 minutes',
          tag: 'reminder-match-123',
        })
      );
    });
  });
});