import Pusher from 'pusher';
// Server-side Pusher instance for broadcasting events
class PusherServerService {
    constructor() {
        Object.defineProperty(this, "pusher", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "initialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.initialize();
    }
    initialize() {
        // Only initialize if Pusher is configured
        if (!this.isPusherConfigured()) {
            console.log('⚠️ Pusher not configured for server-side broadcasting');
            return;
        }
        try {
            this.pusher = new Pusher({
                appId: process.env.PUSHER_APP_ID,
                key: process.env.VITE_PUSHER_KEY,
                secret: process.env.PUSHER_SECRET,
                cluster: process.env.VITE_PUSHER_CLUSTER || 'us2',
                useTLS: true,
            });
            this.initialized = true;
            console.log('✅ Server-side Pusher initialized successfully');
        }
        catch (error) {
            console.error('❌ Failed to initialize server-side Pusher:', error);
        }
    }
    isPusherConfigured() {
        return !!(process.env.PUSHER_APP_ID &&
            process.env.VITE_PUSHER_KEY &&
            process.env.PUSHER_SECRET);
    }
    // Broadcast score update to all clients watching a tournament
    async broadcastScoreUpdate(tournamentId, matchId, teamId, points, metadata) {
        if (!this.pusher)
            return false;
        try {
            await this.pusher.trigger(`tournament-${tournamentId}`, 'score-update', {
                tournamentId,
                matchId,
                teamId,
                points,
                timestamp: Date.now(),
                ...metadata,
            });
            // Also send live score event with delta
            await this.pusher.trigger(`tournament-${tournamentId}`, 'live-score', {
                tournamentId,
                matchId,
                teamId,
                score: points,
                delta: 1, // Assuming 1 point per score
                timestamp: Date.now(),
                playerAction: metadata,
            });
            return true;
        }
        catch (error) {
            console.error('Failed to broadcast score update:', error);
            return false;
        }
    }
    // Broadcast match completion
    async broadcastMatchComplete(tournamentId, matchId, winner, finalScores) {
        if (!this.pusher)
            return false;
        try {
            await this.pusher.trigger(`tournament-${tournamentId}`, 'match-complete', {
                tournamentId,
                matchId,
                winner,
                timestamp: Date.now(),
            });
            // Also send game end event
            await this.pusher.trigger(`tournament-${tournamentId}`, 'game-end', {
                tournamentId,
                matchId,
                finalScores,
                duration: Date.now(), // Would be calculated from actual start time
            });
            return true;
        }
        catch (error) {
            console.error('Failed to broadcast match complete:', error);
            return false;
        }
    }
    // Broadcast when a new team joins
    async broadcastTeamJoined(tournamentId, team) {
        if (!this.pusher)
            return false;
        try {
            await this.pusher.trigger(`tournament-${tournamentId}`, 'team-joined', {
                tournamentId,
                team,
                timestamp: Date.now(),
            });
            return true;
        }
        catch (error) {
            console.error('Failed to broadcast team joined:', error);
            return false;
        }
    }
    // Broadcast tournament status change
    async broadcastTournamentStatus(tournamentId, isOpen) {
        if (!this.pusher)
            return false;
        try {
            await this.pusher.trigger(`tournament-${tournamentId}`, 'tournament-status', {
                tournamentId,
                isOpen,
                timestamp: Date.now(),
            });
            return true;
        }
        catch (error) {
            console.error('Failed to broadcast tournament status:', error);
            return false;
        }
    }
    // Broadcast leaderboard updates
    async broadcastLeaderboardUpdate(tournamentId, rankings, changedPositions) {
        if (!this.pusher)
            return false;
        try {
            await this.pusher.trigger(`tournament-${tournamentId}`, 'leaderboard-update', {
                tournamentId,
                rankings,
                changedPositions,
                timestamp: Date.now(),
            });
            return true;
        }
        catch (error) {
            console.error('Failed to broadcast leaderboard update:', error);
            return false;
        }
    }
    // Send targeted notifications
    async sendNotification(tournamentId, notification) {
        if (!this.pusher)
            return false;
        try {
            await this.pusher.trigger(`tournament-${tournamentId}`, 'notification', {
                tournamentId,
                ...notification,
                timestamp: Date.now(),
            });
            return true;
        }
        catch (error) {
            console.error('Failed to send notification:', error);
            return false;
        }
    }
    // Broadcast game start
    async broadcastGameStart(tournamentId, matchId, gameType, teams) {
        if (!this.pusher)
            return false;
        try {
            await this.pusher.trigger(`tournament-${tournamentId}`, 'game-start', {
                tournamentId,
                matchId,
                gameType,
                teams,
                startTime: Date.now(),
            });
            return true;
        }
        catch (error) {
            console.error('Failed to broadcast game start:', error);
            return false;
        }
    }
    // Broadcast tournament lifecycle events
    async broadcastTournamentStart(tournamentId, totalTeams, totalMatches) {
        if (!this.pusher)
            return false;
        try {
            await this.pusher.trigger(`tournament-${tournamentId}`, 'tournament-start', {
                tournamentId,
                totalTeams,
                totalMatches,
                timestamp: Date.now(),
            });
            return true;
        }
        catch (error) {
            console.error('Failed to broadcast tournament start:', error);
            return false;
        }
    }
    async broadcastTournamentComplete(tournamentId, winner, finalRankings) {
        if (!this.pusher)
            return false;
        try {
            await this.pusher.trigger(`tournament-${tournamentId}`, 'tournament-complete', {
                tournamentId,
                winner,
                finalRankings,
                timestamp: Date.now(),
            });
            return true;
        }
        catch (error) {
            console.error('Failed to broadcast tournament complete:', error);
            return false;
        }
    }
    // Authenticate private/presence channels
    authenticateChannel(socketId, channelName, userData) {
        if (!this.pusher) {
            throw new Error('Pusher not initialized');
        }
        // For presence channels, include user data
        if (channelName.startsWith('presence-')) {
            return this.pusher.authorizeChannel(socketId, channelName, {
                user_id: userData?.user_id || socketId,
                user_info: userData
            });
        }
        // For private channels, just authenticate
        // @ts-expect-error Pusher types don't match for private channels
        return this.pusher.authorizeChannel(socketId, channelName, null);
    }
    // Get channel info (useful for presence channels)
    async getChannelInfo(channelName) {
        if (!this.pusher)
            return null;
        try {
            const response = await this.pusher.get({
                path: `/channels/${channelName}`,
                params: channelName.startsWith('presence-')
                    ? { info: 'user_count,subscription_count' }
                    : { info: 'subscription_count' },
            });
            return response;
        }
        catch (error) {
            console.error('Failed to get channel info:', error);
            return null;
        }
    }
    // Batch trigger multiple events efficiently
    async batchTrigger(events) {
        if (!this.pusher || events.length === 0)
            return false;
        try {
            // Pusher supports batch triggering up to 10 events
            const batches = [];
            for (let i = 0; i < events.length; i += 10) {
                batches.push(events.slice(i, i + 10));
            }
            await Promise.all(batches.map(batch => this.pusher.triggerBatch(batch.map(({ channel, event, data }) => ({
                channel,
                name: event,
                data: JSON.stringify(data),
            })))));
            return true;
        }
        catch (error) {
            console.error('Failed to batch trigger events:', error);
            return false;
        }
    }
    // Health check
    isHealthy() {
        return this.initialized && this.pusher !== null;
    }
}
// Export singleton instance
export const pusherServer = new PusherServerService();
// Helper function to safely broadcast (won't throw if Pusher isn't configured)
export async function safeBroadcast(fn) {
    try {
        return await fn();
    }
    catch (error) {
        console.warn('Broadcast failed (Pusher may not be configured):', error);
        return false;
    }
}
