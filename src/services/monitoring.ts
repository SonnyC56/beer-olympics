// Error tracking and monitoring service

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

class MonitoringService {
  private isDevelopment = import.meta.env.DEV;
  private sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  private analyticsId = import.meta.env.VITE_VERCEL_ANALYTICS_ID;

  constructor() {
    this.initSentry();
    this.initAnalytics();
    this.setupErrorHandlers();
  }

  private initSentry() {
    if (!this.sentryDsn || this.isDevelopment) {
      console.log('Sentry not configured or in development mode');
      return;
    }

    // In a real app, you would import and configure Sentry here
    // import * as Sentry from '@sentry/react';
    // Sentry.init({ dsn: this.sentryDsn });
    console.log('Sentry would be initialized with DSN:', this.sentryDsn);
  }

  private initAnalytics() {
    if (!this.analyticsId || this.isDevelopment) {
      console.log('Analytics not configured or in development mode');
      return;
    }

    // In a real app, you would initialize analytics here
    console.log('Analytics would be initialized with ID:', this.analyticsId);
  }

  private setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        action: 'global_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        action: 'unhandled_rejection',
      });
    });
  }

  captureError(error: Error | string, context?: ErrorContext) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' ? error.stack : undefined;

    console.error('Error captured:', {
      message: errorMessage,
      stack: errorStack,
      context,
    });

    if (this.isDevelopment) {
      return;
    }

    // In production, send to error tracking service
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: errorMessage,
          stack: errorStack,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch((err) => {
        console.error('Failed to send error to tracking service:', err);
      });
    } catch (err) {
      console.error('Error in error tracking:', err);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    console.log(`[${level.toUpperCase()}] ${message}`, context);

    if (this.isDevelopment) {
      return;
    }

    // Send to logging service in production
    try {
      fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          level,
          context,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        }),
      }).catch((err) => {
        console.error('Failed to send log to service:', err);
      });
    } catch (err) {
      console.error('Error in logging:', err);
    }
  }

  trackPerformance(metric: PerformanceMetric) {
    console.log('Performance metric:', metric);

    if (this.isDevelopment) {
      return;
    }

    // Send to analytics service
    try {
      fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metric,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        }),
      }).catch((err) => {
        console.error('Failed to send metric:', err);
      });
    } catch (err) {
      console.error('Error in performance tracking:', err);
    }
  }

  trackEvent(event: AnalyticsEvent) {
    console.log('Analytics event:', event);

    if (this.isDevelopment) {
      return;
    }

    // Send to analytics service
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        }),
      }).catch((err) => {
        console.error('Failed to send analytics event:', err);
      });
    } catch (err) {
      console.error('Error in event tracking:', err);
    }
  }

  // Performance timing helpers
  startTiming(name: string) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
    }
    return Date.now();
  }

  endTiming(name: string, startTime?: number, context?: Record<string, any>) {
    let duration: number;

    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      try {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        duration = measure.duration;
      } catch {
        duration = startTime ? Date.now() - startTime : 0;
      }
    } else {
      duration = startTime ? Date.now() - startTime : 0;
    }

    this.trackPerformance({
      name,
      duration,
      context,
    });

    return duration;
  }

  // User context for error tracking
  setUser(user: { id: string; email: string; name: string }) {
    console.log('User context set:', user);
    
    // In production, set user context for error tracking
    if (!this.isDevelopment) {
      // Sentry.setUser(user);
    }
  }

  clearUser() {
    console.log('User context cleared');
    
    // In production, clear user context
    if (!this.isDevelopment) {
      // Sentry.setUser(null);
    }
  }
}

// Create singleton instance
export const monitoring = new MonitoringService();

// Export convenience functions
export const captureError = (error: Error | string, context?: ErrorContext) => 
  monitoring.captureError(error, context);

export const captureMessage = (message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext) => 
  monitoring.captureMessage(message, level, context);

export const trackPerformance = (metric: PerformanceMetric) => 
  monitoring.trackPerformance(metric);

export const trackEvent = (event: AnalyticsEvent) => 
  monitoring.trackEvent(event);

export const startTiming = (name: string) => 
  monitoring.startTiming(name);

export const endTiming = (name: string, startTime?: number, context?: Record<string, any>) => 
  monitoring.endTiming(name, startTime, context);

export const setUser = (user: { id: string; email: string; name: string }) => 
  monitoring.setUser(user);

export const clearUser = () => 
  monitoring.clearUser();