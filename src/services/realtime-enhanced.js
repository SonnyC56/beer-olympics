import { EventEmitter } from 'events';
import { MessageQueue, MessageDeduplicator } from '../utils/websocket-queue';
import { RoomManager, TournamentRoomManager } from './websocket-rooms';
// Base implementation with connection management
export class BaseRealtimeService extends EventEmitter {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "connectionState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                state: 'disconnected',
                retryCount: 0,
            }
        });
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                messagesSent: 0,
                messagesReceived: 0,
                averageLatency: 0,
                connectionUptime: 0,
                reconnectCount: 0,
            }
        });
        Object.defineProperty(this, "latencyBuffer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "connectionStartTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    getConnectionState() {
        return { ...this.connectionState };
    }
    onConnectionStateChange(callback) {
        this.on('connectionStateChange', callback);
        return () => this.off('connectionStateChange', callback);
    }
    getLatency() {
        if (this.latencyBuffer.length === 0)
            return 0;
        return Math.round(this.latencyBuffer.reduce((a, b) => a + b, 0) / this.latencyBuffer.length);
    }
    getMetrics() {
        return {
            ...this.metrics,
            averageLatency: this.getLatency(),
            connectionUptime: this.connectionStartTime
                ? Date.now() - this.connectionStartTime
                : 0,
        };
    }
    updateConnectionState(state, error) {
        this.connectionState = {
            ...this.connectionState,
            state,
            error,
        };
        this.emit('connectionStateChange', this.connectionState);
    }
    addLatencySample(latency) {
        this.latencyBuffer.push(latency);
        if (this.latencyBuffer.length > 100) {
            this.latencyBuffer.shift();
        }
    }
}
// Enhanced Pusher implementation with fallback
class EnhancedPusherService extends BaseRealtimeService {
    constructor() {
        super();
        Object.defineProperty(this, "pusher", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "channels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "presenceChannels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "reconnectTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pingInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (this.isPusherConfigured()) {
            this.connect();
        }
    }
    isPusherConfigured() {
        return !!(import.meta.env.VITE_PUSHER_KEY);
    }
    async connect() {
        if (this.pusher)
            return;
        this.updateConnectionState('connecting');
        try {
            const PusherClient = (await import('pusher-js')).default;
            this.pusher = new PusherClient(import.meta.env.VITE_PUSHER_KEY, {
                cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'us2',
                forceTLS: true,
                authEndpoint: '/api/pusher/auth', // For private/presence channels
                enabledTransports: ['ws', 'wss'],
                disabledTransports: ['sockjs', 'xhr_streaming', 'xhr_polling'],
            });
            this.setupEventHandlers();
            this.startPingInterval();
            // Wait for connection
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
                this.pusher.connection.bind('connected', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                this.pusher.connection.bind('failed', () => {
                    clearTimeout(timeout);
                    reject(new Error('Connection failed'));
                });
            });
            this.connectionStartTime = Date.now();
            console.log('✅ Enhanced Pusher connected successfully');
        }
        catch (error) {
            console.error('❌ Failed to connect to Pusher:', error);
            this.updateConnectionState('failed', error);
            throw error;
        }
    }
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        if (this.pusher) {
            this.updateConnectionState('disconnecting');
            this.pusher.disconnect();
            this.pusher = null;
            this.channels.clear();
            this.presenceChannels.clear();
        }
    }
    async reconnect() {
        this.disconnect();
        this.connectionState.retryCount++;
        this.metrics.reconnectCount++;
        await this.connect();
    }
    subscribe(channelName) {
        if (!this.pusher)
            return null;
        try {
            const existing = this.channels.get(channelName);
            if (existing)
                return this.wrapChannel(existing);
            const channel = this.pusher.subscribe(channelName);
            this.channels.set(channelName, channel);
            return this.wrapChannel(channel);
        }
        catch (error) {
            console.warn(`Failed to subscribe to channel ${channelName}:`, error);
            return null;
        }
    }
    subscribePresence(channelName) {
        if (!this.pusher || !channelName.startsWith('presence-'))
            return null;
        try {
            const existing = this.presenceChannels.get(channelName);
            if (existing)
                return existing;
            const channel = this.pusher.subscribe(channelName);
            const presenceChannel = this.wrapPresenceChannel(channel);
            this.presenceChannels.set(channelName, presenceChannel);
            return presenceChannel;
        }
        catch (error) {
            console.warn(`Failed to subscribe to presence channel ${channelName}:`, error);
            return null;
        }
    }
    unsubscribe(channelName) {
        if (!this.pusher)
            return;
        try {
            const channel = this.channels.get(channelName) ||
                this.presenceChannels.get(channelName);
            if (channel) {
                this.pusher.unsubscribe(channelName);
                this.channels.delete(channelName);
                this.presenceChannels.delete(channelName);
            }
        }
        catch (error) {
            console.warn(`Failed to unsubscribe from channel ${channelName}:`, error);
        }
    }
    isConnected() {
        return this.pusher?.connection?.state === 'connected';
    }
    setupEventHandlers() {
        if (!this.pusher)
            return;
        this.pusher.connection.bind('state_change', (states) => {
            console.log(`Pusher state: ${states.previous} → ${states.current}`);
            switch (states.current) {
                case 'connected':
                    this.updateConnectionState('connected');
                    this.connectionState.retryCount = 0;
                    break;
                case 'connecting':
                    this.updateConnectionState('connecting');
                    break;
                case 'disconnected':
                    this.updateConnectionState('disconnected');
                    this.scheduleReconnect();
                    break;
                case 'failed':
                    this.updateConnectionState('failed');
                    this.scheduleReconnect();
                    break;
            }
        });
        this.pusher.connection.bind('error', (error) => {
            console.error('Pusher error:', error);
            this.updateConnectionState(this.connectionState.state, error);
        });
    }
    scheduleReconnect() {
        if (this.reconnectTimer)
            return;
        const delay = Math.min(1000 * Math.pow(2, this.connectionState.retryCount), 30000);
        console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.connectionState.retryCount + 1})`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = undefined;
            this.reconnect().catch(console.error);
        }, delay);
    }
    startPingInterval() {
        // Send ping every 30 seconds to measure latency
        this.pingInterval = setInterval(() => {
            if (this.isConnected()) {
                const pingTime = Date.now();
                const globalChannel = this.subscribe('global');
                if (globalChannel) {
                    globalChannel.trigger('client-ping', { timestamp: pingTime });
                    // Listen for pong
                    const cleanup = globalChannel.bind('client-pong', (data) => {
                        const latency = Date.now() - pingTime;
                        this.addLatencySample(latency);
                        cleanup();
                    });
                    // Timeout after 5 seconds
                    setTimeout(cleanup, 5000);
                }
            }
        }, 30000);
    }
    wrapChannel(pusherChannel) {
        const wrapped = {
            bind: (event, callback) => {
                const wrappedCallback = (data) => {
                    this.metrics.messagesReceived++;
                    callback(data);
                };
                pusherChannel.bind(event, wrappedCallback);
                return () => pusherChannel.unbind(event, wrappedCallback);
            },
            unbind: (event, callback) => {
                if (event) {
                    pusherChannel.unbind(event, callback);
                }
                else {
                    pusherChannel.unbind_all();
                }
            },
            trigger: (event, data) => {
                if (event.startsWith('client-')) {
                    this.metrics.messagesSent++;
                    pusherChannel.trigger(event, data);
                }
            }
        };
        return wrapped;
    }
    wrapPresenceChannel(pusherChannel) {
        const baseChannel = this.wrapChannel(pusherChannel);
        return {
            ...baseChannel,
            getMembers: () => pusherChannel.members?.members || new Map(),
            getMe: () => pusherChannel.members?.me,
            onMemberAdded: (callback) => {
                pusherChannel.bind('pusher:member_added', callback);
                return () => pusherChannel.unbind('pusher:member_added', callback);
            },
            onMemberRemoved: (callback) => {
                pusherChannel.bind('pusher:member_removed', callback);
                return () => pusherChannel.unbind('pusher:member_removed', callback);
            },
        };
    }
}
// Enhanced WebSocket implementation with connection pooling and advanced features
class EnhancedWebSocketService extends BaseRealtimeService {
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
        Object.defineProperty(this, "reconnectTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endpoints", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ws", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pingInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Initialize components
        this.messageQueue = new MessageQueue({
            maxSize: 5000,
            maxRetries: 5,
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
        // Setup message queue processing
        this.setupQueueProcessing();
    }
    setupQueueProcessing() {
        // Process queued messages periodically
        setInterval(() => {
            if (this.isConnected()) {
                this.flushMessageQueue();
            }
        }, 1000);
    }
    async connect() {
        if (this.connectionPool)
            return;
        this.updateConnectionState('connecting');
        try {
            const wsUrl = import.meta.env.VITE_WS_URL ||
                `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
            this.ws = new WebSocket(wsUrl);
            await new Promise((resolve, reject) => {
                if (!this.ws)
                    return reject(new Error('WebSocket not initialized'));
                const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
                this.ws.onopen = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                this.ws.onerror = (error) => {
                    clearTimeout(timeout);
                    reject(error);
                };
            });
            this.setupEventHandlers();
            this.startPingInterval();
            this.flushMessageQueue();
            this.connectionStartTime = Date.now();
            console.log('✅ WebSocket connected successfully');
        }
        catch (error) {
            console.error('❌ Failed to connect WebSocket:', error);
            this.updateConnectionState('failed', error);
            throw error;
        }
    }
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        if (this.ws) {
            this.updateConnectionState('disconnecting');
            this.ws.close();
            this.ws = undefined;
            this.channels.clear();
        }
    }
    async reconnect() {
        this.disconnect();
        this.connectionState.retryCount++;
        this.metrics.reconnectCount++;
        await this.connect();
        // Resubscribe to all channels
        for (const [channel] of this.channels) {
            this.sendMessage({
                type: 'subscribe',
                channel,
            });
        }
    }
    subscribe(channelName) {
        if (!this.channels.has(channelName)) {
            this.channels.set(channelName, new Set());
            if (this.isConnected()) {
                this.sendMessage({
                    type: 'subscribe',
                    channel: channelName,
                });
            }
        }
        const channelBindings = this.channels.get(channelName);
        return {
            bind: (event, callback) => {
                const binding = { event, callback };
                channelBindings.add(binding);
                return () => channelBindings.delete(binding);
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
                this.sendMessage({
                    type: 'message',
                    channel: channelName,
                    event,
                    data,
                });
            },
        };
    }
    subscribePresence(channel) {
        // WebSocket fallback doesn't support presence channels
        console.warn('Presence channels not supported in WebSocket fallback');
        return null;
    }
    unsubscribe(channelName) {
        if (this.channels.has(channelName)) {
            this.channels.delete(channelName);
            if (this.isConnected()) {
                this.sendMessage({
                    type: 'unsubscribe',
                    channel: channelName,
                });
            }
        }
    }
    isConnected() {
        return this.ws?.readyState === WebSocket.OPEN;
    }
    setupEventHandlers() {
        if (!this.ws)
            return;
        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            }
            catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };
        this.ws.onclose = () => {
            this.updateConnectionState('disconnected');
            this.scheduleReconnect();
        };
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateConnectionState(this.connectionState.state, new Error('WebSocket error'));
        };
    }
    handleMessage(message) {
        this.metrics.messagesReceived++;
        switch (message.type) {
            case 'message':
                const bindings = this.channels.get(message.channel);
                if (bindings) {
                    for (const { event, callback } of bindings) {
                        if (event === message.event || event === '*') {
                            callback(message.data);
                        }
                    }
                }
                break;
            case 'pong':
                const latency = Date.now() - message.timestamp;
                this.addLatencySample(latency);
                break;
            case 'connected':
                this.updateConnectionState('connected');
                this.connectionState.retryCount = 0;
                break;
        }
    }
    sendMessage(message) {
        if (this.isConnected() && this.ws) {
            this.metrics.messagesSent++;
            this.ws.send(JSON.stringify(message));
        }
        else {
            // Queue message for later
            if (message.type === 'message') {
                this.messageQueue.enqueue({
                    channel: message.channel,
                    event: message.event,
                    data: message.data,
                    priority: 'normal'
                });
            }
        }
    }
    flushMessageQueue() {
        // Process messages from the message queue
        const messages = this.messageQueue.getNextBatch();
        const sentIds = [];
        messages.forEach((msg) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'message',
                    channel: msg.channel,
                    event: msg.event,
                    data: msg.data,
                }));
                sentIds.push(msg.id);
            }
        });
        // Mark messages as sent
        if (sentIds.length > 0) {
            this.messageQueue.markAsSent(sentIds);
        }
    }
    scheduleReconnect() {
        if (this.reconnectTimer)
            return;
        const delay = Math.min(1000 * Math.pow(2, this.connectionState.retryCount), 30000);
        console.log(`Scheduling WebSocket reconnect in ${delay}ms`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = undefined;
            this.reconnect().catch(console.error);
        }, delay);
    }
    startPingInterval() {
        this.pingInterval = setInterval(() => {
            if (this.isConnected()) {
                this.sendMessage({
                    type: 'ping',
                    timestamp: Date.now(),
                });
            }
        }, 30000);
    }
}
// Service factory with intelligent fallback
function createEnhancedRealtimeService() {
    const wantsRealtime = import.meta.env.VITE_ENABLE_REALTIME !== 'false';
    const pusherConfigured = !!(import.meta.env.VITE_PUSHER_KEY);
    const wsConfigured = !!(import.meta.env.VITE_WS_URL || true); // Always available as fallback
    const scalableEnabled = import.meta.env.VITE_ENABLE_SCALABLE_WS === 'true';
    if (!wantsRealtime) {
        console.log('📱 Real-time features disabled');
        return new MockEnhancedRealtimeService();
    }
    // Use scalable WebSocket service if enabled
    if (scalableEnabled || wsConfigured) {
        console.log('⚡ Using Scalable WebSocket service for 100+ connections');
        // Dynamically import to avoid circular dependency
        return new (require('./realtime-scalable').ScalableWebSocketService)();
    }
    if (pusherConfigured) {
        console.log('🚀 Using Enhanced Pusher for real-time features');
        return new EnhancedPusherService();
    }
    console.log('📱 Using mock real-time service');
    return new MockEnhancedRealtimeService();
}
// Mock implementation for testing
class MockEnhancedRealtimeService extends BaseRealtimeService {
    async connect() {
        this.updateConnectionState('connecting');
        await new Promise(resolve => setTimeout(resolve, 100));
        this.updateConnectionState('connected');
        this.connectionStartTime = Date.now();
    }
    disconnect() {
        this.updateConnectionState('disconnected');
    }
    async reconnect() {
        await this.connect();
    }
    subscribe(channel) {
        console.log(`[Mock] Subscribe to channel: ${channel}`);
        return {
            bind: () => () => { },
            unbind: () => { },
            trigger: () => { },
        };
    }
    subscribePresence(channel) {
        console.log(`[Mock] Subscribe to presence channel: ${channel}`);
        return null;
    }
    unsubscribe(channel) {
        console.log(`[Mock] Unsubscribe from channel: ${channel}`);
    }
    isConnected() {
        return this.connectionState.state === 'connected';
    }
}
// Export enhanced service
export const enhancedRealtimeService = createEnhancedRealtimeService();
// Export type guards
export function isEnhancedRealtimeService(service) {
    return 'getConnectionState' in service && 'getMetrics' in service;
}
