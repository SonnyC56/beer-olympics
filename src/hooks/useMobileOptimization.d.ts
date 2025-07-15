interface MobileOptimizationState {
    isMobile: boolean;
    isPWA: boolean;
    networkType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
    isSlowNetwork: boolean;
    shouldReduceData: boolean;
    shouldReduceMotion: boolean;
    isOnline: boolean;
}
export declare function useMobileOptimization(): MobileOptimizationState;
export declare function useOptimizedImage(src: string, options?: {
    lowQualitySrc?: string;
    sizes?: number[];
    lazy?: boolean;
}): {
    src: string;
    isLoading: boolean;
    error: Error | null;
    loadImage: () => void;
};
export declare function useOfflineSupport(): {
    isOnline: boolean;
    pendingActions: number;
    queueAction: (action: () => Promise<any>) => Promise<any>;
};
export {};
