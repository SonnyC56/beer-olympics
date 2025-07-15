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
    priority?: 'urgent' | 'normal' | 'info';
    vibrate?: number[];
    sound?: string;
    silent?: boolean;
    image?: string;
    renotify?: boolean;
}
export type NotificationType = 'game-start' | 'your-turn' | 'game-end' | 'score-update' | 'leaderboard-change' | 'tournament-update' | 'team-message' | 'announcement' | 'reminder' | 'achievement';
export interface DoNotDisturbSettings {
    enabled: boolean;
    startTime?: string;
    endTime?: string;
    duringMatches: boolean;
    exceptions: NotificationType[];
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
        yourTurn: boolean;
        announcements: boolean;
        reminders: boolean;
        achievements: boolean;
    };
    doNotDisturb: DoNotDisturbSettings;
    smsEnabled?: boolean;
    phoneNumber?: string;
}
export declare class PushNotificationService {
    private static instance;
    private vapidPublicKey;
    private swRegistration;
    private notificationQueue;
    private isProcessingQueue;
    private constructor();
    static getInstance(): PushNotificationService;
    private initializeServiceWorker;
    isSupported(): boolean;
    getPermissionStatus(): NotificationPermission;
    requestPermission(): Promise<NotificationPermission>;
    subscribe(preferences?: Partial<SubscriptionData['preferences']>): Promise<SubscriptionData | null>;
    unsubscribe(): Promise<boolean>;
    getSubscription(): Promise<SubscriptionData | null>;
    subscribeToTournament(tournamentId: string): Promise<void>;
    unsubscribeFromTournament(tournamentId: string): Promise<void>;
    updatePreferences(preferences: Partial<SubscriptionData['preferences']>): Promise<void>;
    sendLocalNotification(payload: NotificationPayload): Promise<void>;
    notifyGameStart(tournamentId: string, matchId: string, teams: string[]): Promise<void>;
    notifyYourTurn(tournamentId: string, matchId: string, playerName: string, gameName: string, timeUntil?: number): Promise<void>;
    notifyAnnouncement(tournamentId: string, title: string, message: string, priority?: 'urgent' | 'normal' | 'info'): Promise<void>;
    notifyReminder(tournamentId: string, message: string, matchId?: string): Promise<void>;
    notifyAchievement(tournamentId: string, playerName: string, achievement: string, description: string): Promise<void>;
    notifyScoreUpdate(tournamentId: string, teamName: string, score: number): Promise<void>;
    notifyLeaderboardChange(tournamentId: string, changes: Array<{
        team: string;
        oldRank: number;
        newRank: number;
    }>): Promise<void>;
    notifyTournamentComplete(tournamentId: string, winner: string): Promise<void>;
    updateDoNotDisturb(settings: Partial<DoNotDisturbSettings>): Promise<void>;
    private shouldSendNotification;
    private queueNotification;
    private startQueueProcessor;
    private processQueue;
    private sendSMS;
    enableSMS(phoneNumber: string): Promise<void>;
    disableSMS(): Promise<void>;
    private urlBase64ToUint8Array;
    private arrayBufferToBase64;
    private storeSubscription;
    private getStoredSubscription;
    private removeStoredSubscription;
    private sendSubscriptionToServer;
}
export declare const pushNotificationService: PushNotificationService;
