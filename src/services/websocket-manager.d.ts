import { EventEmitter } from 'events';
export interface ConnectionPoolConfig {
    maxConnections: number;
    maxConnectionsPerEndpoint: number;
    connectionTimeout: number;
    healthCheckInterval: number;
    maxReconnectAttempts: number;
    reconnectBackoff: {
        initial: number;
        max: number;
        multiplier: number;
    };
}
export interface PooledConnection {
    id: string;
    endpoint: string;
    ws: WebSocket;
    state: 'connecting' | 'connected' | 'disconnected' | 'failed';
    activeChannels: Set<string>;
    metrics: {
        messagesIn: number;
        messagesOut: number;
        bytesIn: number;
        bytesOut: number;
        latency: number[];
        connectedAt?: number;
        lastActivity: number;
    };
    reconnectAttempts: number;
    healthScore: number;
}
export interface ConnectionMetrics {
    totalConnections: number;
    activeConnections: number;
    totalMessages: number;
    totalBytes: number;
    averageLatency: number;
    connectionHealth: number;
    channelDistribution: Map<string, number>;
}
export declare class WebSocketConnectionPool extends EventEmitter {
    private connections;
    private channelToConnection;
    private endpoints;
    private config;
    private healthCheckTimer?;
    private metricsBuffer;
    constructor(endpoints: string[], config?: Partial<ConnectionPoolConfig>);
    getConnectionForChannel(channel: string): Promise<PooledConnection>;
    private findOrCreateBestConnection;
    private createConnection;
    private selectEndpoint;
    private setupConnection;
    private handleMessage;
    private handleDisconnection;
    private scheduleReconnection;
    sendMessage(connection: PooledConnection, message: any): boolean;
    private sendPing;
    private startHealthChecks;
    private performHealthChecks;
    private collectMetrics;
    getMetrics(): ConnectionMetrics;
    getConnectionDetails(): PooledConnection[];
    close(): Promise<void>;
}
export declare class BinaryProtocol {
    private static readonly MESSAGE_TYPES;
    static encode(message: any): ArrayBuffer;
    static decode(data: ArrayBuffer): any;
    private static compress;
    private static decompress;
}
