// Mock implementation that logs events
class MockServerRealtimeService {
    async emitMediaUpload(tournamentId, matchId, media) {
        console.log(`[Mock] Would emit media upload event for tournament ${tournamentId}, match ${matchId}:`, {
            type: 'media-upload',
            data: { media }
        });
    }
    async emitMediaDelete(matchId, mediaId) {
        console.log(`[Mock] Would emit media delete event for match ${matchId}:`, {
            type: 'media-delete',
            data: { mediaId }
        });
    }
    async emitHighlightDetected(tournamentId, highlight) {
        console.log(`[Mock] Would emit highlight detected event for tournament ${tournamentId}:`, {
            type: 'highlight-detected',
            data: highlight
        });
    }
}
// Real Pusher server implementation
class PusherServerRealtimeService {
    constructor() {
        Object.defineProperty(this, "pusher", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        // Only initialize if we have server-side Pusher config
        if (this.isPusherConfigured()) {
            this.initializePusher();
        }
    }
    isPusherConfigured() {
        return !!(process.env.PUSHER_APP_ID &&
            process.env.PUSHER_SECRET &&
            process.env.VITE_PUSHER_KEY &&
            process.env.VITE_PUSHER_CLUSTER);
    }
    async initializePusher() {
        try {
            const Pusher = (await import('pusher')).default;
            this.pusher = new Pusher({
                appId: process.env.PUSHER_APP_ID,
                key: process.env.VITE_PUSHER_KEY,
                secret: process.env.PUSHER_SECRET,
                cluster: process.env.VITE_PUSHER_CLUSTER,
                useTLS: true,
            });
            console.log('✅ Pusher server initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize Pusher server:', error);
            throw error;
        }
    }
    async emitMediaUpload(tournamentId, matchId, media) {
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
        }
        catch (error) {
            console.error('❌ Failed to emit media upload event:', error);
        }
    }
    async emitMediaDelete(matchId, mediaId) {
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
        }
        catch (error) {
            console.error('❌ Failed to emit media delete event:', error);
        }
    }
    async emitHighlightDetected(tournamentId, highlight) {
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
        }
        catch (error) {
            console.error('❌ Failed to emit highlight detection event:', error);
        }
    }
}
// Factory function to create the appropriate service
function createServerRealtimeService() {
    // In server environment, check if Pusher is configured
    if (typeof globalThis.window === 'undefined') {
        const isConfigured = !!(process.env.PUSHER_APP_ID &&
            process.env.PUSHER_SECRET &&
            process.env.VITE_PUSHER_KEY);
        if (isConfigured && process.env.VITE_ENABLE_REALTIME !== 'false') {
            return new PusherServerRealtimeService();
        }
    }
    return new MockServerRealtimeService();
}
// Export singleton
export const realtimeService = createServerRealtimeService();
