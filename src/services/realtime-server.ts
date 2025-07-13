// Server-side realtime service for emitting events
import type { Media } from '../types';

// Mock implementation that logs events
class MockServerRealtimeService {
  async emitMediaUpload(tournamentId: string, matchId: string, media: Media): Promise<void> {
    console.log(`[Mock] Would emit media upload event for tournament ${tournamentId}, match ${matchId}:`, {
      type: 'media-upload',
      data: { media }
    });
  }

  async emitMediaDelete(matchId: string, mediaId: string): Promise<void> {
    console.log(`[Mock] Would emit media delete event for match ${matchId}:`, {
      type: 'media-delete', 
      data: { mediaId }
    });
  }

  async emitHighlightDetected(tournamentId: string, highlight: { type: string; mediaId: string; confidence: number }): Promise<void> {
    console.log(`[Mock] Would emit highlight detected event for tournament ${tournamentId}:`, {
      type: 'highlight-detected',
      data: highlight
    });
  }
}

// Real Pusher server implementation
class PusherServerRealtimeService {
  private pusher: any = null;

  constructor() {
    // Only initialize if we have server-side Pusher config
    if (this.isPusherConfigured()) {
      this.initializePusher();
    }
  }

  private isPusherConfigured(): boolean {
    return !!(
      process.env.PUSHER_APP_ID &&
      process.env.PUSHER_SECRET &&
      process.env.VITE_PUSHER_KEY &&
      process.env.VITE_PUSHER_CLUSTER
    );
  }

  private async initializePusher(): Promise<void> {
    try {
      const Pusher = (await import('pusher')).default;
      this.pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.VITE_PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.VITE_PUSHER_CLUSTER!,
        useTLS: true,
      });
      console.log('✅ Pusher server initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Pusher server:', error);
      throw error;
    }
  }

  async emitMediaUpload(tournamentId: string, matchId: string, media: Media): Promise<void> {
    if (!this.pusher) {
      console.log('No Pusher configured, skipping media upload emit');
      return;
    }

    try {
      await this.pusher.trigger([
        `tournament-${tournamentId}`,
        `match-${matchId}`,
      ], 'media-upload', {
        media,
        timestamp: Date.now(),
      });
      
      console.log(`✅ Emitted media upload event for match ${matchId}`);
    } catch (error) {
      console.error('❌ Failed to emit media upload event:', error);
    }
  }

  async emitMediaDelete(matchId: string, mediaId: string): Promise<void> {
    if (!this.pusher) {
      console.log('No Pusher configured, skipping media delete emit');
      return;
    }

    try {
      await this.pusher.trigger(`match-${matchId}`, 'media-delete', {
        mediaId,
        timestamp: Date.now(),
      });
      
      console.log(`✅ Emitted media delete event for match ${matchId}`);
    } catch (error) {
      console.error('❌ Failed to emit media delete event:', error);
    }
  }

  async emitHighlightDetected(tournamentId: string, highlight: { type: string; mediaId: string; confidence: number }): Promise<void> {
    if (!this.pusher) {
      console.log('No Pusher configured, skipping highlight detection emit');
      return;
    }

    try {
      await this.pusher.trigger(`tournament-${tournamentId}`, 'highlight-detected', {
        ...highlight,
        timestamp: Date.now(),
      });
      
      console.log(`✅ Emitted highlight detection event for tournament ${tournamentId}`);
    } catch (error) {
      console.error('❌ Failed to emit highlight detection event:', error);
    }
  }
}

// Factory function to create the appropriate service
function createServerRealtimeService() {
  // In server environment, check if Pusher is configured
  if (typeof globalThis.window === 'undefined') {
    const isConfigured = !!(
      process.env.PUSHER_APP_ID &&
      process.env.PUSHER_SECRET &&
      process.env.VITE_PUSHER_KEY
    );

    if (isConfigured && process.env.VITE_ENABLE_REALTIME !== 'false') {
      return new PusherServerRealtimeService();
    }
  }
  
  return new MockServerRealtimeService();
}

// Export singleton
export const realtimeService = createServerRealtimeService();