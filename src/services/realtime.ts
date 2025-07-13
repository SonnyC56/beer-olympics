// Real-time service interface - completely optional
export interface RealtimeService {
  subscribe(channel: string): RealtimeChannel | null;
  unsubscribe(channel: string): void;
  isConnected(): boolean;
}

export interface RealtimeChannel {
  bind(event: string, callback: (data: any) => void): () => void;
  unbind(event?: string, callback?: (data: any) => void): void;
  trigger(event: string, data: any): void;
}

// Mock implementation that does nothing - always works
class MockRealtimeService implements RealtimeService {
  subscribe(channel: string): RealtimeChannel | null {
    console.log(`[Mock] Would subscribe to channel: ${channel}`);
    return {
      bind: (event: string, _callback: (data: any) => void) => {
        console.log(`[Mock] Would bind to event: ${event}`);
        return () => {}; // cleanup function
      },
      unbind: () => {
        console.log(`[Mock] Would unbind events`);
      },
      trigger: (event: string, data: any) => {
        console.log(`[Mock] Would trigger event: ${event}`, data);
      }
    };
  }

  unsubscribe(channel: string): void {
    console.log(`[Mock] Would unsubscribe from channel: ${channel}`);
  }

  isConnected(): boolean {
    return false; // Mock is never "connected"
  }
}

// Real Pusher implementation - only loaded if configured
class PusherRealtimeService implements RealtimeService {
  private pusher: any = null;
  private channels = new Map<string, any>();

  constructor() {
    // Only try to load Pusher if configured
    if (this.isPusherConfigured()) {
      this.initializePusher();
    }
  }

  private isPusherConfigured(): boolean {
    return !!(import.meta.env.VITE_PUSHER_KEY);
  }

  private async initializePusher() {
    try {
      // Dynamic import so it doesn't break if pusher-js isn't available
      const PusherClient = (await import('pusher-js')).default;
      
      this.pusher = new PusherClient(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'us2',
        forceTLS: true,
      });

      console.log('✅ Pusher initialized successfully');
    } catch (error) {
      console.warn('⚠️ Failed to initialize Pusher:', error);
      this.pusher = null;
    }
  }

  subscribe(channelName: string): RealtimeChannel | null {
    if (!this.pusher) return null;

    try {
      const existing = this.channels.get(channelName);
      if (existing) return this.wrapChannel(existing);

      const channel = this.pusher.subscribe(channelName);
      this.channels.set(channelName, channel);
      return this.wrapChannel(channel);
    } catch (error) {
      console.warn(`Failed to subscribe to channel ${channelName}:`, error);
      return null;
    }
  }

  unsubscribe(channelName: string): void {
    if (!this.pusher) return;

    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        channel.unbind_all();
        this.pusher.unsubscribe(channelName);
        this.channels.delete(channelName);
      }
    } catch (error) {
      console.warn(`Failed to unsubscribe from channel ${channelName}:`, error);
    }
  }

  isConnected(): boolean {
    return this.pusher?.connection?.state === 'connected';
  }

  private wrapChannel(pusherChannel: any): RealtimeChannel {
    return {
      bind: (event: string, callback: (data: any) => void) => {
        pusherChannel.bind(event, callback);
        return () => pusherChannel.unbind(event, callback);
      },
      unbind: (event?: string, callback?: (data: any) => void) => {
        if (event) {
          pusherChannel.unbind(event, callback);
        } else {
          pusherChannel.unbind_all();
        }
      },
      trigger: (event: string, data: any) => {
        if (event.startsWith('client-')) {
          pusherChannel.trigger(event, data);
        }
      }
    };
  }
}

// Service factory - automatically chooses the right implementation
function createRealtimeService(): RealtimeService {
  // Check if we want real-time features AND they're configured
  const wantsRealtime = import.meta.env.VITE_ENABLE_REALTIME !== 'false';
  const isConfigured = !!(import.meta.env.VITE_PUSHER_KEY);

  if (wantsRealtime && isConfigured) {
    console.log('🚀 Using Pusher for real-time features');
    return new PusherRealtimeService();
  } else {
    console.log('📱 Using mock real-time service (app works without Pusher)');
    return new MockRealtimeService();
  }
}

// Export singleton instance
export const realtimeService = createRealtimeService();