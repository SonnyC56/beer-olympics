import Pusher from 'pusher';
declare class PusherServerService {
    private pusher;
    private initialized;
    constructor();
    private initialize;
    private isPusherConfigured;
    broadcastScoreUpdate(tournamentId: string, matchId: string, teamId: string, points: number, metadata?: {
        playerId?: string;
        action?: 'cup' | 'bounce' | 'miss';
    }): Promise<boolean>;
    broadcastMatchComplete(tournamentId: string, matchId: string, winner: string, finalScores: Record<string, number>): Promise<boolean>;
    broadcastTeamJoined(tournamentId: string, team: {
        id: string;
        name: string;
        colorHex: string;
        flagCode: string;
    }): Promise<boolean>;
    broadcastTournamentStatus(tournamentId: string, isOpen: boolean): Promise<boolean>;
    broadcastLeaderboardUpdate(tournamentId: string, rankings: Array<{
        teamId: string;
        rank: number;
        points: number;
        wins: number;
        losses: number;
        pointDiff: number;
    }>, changedPositions: Array<{
        teamId: string;
        oldRank: number;
        newRank: number;
    }>): Promise<boolean>;
    sendNotification(tournamentId: string, notification: {
        type: 'info' | 'warning' | 'success' | 'error';
        title: string;
        message: string;
        targetTeams?: string[];
    }): Promise<boolean>;
    broadcastGameStart(tournamentId: string, matchId: string, gameType: string, teams: string[]): Promise<boolean>;
    broadcastTournamentStart(tournamentId: string, totalTeams: number, totalMatches: number): Promise<boolean>;
    broadcastTournamentComplete(tournamentId: string, winner: string, finalRankings: string[]): Promise<boolean>;
    authenticateChannel(socketId: string, channelName: string, userData?: any): Pusher.ChannelAuthResponse;
    getChannelInfo(channelName: string): Promise<Pusher.Response | null>;
    batchTrigger(events: Array<{
        channel: string;
        event: string;
        data: any;
    }>): Promise<boolean>;
    isHealthy(): boolean;
}
export declare const pusherServer: PusherServerService;
export declare function safeBroadcast(fn: () => Promise<boolean>): Promise<boolean>;
export {};
