interface ErrorContext {
    userId?: string;
    tournamentId?: string;
    action?: string;
    metadata?: Record<string, any>;
}
interface PerformanceMetric {
    name: string;
    duration: number;
    context?: Record<string, any>;
}
interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
    userId?: string;
}
declare class MonitoringService {
    private isDevelopment;
    private sentryDsn;
    private analyticsId;
    constructor();
    private initSentry;
    private initAnalytics;
    private setupErrorHandlers;
    captureError(error: Error | string, context?: ErrorContext): void;
    captureMessage(message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext): void;
    trackPerformance(metric: PerformanceMetric): void;
    trackEvent(event: AnalyticsEvent): void;
    startTiming(name: string): number;
    endTiming(name: string, startTime?: number, context?: Record<string, any>): number;
    setUser(user: {
        id: string;
        email: string;
        name: string;
    }): void;
    clearUser(): void;
}
export declare const monitoring: MonitoringService;
export declare const captureError: (error: Error | string, context?: ErrorContext) => void;
export declare const captureMessage: (message: string, level?: "info" | "warning" | "error", context?: ErrorContext) => void;
export declare const trackPerformance: (metric: PerformanceMetric) => void;
export declare const trackEvent: (event: AnalyticsEvent) => void;
export declare const startTiming: (name: string) => number;
export declare const endTiming: (name: string, startTime?: number, context?: Record<string, any>) => number;
export declare const setUser: (user: {
    id: string;
    email: string;
    name: string;
}) => void;
export declare const clearUser: () => void;
export {};
