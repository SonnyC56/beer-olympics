import { EventEmitter } from 'events';
export interface QueuedMessage {
    id: string;
    channel: string;
    event: string;
    data: any;
    timestamp: number;
    attempts: number;
    priority: 'low' | 'normal' | 'high' | 'critical';
    ttl?: number;
    persistent?: boolean;
}
export interface QueueConfig {
    maxSize: number;
    maxRetries: number;
    retryDelay: number;
    batchSize: number;
    flushInterval: number;
    persistenceKey?: string;
}
export declare class MessageQueue extends EventEmitter {
    private queue;
    private priorityIndex;
    private config;
    private flushTimer?;
    private processing;
    constructor(config?: Partial<QueueConfig>);
    enqueue(message: Omit<QueuedMessage, 'id' | 'timestamp' | 'attempts'>): string;
    enqueueBatch(messages: Array<Omit<QueuedMessage, 'id' | 'timestamp' | 'attempts'>>): string[];
    getNextBatch(): QueuedMessage[];
    markAsSent(ids: string[]): void;
    markAsFailed(ids: string[], error?: Error): void;
    processQueue(sendFunction: (messages: QueuedMessage[]) => Promise<boolean>): Promise<void>;
    private removeMessage;
    private removeOldestLowPriority;
    private generateId;
    private startFlushTimer;
    private persistQueue;
    private loadPersistedMessages;
    getStats(): {
        total: number;
        byPriority: Record<string, number>;
        oldest: number | null;
        processing: boolean;
    };
    clear(): void;
    destroy(): void;
}
export declare class MessageDeduplicator {
    private seen;
    private ttl;
    private cleanupInterval;
    constructor(ttl?: number);
    isDuplicate(channel: string, event: string, data: any): boolean;
    private generateKey;
    private hash;
    private cleanup;
    destroy(): void;
}
