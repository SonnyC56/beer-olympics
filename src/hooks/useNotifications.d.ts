import type { SubscriptionData, NotificationType, DoNotDisturbSettings } from '../services/push-notifications';
interface NotificationOptions {
    tournamentId?: string;
    userId?: string;
}
export declare const useNotifications: (options?: NotificationOptions) => {
    isSupported: boolean;
    permission: NotificationPermission;
    subscription: SubscriptionData | null;
    isLoading: boolean;
    error: string | null;
    unreadCount: number;
    requestPermission: () => Promise<void>;
    subscribeToTournament: (id: string) => Promise<void>;
    unsubscribeFromTournament: (id: string) => Promise<void>;
    updatePreferences: (preferences: Partial<SubscriptionData["preferences"]>) => Promise<void>;
    updateDoNotDisturb: (settings: Partial<DoNotDisturbSettings>) => Promise<void>;
    enableSMS: (phoneNumber: string) => Promise<void>;
    disableSMS: () => Promise<void>;
    sendNotification: (type: NotificationType, data: any) => Promise<void>;
    markAsRead: (notificationIds?: string[]) => void;
    clearHistory: () => void;
    testNotification: () => Promise<void>;
};
export {};
