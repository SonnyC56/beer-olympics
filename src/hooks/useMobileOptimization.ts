import { useEffect, useState, useCallback } from 'react';
import { 
  isMobileDevice, 
  isSlowNetwork, 
  shouldReduceData,
  getNetworkType,
  isPWA,
  prefersReducedMotion 
} from '@/utils/responsive';

interface MobileOptimizationState {
  isMobile: boolean;
  isPWA: boolean;
  networkType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  isSlowNetwork: boolean;
  shouldReduceData: boolean;
  shouldReduceMotion: boolean;
  isOnline: boolean;
}

export function useMobileOptimization() {
  const [state, setState] = useState<MobileOptimizationState>({
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
      const connection = (navigator as any).connection;
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
        const connection = (navigator as any).connection;
        connection?.removeEventListener('change', updateState);
      }
      
      motionQuery.removeEventListener('change', updateState);
    };
  }, [updateState]);

  return state;
}

// Hook for optimizing images based on network conditions
export function useOptimizedImage(
  src: string,
  options: {
    lowQualitySrc?: string;
    sizes?: number[];
    lazy?: boolean;
  } = {}
) {
  const { shouldReduceData, isSlowNetwork } = useMobileOptimization();
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (shouldReduceData && options.lowQualitySrc) {
      setCurrentSrc(options.lowQualitySrc);
    } else if (isSlowNetwork && options.sizes?.length) {
      // Use smaller size for slow networks
      const smallestSize = Math.min(...options.sizes);
      const newSrc = src.replace(/(\.\w+)$/, `-${smallestSize}$1`);
      setCurrentSrc(newSrc);
    } else {
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
  const [pendingActions, setPendingActions] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when back online
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((reg) => {
          if ('sync' in reg) {
            (reg as any).sync.register('offline-sync');
          }
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Listen for service worker messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sync-success') {
        setPendingActions(prev => Math.max(0, prev - 1));
      } else if (event.data.type === 'offline-action-queued') {
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

  const queueAction = useCallback(async (action: () => Promise<any>) => {
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