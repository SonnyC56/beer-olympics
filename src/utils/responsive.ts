// Device detection and responsive utilities

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
} as const;

export function isMobileDevice(): boolean {
  // Check if running on server
  if (typeof window === 'undefined') return false;

  // Check multiple indicators for mobile
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));

  // Check touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check viewport width
  const isMobileWidth = window.innerWidth <= BREAKPOINTS.tablet;

  // Check device pixel ratio (retina displays common on mobile)
  const isHighDPI = window.devicePixelRatio > 1;

  // Mobile if: (mobile UA OR has touch) AND mobile width
  return (isMobileUA || hasTouch) && isMobileWidth;
}

export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  const isIPad = userAgent.includes('ipad') || (userAgent.includes('mac') && 'ontouchstart' in window);

  return (width > BREAKPOINTS.mobile && width <= BREAKPOINTS.laptop) || isIPad;
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobileDevice()) return 'mobile';
  if (isTabletDevice()) return 'tablet';
  return 'desktop';
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /android/.test(navigator.userAgent.toLowerCase());
}

export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check multiple indicators
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
  
  // iOS specific check
  const isIOSPWA = ('standalone' in navigator) && (navigator as any).standalone;
  
  return isStandalone || isFullscreen || isMinimalUI || isIOSPWA;
}

export function getNetworkType(): '4g' | '3g' | '2g' | 'slow-2g' | 'unknown' {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return 'unknown';
  }

  const connection = (navigator as any).connection;
  if (!connection) return 'unknown';

  // Use effectiveType if available (most reliable)
  if (connection.effectiveType) {
    return connection.effectiveType;
  }

  // Fallback to type
  const type = connection.type;
  if (type === 'wifi' || type === 'ethernet') return '4g';
  if (type === 'bluetooth' || type === 'wimax') return '3g';
  
  return 'unknown';
}

export function isSlowNetwork(): boolean {
  const networkType = getNetworkType();
  return networkType === '2g' || networkType === 'slow-2g';
}

export function getOptimalImageSize(containerWidth: number): string {
  const dpr = window.devicePixelRatio || 1;
  const actualWidth = containerWidth * dpr;

  // Return closest size from predefined sizes
  const sizes = [320, 640, 960, 1280, 1920];
  return sizes.find(size => size >= actualWidth)?.toString() || '1920';
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Touch gesture utilities
export function isTouchEvent(event: Event): event is TouchEvent {
  return 'touches' in event;
}

export function getEventPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if (isTouchEvent(event)) {
    const touch = event.touches[0] || event.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  }
  return { x: event.clientX, y: event.clientY };
}

// Viewport utilities
export function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  // Get CSS environment variables for safe area
  const computedStyle = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
  };
}

// Performance utilities
export function shouldReduceData(): boolean {
  if (typeof window === 'undefined') return false;

  // Check save data preference
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection.saveData) return true;
  }

  // Check if on slow network
  return isSlowNetwork();
}

export function getOptimalLoadStrategy(): 'eager' | 'lazy' | 'progressive' {
  if (shouldReduceData()) return 'lazy';
  if (isSlowNetwork()) return 'progressive';
  return 'eager';
}