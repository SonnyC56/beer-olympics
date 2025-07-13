// Performance optimization utilities for Beer Olympics app
import React, { useEffect, useState } from 'react';

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

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private observer: IntersectionObserver | null = null;
  private imageCache = new Map<string, HTMLImageElement>();
  private componentCache = new Map<string, React.ComponentType>();
  private metrics: Partial<PerformanceMetrics> = {};

  private constructor() {
    this.initializeMetricsCollection();
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Initialize performance metrics collection
  private initializeMetricsCollection(): void {
    if (typeof window === 'undefined') return;

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
  collectMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
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
  private getRenderTime(): number {
    if (typeof window === 'undefined' || !window.performance) return 0;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return 0;

    return navigation.loadEventEnd - navigation.fetchStart;
  }

  // Estimate bundle size from loaded resources
  private getBundleSize(): number {
    if (typeof window === 'undefined' || !window.performance) return 0;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources
      .filter(resource => resource.name.includes('.js') || resource.name.includes('.css'))
      .reduce((total, resource) => total + (resource.transferSize || 0), 0);
  }

  // Get memory usage (if available)
  private getMemoryUsage(): number {
    if (typeof window === 'undefined' || !(performance as any).memory) return 0;

    return (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
  }

  // Get network request count
  private getNetworkRequestCount(): number {
    if (typeof window === 'undefined' || !window.performance) return 0;

    return performance.getEntriesByType('resource').length;
  }

  // Calculate cache hit ratio
  private getCacheHitRatio(): number {
    const totalRequests = this.imageCache.size + this.componentCache.size;
    if (totalRequests === 0) return 0;

    // Simplified calculation - in real app would track hits vs misses
    return 0.85; // Assume 85% hit ratio
  }

  // Collect memory metrics
  private collectMemoryMetrics(): void {
    if (typeof window === 'undefined' || !(performance as any).memory) return;

    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    if (memory) {
      console.log('Memory usage:', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
      });
    }
  }

  // Monitor network requests
  private monitorNetworkRequests(): void {
    if (typeof window === 'undefined') return;

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
  setupLazyLoading(config: Partial<LazyLoadConfig> = {}): void {
    const defaultConfig: LazyLoadConfig = {
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
          const img = entry.target as HTMLImageElement;
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
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (!src) return;

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
  private loadAllImages(): void {
    document.querySelectorAll('img[data-src]').forEach((img) => {
      this.loadImage(img as HTMLImageElement);
    });
  }

  // Component-level caching
  cacheComponent(key: string, component: React.ComponentType): void {
    this.componentCache.set(key, component);
  }

  getCachedComponent(key: string): React.ComponentType | null {
    return this.componentCache.get(key) || null;
  }

  // Clear component cache
  clearComponentCache(): void {
    this.componentCache.clear();
  }

  // Preload critical resources
  preloadCriticalResources(urls: string[]): void {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (url.endsWith('.js')) {
        link.as = 'script';
      } else if (url.endsWith('.css')) {
        link.as = 'style';
      } else if (url.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
        link.as = 'image';
      } else {
        link.as = 'fetch';
        link.setAttribute('crossorigin', 'anonymous');
      }
      
      link.href = url;
      document.head.appendChild(link);
    });
  }

  // Optimize images
  optimizeImage(src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}): string {
    // For now, return original src
    // In production, this would integrate with image optimization service
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    
    const separator = src.includes('?') ? '&' : '?';
    return params.toString() ? `${src}${separator}${params.toString()}` : src;
  }

  // Bundle splitting helper
  loadComponentAsync<T>(importFn: () => Promise<{ default: T }>): Promise<T> {
    return importFn().then(module => module.default);
  }

  // Memory cleanup
  cleanup(): void {
    this.observer?.disconnect();
    this.imageCache.clear();
    this.componentCache.clear();
  }

  // Performance report
  generateReport(): {
    metrics: PerformanceMetrics;
    recommendations: string[];
    score: number;
  } {
    const metrics = this.collectMetrics();
    const recommendations: string[] = [];
    let score = 100;

    // Analyze render time
    if (metrics.renderTime > 3000) {
      recommendations.push('Render time is high. Consider code splitting and lazy loading.');
      score -= 20;
    } else if (metrics.renderTime > 1500) {
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
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
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
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 85,
  className = '',
  lazy = true,
  ...props
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  lazy?: boolean;
  [key: string]: unknown;
}) {
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
    return (
      <img
        {...imgProps}
        data-src={optimizedSrc}
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
      />
    );
  }

  return <img {...imgProps} src={optimizedSrc} />;
}

// Performance monitoring component
export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>;
}

