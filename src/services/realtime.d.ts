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
export declare const realtimeService: RealtimeService;
