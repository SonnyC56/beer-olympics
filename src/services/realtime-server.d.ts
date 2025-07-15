import type { Media } from '../types';
declare class MockServerRealtimeService {
    emitMediaUpload(tournamentId: string, matchId: string, media: Media): Promise<void>;
    emitMediaDelete(matchId: string, mediaId: string): Promise<void>;
    emitHighlightDetected(tournamentId: string, highlight: {
        type: string;
        mediaId: string;
        confidence: number;
    }): Promise<void>;
}
declare class PusherServerRealtimeService {
    private pusher;
    constructor();
    private isPusherConfigured;
    private initializePusher;
    emitMediaUpload(tournamentId: string, matchId: string, media: Media): Promise<void>;
    emitMediaDelete(matchId: string, mediaId: string): Promise<void>;
    emitHighlightDetected(tournamentId: string, highlight: {
        type: string;
        mediaId: string;
        confidence: number;
    }): Promise<void>;
}
export declare const realtimeService: MockServerRealtimeService | PusherServerRealtimeService;
export {};
