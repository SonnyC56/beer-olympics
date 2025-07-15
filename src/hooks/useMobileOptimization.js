import { useEffect, useState, useCallback } from 'react';
import { isMobileDevice, isSlowNetwork, shouldReduceData, getNetworkType, isPWA, prefersReducedMotion } from '@/utils/responsive';
export function useMobileOptimization() {
    const [state, setState] = useState({
        isMobile: false,
        isPWA: false,
        networkType: 'unknown',
        isSlowNetwork: false,
        shouldReduceData: false,
        shouldReduceMotion: false,
        isOnline: true,
    });
    const updateState = useCallback(() => {
        setState({
            isMobile: isMobileDevice(),
            isPWA: isPWA(),
            networkType: getNetworkType(),
            isSlowNetwork: isSlowNetwork(),
            shouldReduceData: shouldReduceData(),
            shouldReduceMotion: prefersReducedMotion(),
            isOnline: navigator.onLine,
        });
    }, []);
    useEffect(() => {
        // Initial state
        updateState();
        // Listen for changes
        window.addEventListener('resize', updateState);
        window.addEventListener('online', updateState);
        window.addEventListener('offline', updateState);
        // Listen for network changes
        if ('connection' in navigator) {
            const connection = navigator.connection;
            connection?.addEventListener('change', updateState);
        }
        // Listen for motion preference changes
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionQuery.addEventListener('change', updateState);
        return () => {
            window.removeEventListener('resize', updateState);
            window.removeEventListener('online', updateState);
            window.removeEventListener('offline', updateState);
            if ('connection' in navigator) {
                const connection = navigator.connection;
                connection?.removeEventListener('change', updateState);
            }
            motionQuery.removeEventListener('change', updateState);
        };
    }, [updateState]);
    return state;
}
// Hook for optimizing images based on network conditions
export function useOptimizedImage(src, options = {}) {
    const { shouldReduceData, isSlowNetwork } = useMobileOptimization();
    const [currentSrc, setCurrentSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (shouldReduceData && options.lowQualitySrc) {
            setCurrentSrc(options.lowQualitySrc);
        }
        else if (isSlowNetwork && options.sizes?.length) {
            // Use smaller size for slow networks
            const smallestSize = Math.min(...options.sizes);
            const newSrc = src.replace(/(\.\w+)$/, `-${smallestSize}$1`);
            setCurrentSrc(newSrc);
        }
        else {
            setCurrentSrc(src);
        }
    }, [src, options, shouldReduceData, isSlowNetwork]);
    const loadImage = useCallback(() => {
        const img = new Image();
        img.onload = () => {
            setIsLoading(false);
            setError(null);
        };
        img.onerror = () => {
            setIsLoading(false);
            setError(new Error('Failed to load image'));
        };
        img.src = currentSrc;
    }, [currentSrc]);
    useEffect(() => {
        if (!options.lazy || !('IntersectionObserver' in window)) {
            loadImage();
        }
    }, [loadImage, options.lazy]);
    return {
        src: currentSrc,
        isLoading,
        error,
        loadImage,
    };
}
// Hook for handling offline functionality
export function useOfflineSupport() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingActions, setPendingActions] = useState(0);
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Trigger sync when back online
            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then((reg) => {
                    if ('sync' in reg) {
                        reg.sync.register('offline-sync');
                    }
                });
            }
        };
        const handleOffline = () => {
            setIsOnline(false);
        };
        // Listen for service worker messages
        const handleMessage = (event) => {
            if (event.data.type === 'sync-success') {
                setPendingActions(prev => Math.max(0, prev - 1));
            }
            else if (event.data.type === 'offline-action-queued') {
                setPendingActions(prev => prev + 1);
            }
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        navigator.serviceWorker?.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            navigator.serviceWorker?.removeEventListener('message', handleMessage);
        };
    }, []);
    const queueAction = useCallback(async (action) => {
        if (isOnline) {
            return action();
        }
        // Queue for later
        setPendingActions(prev => prev + 1);
        // Store in IndexedDB through service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'queue-action',
                action: action.toString(),
            });
        }
        return Promise.resolve({ offline: true, queued: true });
    }, [isOnline]);
    return {
        isOnline,
        pendingActions,
        queueAction,
    };
}
