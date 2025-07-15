import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
// Performance optimization utilities for Beer Olympics app
import { useEffect, useState } from 'react';
export class PerformanceOptimizer {
    constructor() {
        Object.defineProperty(this, "observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "imageCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "componentCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this.initializeMetricsCollection();
    }
    static getInstance() {
        if (!PerformanceOptimizer.instance) {
            PerformanceOptimizer.instance = new PerformanceOptimizer();
        }
        return PerformanceOptimizer.instance;
    }
    // Initialize performance metrics collection
    initializeMetricsCollection() {
        if (typeof window === 'undefined')
            return;
        // Collect initial metrics
        this.collectMetrics();
        // Monitor memory usage periodically
        setInterval(() => {
            this.collectMemoryMetrics();
        }, 30000); // Every 30 seconds
        // Monitor network requests
        this.monitorNetworkRequests();
    }
    // Collect comprehensive performance metrics
    collectMetrics() {
        const metrics = {
            renderTime: this.getRenderTime(),
            bundleSize: this.getBundleSize(),
            memoryUsage: this.getMemoryUsage(),
            networkRequests: this.getNetworkRequestCount(),
            cacheHitRatio: this.getCacheHitRatio(),
        };
        this.metrics = metrics;
        return metrics;
    }
    // Get render time from navigation timing
    getRenderTime() {
        if (typeof window === 'undefined' || !window.performance)
            return 0;
        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation)
            return 0;
        return navigation.loadEventEnd - navigation.fetchStart;
    }
    // Estimate bundle size from loaded resources
    getBundleSize() {
        if (typeof window === 'undefined' || !window.performance)
            return 0;
        const resources = performance.getEntriesByType('resource');
        return resources
            .filter(resource => resource.name.includes('.js') || resource.name.includes('.css'))
            .reduce((total, resource) => total + (resource.transferSize || 0), 0);
    }
    // Get memory usage (if available)
    getMemoryUsage() {
        if (typeof window === 'undefined' || !performance.memory)
            return 0;
        return performance.memory?.usedJSHeapSize || 0;
    }
    // Get network request count
    getNetworkRequestCount() {
        if (typeof window === 'undefined' || !window.performance)
            return 0;
        return performance.getEntriesByType('resource').length;
    }
    // Calculate cache hit ratio
    getCacheHitRatio() {
        const totalRequests = this.imageCache.size + this.componentCache.size;
        if (totalRequests === 0)
            return 0;
        // Simplified calculation - in real app would track hits vs misses
        return 0.85; // Assume 85% hit ratio
    }
    // Collect memory metrics
    collectMemoryMetrics() {
        if (typeof window === 'undefined' || !performance.memory)
            return;
        const memory = performance.memory;
        if (memory) {
            console.log('Memory usage:', {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
            });
        }
    }
    // Monitor network requests
    monitorNetworkRequests() {
        if (typeof window === 'undefined')
            return;
        // Override fetch to monitor requests
        const originalFetch = window.fetch;
        let requestCount = 0;
        let cachedResponseCount = 0;
        window.fetch = async (...args) => {
            requestCount++;
            const response = await originalFetch(...args);
            // Check if response came from cache
            if (response.headers.get('x-cache') === 'HIT') {
                cachedResponseCount++;
            }
            return response;
        };
    }
    // Lazy loading for images
    setupLazyLoading(config = {}) {
        const defaultConfig = {
            threshold: 0.1,
            rootMargin: '50px',
            triggerOnce: true,
        };
        const finalConfig = { ...defaultConfig, ...config };
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported, loading all images immediately');
            this.loadAllImages();
            return;
        }
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    if (finalConfig.triggerOnce) {
                        this.observer?.unobserve(img);
                    }
                }
            });
        }, {
            threshold: finalConfig.threshold,
            rootMargin: finalConfig.rootMargin,
        });
        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach((img) => {
            this.observer?.observe(img);
        });
    }
    // Load image with caching
    loadImage(img) {
        const src = img.dataset.src;
        if (!src)
            return;
        // Check cache first
        const cachedImage = this.imageCache.get(src);
        if (cachedImage) {
            img.src = src;
            img.classList.add('loaded');
            return;
        }
        // Load image
        const image = new Image();
        image.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            this.imageCache.set(src, image);
        };
        image.onerror = () => {
            img.classList.add('error');
        };
        image.src = src;
    }
    // Load all images immediately (fallback)
    loadAllImages() {
        document.querySelectorAll('img[data-src]').forEach((img) => {
            this.loadImage(img);
        });
    }
    // Component-level caching
    cacheComponent(key, component) {
        this.componentCache.set(key, component);
    }
    getCachedComponent(key) {
        return this.componentCache.get(key) || null;
    }
    // Clear component cache
    clearComponentCache() {
        this.componentCache.clear();
    }
    // Preload critical resources
    preloadCriticalResources(urls) {
        urls.forEach((url) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            if (url.endsWith('.js')) {
                link.as = 'script';
            }
            else if (url.endsWith('.css')) {
                link.as = 'style';
            }
            else if (url.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
                link.as = 'image';
            }
            else {
                link.as = 'fetch';
                link.setAttribute('crossorigin', 'anonymous');
            }
            link.href = url;
            document.head.appendChild(link);
        });
    }
    // Optimize images
    optimizeImage(src, options = {}) {
        // For now, return original src
        // In production, this would integrate with image optimization service
        const params = new URLSearchParams();
        if (options.width)
            params.set('w', options.width.toString());
        if (options.height)
            params.set('h', options.height.toString());
        if (options.quality)
            params.set('q', options.quality.toString());
        if (options.format)
            params.set('f', options.format);
        const separator = src.includes('?') ? '&' : '?';
        return params.toString() ? `${src}${separator}${params.toString()}` : src;
    }
    // Bundle splitting helper
    loadComponentAsync(importFn) {
        return importFn().then(module => module.default);
    }
    // Memory cleanup
    cleanup() {
        this.observer?.disconnect();
        this.imageCache.clear();
        this.componentCache.clear();
    }
    // Performance report
    generateReport() {
        const metrics = this.collectMetrics();
        const recommendations = [];
        let score = 100;
        // Analyze render time
        if (metrics.renderTime > 3000) {
            recommendations.push('Render time is high. Consider code splitting and lazy loading.');
            score -= 20;
        }
        else if (metrics.renderTime > 1500) {
            recommendations.push('Render time could be improved with optimization.');
            score -= 10;
        }
        // Analyze bundle size
        if (metrics.bundleSize > 2 * 1024 * 1024) { // 2MB
            recommendations.push('Bundle size is large. Consider splitting chunks and removing unused code.');
            score -= 15;
        }
        // Analyze memory usage
        if (metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
            recommendations.push('Memory usage is high. Check for memory leaks and optimize data structures.');
            score -= 15;
        }
        // Analyze cache hit ratio
        if (metrics.cacheHitRatio < 0.7) {
            recommendations.push('Cache hit ratio is low. Improve caching strategy.');
            score -= 10;
        }
        if (recommendations.length === 0) {
            recommendations.push('Performance looks good! Keep monitoring.');
        }
        return {
            metrics,
            recommendations,
            score: Math.max(0, score),
        };
    }
}
// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();
// React hook for performance monitoring
export function usePerformanceMonitoring() {
    const [metrics, setMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const collectMetrics = () => {
            const currentMetrics = performanceOptimizer.collectMetrics();
            setMetrics(currentMetrics);
            setIsLoading(false);
        };
        // Initial collection
        collectMetrics();
        // Periodic collection
        const interval = setInterval(collectMetrics, 60000); // Every minute
        return () => {
            clearInterval(interval);
        };
    }, []);
    return { metrics, isLoading };
}
// Image optimization component
export function OptimizedImage({ src, alt, width, height, quality = 85, className = '', lazy = true, ...props }) {
    const optimizedSrc = performanceOptimizer.optimizeImage(src, {
        width,
        height,
        quality,
        format: 'webp',
    });
    const imgProps = {
        alt,
        className: `transition-opacity duration-300 ${className}`,
        width,
        height,
        ...props,
    };
    if (lazy) {
        return (_jsx("img", { ...imgProps, "data-src": optimizedSrc, src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" }));
    }
    return _jsx("img", { ...imgProps, src: optimizedSrc });
}
// Performance monitoring component
export function PerformanceMonitor({ children }) {
    useEffect(() => {
        // Setup lazy loading
        performanceOptimizer.setupLazyLoading();
        // Preload critical resources
        performanceOptimizer.preloadCriticalResources([
            '/icons/icon-192x192.png',
            '/manifest.json',
        ]);
        // Cleanup on unmount
        return () => {
            performanceOptimizer.cleanup();
        };
    }, []);
    return _jsx(_Fragment, { children: children });
}
