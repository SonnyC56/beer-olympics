import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PushNotificationService } from '../../../src/services/push-notifications';

// Mock service worker registration
const mockPushManager = {
  subscribe: vi.fn(),
  getSubscription: vi.fn(),
};

const mockServiceWorkerRegistration = {
  pushManager: mockPushManager,
  showNotification: vi.fn(),
  addEventListener: vi.fn(),
};

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    serviceWorker: {
      register: vi.fn().mockResolvedValue(mockServiceWorkerRegistration),
    },
  },
  writable: true,
});

// Mock Notification
Object.defineProperty(global, 'Notification', {
  value: {
    permission: 'default',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  },
  writable: true,
});

// Mock window
Object.defineProperty(global, 'window', {
  value: {
    PushManager: class MockPushManager {},
    location: {
      origin: 'https://test.com',
    },
    atob: vi.fn(),
    btoa: vi.fn(),
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock environment variables
vi.mock('../../../src/services/push-notifications', async () => {
  const actual = await vi.importActual('../../../src/services/push-notifications');
  return {
    ...actual,
    pushNotificationService: null, // We'll create our own instance
  };
});

describe('PushNotificationService', () => {
  let pushService: PushNotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock environment
    import.meta.env = {
      VITE_VAPID_PUBLIC_KEY: 'BFakeVapidPublicKey123',
    };

    pushService = PushNotificationService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isSupported', () => {
    it('should return true when all APIs are supported', () => {
      expect(pushService.isSupported()).toBe(true);
    });

    it('should return false when Notification is not supported', () => {
      const originalNotification = global.Notification;
      delete global.Notification;
      
      expect(pushService.isSupported()).toBe(false);
      
      global.Notification = originalNotification;
    });
  });

  describe('getPermissionStatus', () => {
    it('should return current permission status', () => {
      global.Notification.permission = 'granted';
      expect(pushService.getPermissionStatus()).toBe('granted');
      
      global.Notification.permission = 'denied';
      expect(pushService.getPermissionStatus()).toBe('denied');
    });
  });

  describe('requestPermission', () => {
    it('should request and return permission', async () => {
      global.Notification.requestPermission.mockResolvedValue('granted');
      
      const permission = await pushService.requestPermission();
      
      expect(permission).toBe('granted');
      expect(global.Notification.requestPermission).toHaveBeenCalled();
    });

    it('should throw error when not supported', async () => {
      const originalNotification = global.Notification;
      delete global.Notification;
      
      await expect(pushService.requestPermission()).rejects.toThrow(
        'Push notifications are not supported'
      );
      
      global.Notification = originalNotification;
    });
  });

  describe('subscribe', () => {
    beforeEach(() => {
      global.Notification.permission = 'granted';
      global.Notification.requestPermission.mockResolvedValue('granted');
      
      // Mock successful subscription
      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        getKey: vi.fn().mockImplementation((name) => {
          if (name === 'p256dh') return new ArrayBuffer(8);
          if (name === 'auth') return new ArrayBuffer(8);
          return null;
        }),
      };
      
      mockPushManager.subscribe.mockResolvedValue(mockSubscription);
      
      // Mock base64 conversion
      global.window.btoa.mockReturnValue('mockBase64String');
    });

    it('should successfully subscribe with default preferences', async () => {
      const subscription = await pushService.subscribe();
      
      expect(subscription).toMatchObject({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: {
          p256dh: 'mockBase64String',
          auth: 'mockBase64String',
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
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'push-subscription',
        expect.stringContaining('https://fcm.googleapis.com/fcm/send/test')
      );
    });

    it('should subscribe with custom preferences', async () => {
      const customPreferences = {
        gameStart: false,
        scoreUpdates: false,
      };
      
      const subscription = await pushService.subscribe(customPreferences);
      
      expect(subscription?.preferences).toMatchObject({
        gameStart: false,
        gameEnd: true,
        scoreUpdates: false,
        leaderboardChanges: true,
        tournamentUpdates: true,
        teamMessages: true,
      });
    });

    it('should return null when permission denied', async () => {
      global.Notification.requestPermission.mockResolvedValue('denied');
      
      const subscription = await pushService.subscribe();
      
      expect(subscription).toBeNull();
    });

    it('should throw error when subscription fails', async () => {
      mockPushManager.subscribe.mockRejectedValue(new Error('Subscription failed'));
      
      await expect(pushService.subscribe()).rejects.toThrow('Subscription failed');
    });
  });

  describe('unsubscribe', () => {
    it('should successfully unsubscribe', async () => {
      const mockSubscription = {
        unsubscribe: vi.fn().mockResolvedValue(true),
      };
      
      mockPushManager.getSubscription.mockResolvedValue(mockSubscription);
      
      const result = await pushService.unsubscribe();
      
      expect(result).toBe(true);
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('push-subscription');
    });

    it('should return false when no subscription exists', async () => {
      mockPushManager.getSubscription.mockResolvedValue(null);
      
      const result = await pushService.unsubscribe();
      
      expect(result).toBe(false);
    });
  });

  describe('getSubscription', () => {
    it('should return stored subscription', async () => {
      const mockStoredSubscription = {
        endpoint: 'https://test.com/endpoint',
        keys: { p256dh: 'key1', auth: 'key2' },
        tournamentIds: ['tournament-1'],
        preferences: { gameStart: true },
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockStoredSubscription));
      
      const subscription = await pushService.getSubscription();
      
      expect(subscription).toEqual(mockStoredSubscription);
    });

    it('should return subscription from service worker when not stored', async () => {
      const mockSubscription = {
        endpoint: 'https://test.com/endpoint',
        getKey: vi.fn().mockImplementation((name) => {
          if (name === 'p256dh') return new ArrayBuffer(8);
          if (name === 'auth') return new ArrayBuffer(8);
          return null;
        }),
      };
      
      mockPushManager.getSubscription.mockResolvedValue(mockSubscription);
      global.window.btoa.mockReturnValue('mockBase64String');
      
      const subscription = await pushService.getSubscription();
      
      expect(subscription).toMatchObject({
        endpoint: 'https://test.com/endpoint',
        keys: {
          p256dh: 'mockBase64String',
          auth: 'mockBase64String',
        },
      });
    });

    it('should return null when no subscription exists', async () => {
      mockPushManager.getSubscription.mockResolvedValue(null);
      
      const subscription = await pushService.getSubscription();
      
      expect(subscription).toBeNull();
    });
  });

  describe('subscribeToTournament', () => {
    beforeEach(() => {
      const mockSubscription = {
        endpoint: 'https://test.com/endpoint',
        keys: { p256dh: 'key1', auth: 'key2' },
        tournamentIds: [],
        preferences: { gameStart: true },
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSubscription));
    });

    it('should add tournament to subscription', async () => {
      await pushService.subscribeToTournament('tournament-1');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'push-subscription',
        expect.stringContaining('"tournamentIds":["tournament-1"]')
      );
    });

    it('should not add duplicate tournament', async () => {
      const mockSubscription = {
        endpoint: 'https://test.com/endpoint',
        keys: { p256dh: 'key1', auth: 'key2' },
        tournamentIds: ['tournament-1'],
        preferences: { gameStart: true },
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSubscription));
      
      await pushService.subscribeToTournament('tournament-1');
      
      // Should not call setItem again since tournament already exists
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should throw error when no subscription exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      mockPushManager.getSubscription.mockResolvedValue(null);
      
      await expect(pushService.subscribeToTournament('tournament-1')).rejects.toThrow(
        'No active push subscription'
      );
    });
  });

  describe('sendLocalNotification', () => {
    it('should show notification with default options', async () => {
      const payload = {
        title: 'Test Notification',
        body: 'Test body',
      };
      
      await pushService.sendLocalNotification(payload);
      
      expect(mockServiceWorkerRegistration.showNotification).toHaveBeenCalledWith(
        'Test Notification',
        expect.objectContaining({
          body: 'Test body',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'beer-olympics',
        })
      );
    });

    it('should show notification with custom options', async () => {
      const payload = {
        title: 'Custom Notification',
        body: 'Custom body',
        icon: '/custom-icon.png',
        tag: 'custom-tag',
        data: { test: 'data' },
        actions: [{ action: 'view', title: 'View' }],
        requireInteraction: true,
      };
      
      await pushService.sendLocalNotification(payload);
      
      expect(mockServiceWorkerRegistration.showNotification).toHaveBeenCalledWith(
        'Custom Notification',
        expect.objectContaining({
          body: 'Custom body',
          icon: '/custom-icon.png',
          tag: 'custom-tag',
          data: { test: 'data' },
          actions: [{ action: 'view', title: 'View' }],
          requireInteraction: true,
        })
      );
    });
  });

  describe('tournament notification helpers', () => {
    beforeEach(() => {
      const mockSubscription = {
        preferences: {
          gameStart: true,
          scoreUpdates: true,
          leaderboardChanges: true,
          tournamentUpdates: true,
        },
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSubscription));
    });

    it('should send game start notification', async () => {
      await pushService.notifyGameStart('tournament-1', 'match-1', ['Team A', 'Team B']);
      
      expect(mockServiceWorkerRegistration.showNotification).toHaveBeenCalledWith(
        '🏁 Game Starting!',
        expect.objectContaining({
          body: 'Team A vs Team B - Get ready to play!',
          tag: 'game-start-match-1',
        })
      );
    });

    it('should send score update notification', async () => {
      await pushService.notifyScoreUpdate('tournament-1', 'Team A', 5);
      
      expect(mockServiceWorkerRegistration.showNotification).toHaveBeenCalledWith(
        '🎯 Score Update',
        expect.objectContaining({
          body: 'Team A scored! Current score: 5',
          tag: 'score-tournament-1',
        })
      );
    });

    it('should send leaderboard change notification', async () => {
      const changes = [{ team: 'Team A', oldRank: 3, newRank: 1 }];
      
      await pushService.notifyLeaderboardChange('tournament-1', changes);
      
      expect(mockServiceWorkerRegistration.showNotification).toHaveBeenCalledWith(
        '📊 Leaderboard Update',
        expect.objectContaining({
          body: 'Team A moved from #3 to #1!',
          tag: 'leaderboard-tournament-1',
        })
      );
    });

    it('should send tournament complete notification', async () => {
      await pushService.notifyTournamentComplete('tournament-1', 'Team A');
      
      expect(mockServiceWorkerRegistration.showNotification).toHaveBeenCalledWith(
        '🏆 Tournament Complete!',
        expect.objectContaining({
          body: 'Congratulations to Team A for winning!',
          tag: 'tournament-complete-tournament-1',
          requireInteraction: true,
        })
      );
    });

    it('should not send notification when preference is disabled', async () => {
      const mockSubscription = {
        preferences: {
          gameStart: false,
          scoreUpdates: false,
          leaderboardChanges: false,
          tournamentUpdates: false,
        },
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSubscription));
      
      await pushService.notifyGameStart('tournament-1', 'match-1', ['Team A', 'Team B']);
      await pushService.notifyScoreUpdate('tournament-1', 'Team A', 5);
      await pushService.notifyLeaderboardChange('tournament-1', []);
      await pushService.notifyTournamentComplete('tournament-1', 'Team A');
      
      expect(mockServiceWorkerRegistration.showNotification).not.toHaveBeenCalled();
    });
  });
});