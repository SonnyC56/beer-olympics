import { WebSocketConnectionPool, BinaryProtocol } from './websocket-manager';
import { MessageQueue, MessageDeduplicator } from '../utils/websocket-queue';
import { RoomManager, TournamentRoomManager } from './websocket-rooms';
import { BaseRealtimeService } from './realtime-enhanced';
// Scalable WebSocket service with connection pooling and advanced features
export class ScalableWebSocketService extends BaseRealtimeService {
    constructor() {
        super();
        Object.defineProperty(this, "connectionPool", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "messageQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "deduplicator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "roomManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tournamentRoomManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "channels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "presenceData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        }); // channel -> members
        Object.defineProperty(this, "endpoints", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "reconnectTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queueProcessor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Initialize components
        this.messageQueue = new MessageQueue({
            maxSize: 5000,
            maxRetries: 5,
            batchSize: 100,
            flushInterval: 50,
            persistenceKey: 'beer-olympics-queue',
        });
        this.deduplicator = new MessageDeduplicator(30000); // 30s TTL
        this.roomManager = new RoomManager();
        this.tournamentRoomManager = new TournamentRoomManager(this.roomManager);
        // Configure endpoints
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const baseUrl = import.meta.env.VITE_WS_URL || `${wsProtocol}//${window.location.host}`;
        // Multiple endpoints for load balancing
        this.endpoints = [
            `${baseUrl}/ws`,
            `${baseUrl}/ws-secondary`,
            `${baseUrl}/ws-tertiary`,
        ].filter(url => url.startsWith('ws')); // Filter valid URLs
        // If no valid endpoints, add default
        if (this.endpoints.length === 0) {
            this.endpoints = [`${wsProtocol}//${window.location.host}/ws`];
        }
        // Setup event handlers
        this.setupEventHandlers();
    }
    async connect() {
        if (this.connectionPool)
            return;
        this.updateConnectionState('connecting');
        try {
            // Create connection pool
            this.connectionPool = new WebSocketConnectionPool(this.endpoints, {
                maxConnections: 10,
                maxConnectionsPerEndpoint: 5,
                connectionTimeout: 10000,
                healthCheckInterval: 30000,
            });
            // Setup pool event handlers
            this.setupPoolHandlers();
            // Wait for at least one connection
            await this.waitForConnection();
            // Start queue processing
            this.startQueueProcessing();
            this.connectionStartTime = Date.now();
            this.updateConnectionState('connected');
            console.log('✅ Scalable WebSocket service connected');
        }
        catch (error) {
            console.error('❌ Failed to connect:', error);
            this.updateConnectionState('failed', error);
            throw error;
        }
    }
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.queueProcessor) {
            clearInterval(this.queueProcessor);
        }
        if (this.connectionPool) {
            this.updateConnectionState('disconnecting');
            this.connectionPool.close();
            this.connectionPool = null;
            this.channels.clear();
            this.presenceData.clear();
            this.updateConnectionState('disconnected');
        }
    }
    async reconnect() {
        this.disconnect();
        this.connectionState.retryCount++;
        this.metrics.reconnectCount++;
        await this.connect();
        // Resubscribe to all channels
        for (const [channel] of this.channels) {
            await this.subscribeToChannel(channel);
        }
    }
    subscribe(channelName) {
        if (!this.connectionPool)
            return null;
        // Create channel binding structure
        if (!this.channels.has(channelName)) {
            this.channels.set(channelName, new Set());
            // Subscribe via connection pool
            this.subscribeToChannel(channelName).catch(console.error);
        }
        const channelBindings = this.channels.get(channelName);
        return {
            bind: (event, callback) => {
                const binding = { event, callback };
                channelBindings.add(binding);
                // Setup room subscription for efficient routing
                this.roomManager.subscribe(channelName, event, (roomEvent) => {
                    if (!this.deduplicator.isDuplicate(channelName, event, roomEvent.data)) {
                        callback(roomEvent.data);
                    }
                });
                return () => {
                    channelBindings.delete(binding);
                };
            },
            unbind: (event, callback) => {
                if (!event) {
                    channelBindings.clear();
                }
                else {
                    for (const binding of channelBindings) {
                        if (binding.event === event && (!callback || binding.callback === callback)) {
                            channelBindings.delete(binding);
                        }
                    }
                }
            },
            trigger: (event, data) => {
                if (event.startsWith('client-')) {
                    this.sendToChannel(channelName, event, data);
                }
            },
        };
    }
    subscribePresence(channelName) {
        if (!channelName.startsWith('presence-'))
            return null;
        const channel = this.subscribe(channelName);
        if (!channel)
            return null;
        // Initialize presence data
        if (!this.presenceData.has(channelName)) {
            this.presenceData.set(channelName, new Map());
        }
        const members = this.presenceData.get(channelName);
        return {
            ...channel,
            getMembers: () => members,
            getMe: () => members.get('self'),
            onMemberAdded: (callback) => {
                return channel.bind('presence:member_added', callback);
            },
            onMemberRemoved: (callback) => {
                return channel.bind('presence:member_removed', callback);
            },
        };
    }
    unsubscribe(channelName) {
        if (!this.connectionPool)
            return;
        // Clean up local bindings
        this.channels.delete(channelName);
        this.presenceData.delete(channelName);
        // Unsubscribe from connection pool
        this.unsubscribeFromChannel(channelName).catch(console.error);
    }
    isConnected() {
        return this.connectionState.state === 'connected' &&
            this.connectionPool !== null;
    }
    // Get room manager for advanced room features
    getRoomManager() {
        return this.roomManager;
    }
    // Get tournament room manager
    getTournamentRoomManager() {
        return this.tournamentRoomManager;
    }
    // Private helper methods
    async waitForConnection() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000);
            const checkConnection = () => {
                const metrics = this.connectionPool?.getMetrics();
                if (metrics && metrics.activeConnections > 0) {
                    clearTimeout(timeout);
                    clearInterval(interval);
                    resolve();
                }
            };
            const interval = setInterval(checkConnection, 100);
            checkConnection();
        });
    }
    async subscribeToChannel(channel) {
        if (!this.connectionPool)
            return;
        try {
            const connection = await this.connectionPool.getConnectionForChannel(channel);
            // Create room for channel-based routing
            const roomType = channel.startsWith('presence-') ? 'presence' :
                channel.startsWith('private-') ? 'private' :
                    channel.includes('tournament') ? 'tournament' :
                        channel.includes('match') ? 'match' : 'global';
            this.roomManager.createRoom({
                id: channel,
                name: channel,
                type: roomType,
            });
            // Send subscribe message
            this.connectionPool.sendMessage(connection, {
                type: 'subscribe',
                channel,
                auth: this.getChannelAuth(channel),
            });
        }
        catch (error) {
            console.error(`Failed to subscribe to ${channel}:`, error);
        }
    }
    async unsubscribeFromChannel(channel) {
        if (!this.connectionPool)
            return;
        try {
            const connections = this.connectionPool.getConnectionDetails();
            for (const connection of connections) {
                if (connection.activeChannels.has(channel)) {
                    this.connectionPool.sendMessage(connection, {
                        type: 'unsubscribe',
                        channel,
                    });
                }
            }
            // Delete room
            this.roomManager.deleteRoom(channel);
        }
        catch (error) {
            console.error(`Failed to unsubscribe from ${channel}:`, error);
        }
    }
    sendToChannel(channel, event, data) {
        // Queue message
        this.messageQueue.enqueue({
            channel,
            event,
            data,
            priority: this.getMessagePriority(event),
            persistent: this.shouldPersistMessage(event),
        });
    }
    setupEventHandlers() {
        // Room manager events
        this.roomManager.on('room:event', (event) => {
            this.handleRoomEvent(event);
        });
        // Message queue events
        this.messageQueue.on('flush', () => {
            this.flushMessageQueue();
        });
        this.messageQueue.on('failed', (message, error) => {
            console.error('Message failed after retries:', message, error);
            this.emit('message:failed', { message, error });
        });
    }
    setupPoolHandlers() {
        if (!this.connectionPool)
            return;
        // Connection pool events
        this.connectionPool.on('connection:open', (connection) => {
            console.log(`Connection ${connection.id} opened`);
        });
        this.connectionPool.on('connection:close', (connection) => {
            console.log(`Connection ${connection.id} closed`);
            // Check if we need to reconnect
            const metrics = this.connectionPool?.getMetrics();
            if (metrics && metrics.activeConnections === 0) {
                this.updateConnectionState('disconnected');
                this.scheduleReconnect();
            }
        });
        this.connectionPool.on('message', (message) => {
            this.handlePoolMessage(message);
        });
        this.connectionPool.on('metrics', (metrics) => {
            // Update our metrics
            this.metrics.messagesSent = metrics.totalMessages;
            this.metrics.averageLatency = metrics.averageLatency;
        });
    }
    handlePoolMessage(message) {
        switch (message.event) {
            case 'subscribed':
                console.log(`Subscribed to ${message.channel}`);
                break;
            case 'message':
                // Route to room manager
                this.roomManager.broadcastToRoom(message.channel, message.data.event, message.data.data);
                break;
            case 'presence:member_added':
            case 'presence:member_removed':
                // Update presence data
                this.updatePresenceData(message.channel, message.data);
                break;
            case 'error':
                console.error(`Channel error:`, message);
                break;
        }
    }
    handleRoomEvent(event) {
        const bindings = this.channels.get(event.room);
        if (!bindings)
            return;
        for (const { event: boundEvent, callback } of bindings) {
            if (boundEvent === event.event || boundEvent === '*') {
                try {
                    callback(event.data);
                }
                catch (error) {
                    console.error('Error in event callback:', error);
                }
            }
        }
    }
    updatePresenceData(channel, data) {
        const members = this.presenceData.get(channel);
        if (!members)
            return;
        if (data.action === 'added') {
            members.set(data.id, data.info);
        }
        else if (data.action === 'removed') {
            members.delete(data.id);
        }
    }
    startQueueProcessing() {
        // Process queue periodically
        this.queueProcessor = setInterval(() => {
            this.flushMessageQueue();
        }, 100);
    }
    async flushMessageQueue() {
        if (!this.connectionPool || this.messageQueue.getStats().total === 0)
            return;
        await this.messageQueue.processQueue(async (messages) => {
            try {
                // Group messages by channel for efficient sending
                const byChannel = new Map();
                for (const message of messages) {
                    if (!byChannel.has(message.channel)) {
                        byChannel.set(message.channel, []);
                    }
                    byChannel.get(message.channel).push(message);
                }
                // Send batched messages per channel
                for (const [channel, channelMessages] of byChannel) {
                    const connection = await this.connectionPool.getConnectionForChannel(channel);
                    // Use binary protocol for large batches
                    const shouldUseBinary = channelMessages.length > 10 ||
                        channelMessages.some(m => JSON.stringify(m.data).length > 1000);
                    if (shouldUseBinary) {
                        const binaryData = BinaryProtocol.encode({
                            type: 'batch',
                            messages: channelMessages.map(m => ({
                                event: m.event,
                                data: m.data,
                            })),
                        });
                        connection.ws.send(binaryData);
                    }
                    else {
                        // Send individual messages
                        for (const message of channelMessages) {
                            this.connectionPool.sendMessage(connection, {
                                type: 'message',
                                channel: message.channel,
                                event: message.event,
                                data: message.data,
                            });
                        }
                    }
                }
                return true;
            }
            catch (error) {
                console.error('Failed to send batch:', error);
                return false;
            }
        });
    }
    scheduleReconnect() {
        if (this.reconnectTimer)
            return;
        const delay = Math.min(1000 * Math.pow(2, this.connectionState.retryCount), 30000);
        console.log(`Scheduling reconnect in ${delay}ms`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = undefined;
            this.reconnect().catch(console.error);
        }, delay);
    }
    getChannelAuth(channel) {
        // Get auth token for private/presence channels
        if (channel.startsWith('private-') || channel.startsWith('presence-')) {
            // Would implement actual auth here
            return {
                auth: 'token',
                channel_data: JSON.stringify({ user_id: 'current-user' }),
            };
        }
        return undefined;
    }
    getMessagePriority(event) {
        // Prioritize messages based on event type
        if (event.includes('score') || event.includes('winner'))
            return 'critical';
        if (event.includes('update') || event.includes('status'))
            return 'high';
        if (event.includes('join') || event.includes('leave'))
            return 'normal';
        return 'low';
    }
    shouldPersistMessage(event) {
        // Persist important messages
        return event.includes('score') ||
            event.includes('winner') ||
            event.includes('update');
    }
    // Public utility methods
    getConnectionPoolMetrics() {
        return this.connectionPool?.getMetrics() || null;
    }
    getQueueStats() {
        return this.messageQueue.getStats();
    }
    getRoomStats(roomId) {
        if (roomId) {
            return this.roomManager.getRoomStats(roomId);
        }
        // Get all room stats
        const rooms = this.roomManager.listRooms();
        return rooms.map(room => ({
            id: room.id,
            type: room.type,
            stats: this.roomManager.getRoomStats(room.id),
        }));
    }
    // Cleanup
    destroy() {
        this.disconnect();
        this.messageQueue.destroy();
        this.deduplicator.destroy();
        this.removeAllListeners();
    }
}
// Export as enhanced service
export const scalableRealtimeService = new ScalableWebSocketService();
