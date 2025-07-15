import { IncomingMessage } from 'http';
export declare class RealtimeWebSocketServer {
    private wss;
    private clients;
    private channels;
    constructor();
    private initialize;
    private handleConnection;
    private handleMessage;
    private handleDisconnect;
    private subscribeToChannel;
    private unsubscribeFromChannel;
    private broadcastToChannel;
    broadcast(channel: string, event: string, data: any): void;
    getChannelInfo(channel: string): {
        channel: string;
        subscriptionCount: number;
    };
    getActiveChannels(): string[];
    private generateClientId;
}
export declare const wsServer: RealtimeWebSocketServer;
export declare function handleWebSocketUpgrade(req: IncomingMessage, socket: any, head: any): void;
