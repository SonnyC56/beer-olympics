export declare const BREAKPOINTS: {
    readonly mobile: 640;
    readonly tablet: 768;
    readonly laptop: 1024;
    readonly desktop: 1280;
};
export declare function isMobileDevice(): boolean;
export declare function isTabletDevice(): boolean;
export declare function getDeviceType(): 'mobile' | 'tablet' | 'desktop';
export declare function isIOS(): boolean;
export declare function isAndroid(): boolean;
export declare function isPWA(): boolean;
export declare function getNetworkType(): '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
export declare function isSlowNetwork(): boolean;
export declare function getOptimalImageSize(containerWidth: number): string;
export declare function prefersReducedMotion(): boolean;
export declare function prefersDarkMode(): boolean;
export declare function isTouchEvent(event: Event): event is TouchEvent;
export declare function getEventPosition(event: MouseEvent | TouchEvent): {
    x: number;
    y: number;
};
export declare function getViewportSize(): {
    width: number;
    height: number;
};
export declare function getSafeAreaInsets(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export declare function shouldReduceData(): boolean;
export declare function getOptimalLoadStrategy(): 'eager' | 'lazy' | 'progressive';
