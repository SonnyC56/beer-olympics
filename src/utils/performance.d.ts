import React from 'react';
export interface PerformanceMetrics {
    renderTime: number;
    bundleSize: number;
    memoryUsage: number;
    networkRequests: number;
    cacheHitRatio: number;
}
export interface LazyLoadConfig {
    threshold: number;
    rootMargin: string;
    triggerOnce: boolean;
}
export declare class PerformanceOptimizer {
    private static instance;
    private observer;
    private imageCache;
    private componentCache;
    private metrics;
    private constructor();
    static getInstance(): PerformanceOptimizer;
    private initializeMetricsCollection;
    collectMetrics(): PerformanceMetrics;
    private getRenderTime;
    private getBundleSize;
    private getMemoryUsage;
    private getNetworkRequestCount;
    private getCacheHitRatio;
    private collectMemoryMetrics;
    private monitorNetworkRequests;
    setupLazyLoading(config?: Partial<LazyLoadConfig>): void;
    private loadImage;
    private loadAllImages;
    cacheComponent(key: string, component: React.ComponentType): void;
    getCachedComponent(key: string): React.ComponentType | null;
    clearComponentCache(): void;
    preloadCriticalResources(urls: string[]): void;
    optimizeImage(src: string, options?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'webp' | 'jpeg' | 'png';
    }): string;
    loadComponentAsync<T>(importFn: () => Promise<{
        default: T;
    }>): Promise<T>;
    cleanup(): void;
    generateReport(): {
        metrics: PerformanceMetrics;
        recommendations: string[];
        score: number;
    };
}
export declare const performanceOptimizer: PerformanceOptimizer;
export declare function usePerformanceMonitoring(): {
    metrics: PerformanceMetrics | null;
    isLoading: boolean;
};
export declare function OptimizedImage({ src, alt, width, height, quality, className, lazy, ...props }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    quality?: number;
    className?: string;
    lazy?: boolean;
    [key: string]: unknown;
}): import("react/jsx-runtime").JSX.Element;
export declare function PerformanceMonitor({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
