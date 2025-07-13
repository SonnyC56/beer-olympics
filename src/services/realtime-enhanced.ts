import { EventEmitter } from 'events';

// Enhanced real-time service with WebSocket fallback and advanced features
export interface EnhancedRealtimeService extends RealtimeService {
  // Connection management
  connect(): Promise<void>;
  disconnect(): void;
  reconnect(): Promise<void>;
  
  // Connection state
  getConnectionState(): ConnectionState;
  onConnectionStateChange(callback: (state: ConnectionState) => void): () => void;
  
  // Presence channels
  subscribePresence(channel: string): PresenceChannel | null;
  
  // Performance metrics
  getLatency(): number;
  getMetrics(): ConnectionMetrics;
}

export interface ConnectionState {
  state: 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'failed';
  error?: Error;
  retryCount: number;
}

export interface ConnectionMetrics {
  messagesSent: number;
  messagesReceived: number;
  averageLatency: number;
  connectionUptime: number;
  reconnectCount: number;
}

export interface PresenceChannel extends RealtimeChannel {
  getMembers(): Map<string, any>;
  getMe(): any;
  onMemberAdded(callback: (member: any) => void): () => void;
  onMemberRemoved(callback: (member: any) => void): () => void;
}

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

// Enhanced event types with more detail
export interface EnhancedTournamentEvents extends TournamentEvents {
  // Game-specific events
  'game-start': {
    tournamentId: string;
    matchId: string;
    gameType: string;
    teams: string[];
    startTime: number;
  };
  'game-end': {
    tournamentId: string;
    matchId: string;
    finalScores: Record<string, number>;
    duration: number;
  };
  
  // Live score updates with metadata
  'live-score': {
    tournamentId: string;
    matchId: string;
    teamId: string;
    score: number;
    delta: number; // Score change
    timestamp: number;
    playerAction?: {
      playerId: string;
      action: 'cup' | 'bounce' | 'miss';
    };
  };
  
  // Notifications
  'notification': {
    tournamentId: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    targetTeams?: string[]; // Optional: specific teams to notify
  };
  
  // Leaderboard updates
  'leaderboard-update': {
    tournamentId: string;
    rankings: Array<{
      teamId: string;
      rank: number;
      points: number;
      wins: number;
      losses: number;
      pointDiff: number;
    }>;
    changedPositions: Array<{
      teamId: string;
      oldRank: number;
      newRank: number;
    }>;
  };
  
  // Tournament lifecycle
  'tournament-start': {
    tournamentId: string;
    totalTeams: number;
    totalMatches: number;
  };
  'tournament-complete': {
    tournamentId: string;
    winner: string;
    finalRankings: string[];
  };
  
  // Media events
  'media-upload': {
    tournamentId: string;
    matchId: string;
    media: {
      id: string;
      type: 'photo' | 'video';
      url: string;
      thumbnailUrl?: string;
      uploaderId: string;
      uploaderName?: string;
      testimonial?: string;
    };
    timestamp: number;
  };
  'media-delete': {
    matchId: string;
    mediaId: string;
    timestamp: number;
  };
  'highlight-detected': {
    tournamentId: string;
    type: 'fastestChug' | 'biggestUpset' | 'funnyMoments';
    mediaId: string;
    confidence: number;
    timestamp: number;
  };
  'reel-generated': {
    tournamentId: string;
    reelUrl: string;
    mediaIds: string[];
    timestamp: number;
  };

  // Connection health
  'ping': {
    timestamp: number;
  };
  'pong': {
    timestamp: number;
    latency: number;
  };
}

// Tournament event types
export interface TournamentEvents {
  'score-update': {
    tournamentId: string;
    matchId: string;
    teamId: string;
    points: number;
  };
  'match-complete': {
    tournamentId: string;
    matchId: string;
    winner: string;
  };
  'team-joined': {
    tournamentId: string;
    team: {
      id: string;
      name: string;
      colorHex: string;
      flagCode: string;
    };
  };
  'tournament-status': {
    tournamentId: string;
    isOpen: boolean;
  };
}

// Base implementation with connection management
abstract class BaseRealtimeService extends EventEmitter implements EnhancedRealtimeService {
  protected connectionState: ConnectionState = {
    state: 'disconnected',
    retryCount: 0,
  };
  
  protected metrics: ConnectionMetrics = {
    messagesSent: 0,
    messagesReceived: 0,
    averageLatency: 0,
    connectionUptime: 0,
    reconnectCount: 0,
  };
  
  protected latencyBuffer: number[] = [];
  protected connectionStartTime: number = 0;
  
  abstract subscribe(channel: string): RealtimeChannel | null;
  abstract unsubscribe(channel: string): void;
  abstract isConnected(): boolean;
  abstract connect(): Promise<void>;
  abstract disconnect(): void;
  abstract reconnect(): Promise<void>;
  abstract subscribePresence(channel: string): PresenceChannel | null;
  
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }
  
  onConnectionStateChange(callback: (state: ConnectionState) => void): () => void {
    this.on('connectionStateChange', callback);
    return () => this.off('connectionStateChange', callback);
  }
  
  getLatency(): number {
    if (this.latencyBuffer.length === 0) return 0;
    return Math.round(
      this.latencyBuffer.reduce((a, b) => a + b, 0) / this.latencyBuffer.length
    );
  }
  
  getMetrics(): ConnectionMetrics {
    return {
      ...this.metrics,
      averageLatency: this.getLatency(),
      connectionUptime: this.connectionStartTime 
        ? Date.now() - this.connectionStartTime 
        : 0,
    };
  }
  
  protected updateConnectionState(state: ConnectionState['state'], error?: Error) {
    this.connectionState = {
      ...this.connectionState,
      state,
      error,
    };
    this.emit('connectionStateChange', this.connectionState);
  }
  
  protected addLatencySample(latency: number) {
    this.latencyBuffer.push(latency);
    if (this.latencyBuffer.length > 100) {
      this.latencyBuffer.shift();
    }
  }
}

// Enhanced Pusher implementation with fallback
class EnhancedPusherService extends BaseRealtimeService {
  private pusher: any = null;
  private channels = new Map<string, any>();
  private presenceChannels = new Map<string, PresenceChannel>();
  private reconnectTimer?: NodeJS.Timeout;
  private pingInterval?: NodeJS.Timeout;
  
  constructor() {
    super();
    if (this.isPusherConfigured()) {
      this.connect();
    }
  }
  
  private isPusherConfigured(): boolean {
    return !!(import.meta.env.VITE_PUSHER_KEY);
  }
  
  async connect(): Promise<void> {
    if (this.pusher) return;
    
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
      await new Promise<void>((resolve, reject) => {
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
      
    } catch (error) {
      console.error('❌ Failed to connect to Pusher:', error);
      this.updateConnectionState('failed', error as Error);
      throw error;
    }
  }
  
  disconnect(): void {
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
  
  async reconnect(): Promise<void> {
    this.disconnect();
    this.connectionState.retryCount++;
    this.metrics.reconnectCount++;
    await this.connect();
  }
  
  subscribe(channelName: string): RealtimeChannel | null {
    if (!this.pusher) return null;
    
    try {
      const existing = this.channels.get(channelName);
      if (existing) return this.wrapChannel(existing);
      
      const channel = this.pusher.subscribe(channelName);
      this.channels.set(channelName, channel);
      return this.wrapChannel(channel);
    } catch (error) {
      console.warn(`Failed to subscribe to channel ${channelName}:`, error);
      return null;
    }
  }
  
  subscribePresence(channelName: string): PresenceChannel | null {
    if (!this.pusher || !channelName.startsWith('presence-')) return null;
    
    try {
      const existing = this.presenceChannels.get(channelName);
      if (existing) return existing;
      
      const channel = this.pusher.subscribe(channelName);
      const presenceChannel = this.wrapPresenceChannel(channel);
      this.presenceChannels.set(channelName, presenceChannel);
      return presenceChannel;
    } catch (error) {
      console.warn(`Failed to subscribe to presence channel ${channelName}:`, error);
      return null;
    }
  }
  
  unsubscribe(channelName: string): void {
    if (!this.pusher) return;
    
    try {
      const channel = this.channels.get(channelName) || 
                     this.presenceChannels.get(channelName);
      if (channel) {
        this.pusher.unsubscribe(channelName);
        this.channels.delete(channelName);
        this.presenceChannels.delete(channelName);
      }
    } catch (error) {
      console.warn(`Failed to unsubscribe from channel ${channelName}:`, error);
    }
  }
  
  isConnected(): boolean {
    return this.pusher?.connection?.state === 'connected';
  }
  
  private setupEventHandlers() {
    if (!this.pusher) return;
    
    this.pusher.connection.bind('state_change', (states: any) => {
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
    
    this.pusher.connection.bind('error', (error: any) => {
      console.error('Pusher error:', error);
      this.updateConnectionState(this.connectionState.state, error);
    });
  }
  
  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    
    const delay = Math.min(1000 * Math.pow(2, this.connectionState.retryCount), 30000);
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.connectionState.retryCount + 1})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.reconnect().catch(console.error);
    }, delay);
  }
  
  private startPingInterval() {
    // Send ping every 30 seconds to measure latency
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        const pingTime = Date.now();
        const globalChannel = this.subscribe('global');
        
        if (globalChannel) {
          globalChannel.trigger('client-ping', { timestamp: pingTime });
          
          // Listen for pong
          const cleanup = globalChannel.bind('client-pong', (data: any) => {
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
  
  private wrapChannel(pusherChannel: any): RealtimeChannel {
    const wrapped = {
      bind: (event: string, callback: (data: any) => void) => {
        const wrappedCallback = (data: any) => {
          this.metrics.messagesReceived++;
          callback(data);
        };
        pusherChannel.bind(event, wrappedCallback);
        return () => pusherChannel.unbind(event, wrappedCallback);
      },
      unbind: (event?: string, callback?: (data: any) => void) => {
        if (event) {
          pusherChannel.unbind(event, callback);
        } else {
          pusherChannel.unbind_all();
        }
      },
      trigger: (event: string, data: any) => {
        if (event.startsWith('client-')) {
          this.metrics.messagesSent++;
          pusherChannel.trigger(event, data);
        }
      }
    };
    
    return wrapped;
  }
  
  private wrapPresenceChannel(pusherChannel: any): PresenceChannel {
    const baseChannel = this.wrapChannel(pusherChannel);
    
    return {
      ...baseChannel,
      getMembers: () => pusherChannel.members?.members || new Map(),
      getMe: () => pusherChannel.members?.me,
      onMemberAdded: (callback: (member: any) => void) => {
        pusherChannel.bind('pusher:member_added', callback);
        return () => pusherChannel.unbind('pusher:member_added', callback);
      },
      onMemberRemoved: (callback: (member: any) => void) => {
        pusherChannel.bind('pusher:member_removed', callback);
        return () => pusherChannel.unbind('pusher:member_removed', callback);
      },
    };
  }
}

// WebSocket fallback implementation
class WebSocketRealtimeService extends BaseRealtimeService {
  private ws: WebSocket | null = null;
  private channels = new Map<string, Set<{ event: string; callback: Function }>>();
  private reconnectTimer?: NodeJS.Timeout;
  private pingInterval?: NodeJS.Timeout;
  private messageQueue: Array<{ channel: string; event: string; data: any }> = [];
  
  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    
    this.updateConnectionState('connecting');
    
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 
                   `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);
      
      await new Promise<void>((resolve, reject) => {
        if (!this.ws) return reject(new Error('WebSocket not initialized'));
        
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
      
    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
      this.updateConnectionState('failed', error as Error);
      throw error;
    }
  }
  
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    if (this.ws) {
      this.updateConnectionState('disconnecting');
      this.ws.close();
      this.ws = null;
      this.channels.clear();
    }
  }
  
  async reconnect(): Promise<void> {
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
  
  subscribe(channelName: string): RealtimeChannel | null {
    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, new Set());
      
      if (this.isConnected()) {
        this.sendMessage({
          type: 'subscribe',
          channel: channelName,
        });
      }
    }
    
    const channelBindings = this.channels.get(channelName)!;
    
    return {
      bind: (event: string, callback: (data: any) => void) => {
        const binding = { event, callback };
        channelBindings.add(binding);
        return () => channelBindings.delete(binding);
      },
      unbind: (event?: string, callback?: (data: any) => void) => {
        if (!event) {
          channelBindings.clear();
        } else {
          for (const binding of channelBindings) {
            if (binding.event === event && (!callback || binding.callback === callback)) {
              channelBindings.delete(binding);
            }
          }
        }
      },
      trigger: (event: string, data: any) => {
        this.sendMessage({
          type: 'message',
          channel: channelName,
          event,
          data,
        });
      },
    };
  }
  
  subscribePresence(channel: string): PresenceChannel | null {
    // WebSocket fallback doesn't support presence channels
    console.warn('Presence channels not supported in WebSocket fallback');
    return null;
  }
  
  unsubscribe(channelName: string): void {
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
  
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
  
  private setupEventHandlers() {
    if (!this.ws) return;
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
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
  
  private handleMessage(message: any) {
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
  
  private sendMessage(message: any) {
    if (this.isConnected() && this.ws) {
      this.metrics.messagesSent++;
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later
      if (message.type === 'message') {
        this.messageQueue.push({
          channel: message.channel,
          event: message.event,
          data: message.data,
        });
      }
    }
  }
  
  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      this.sendMessage({
        type: 'message',
        channel: msg.channel,
        event: msg.event,
        data: msg.data,
      });
    }
  }
  
  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    
    const delay = Math.min(1000 * Math.pow(2, this.connectionState.retryCount), 30000);
    console.log(`Scheduling WebSocket reconnect in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.reconnect().catch(console.error);
    }, delay);
  }
  
  private startPingInterval() {
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
function createEnhancedRealtimeService(): EnhancedRealtimeService {
  const wantsRealtime = import.meta.env.VITE_ENABLE_REALTIME !== 'false';
  const pusherConfigured = !!(import.meta.env.VITE_PUSHER_KEY);
  const wsConfigured = !!(import.meta.env.VITE_WS_URL || true); // Always available as fallback
  
  if (!wantsRealtime) {
    console.log('📱 Real-time features disabled');
    return new MockEnhancedRealtimeService();
  }
  
  if (pusherConfigured) {
    console.log('🚀 Using Enhanced Pusher for real-time features');
    return new EnhancedPusherService();
  }
  
  if (wsConfigured) {
    console.log('🔌 Using WebSocket fallback for real-time features');
    return new WebSocketRealtimeService();
  }
  
  console.log('📱 Using mock real-time service');
  return new MockEnhancedRealtimeService();
}

// Mock implementation for testing
class MockEnhancedRealtimeService extends BaseRealtimeService {
  async connect(): Promise<void> {
    this.updateConnectionState('connecting');
    await new Promise(resolve => setTimeout(resolve, 100));
    this.updateConnectionState('connected');
    this.connectionStartTime = Date.now();
  }
  
  disconnect(): void {
    this.updateConnectionState('disconnected');
  }
  
  async reconnect(): Promise<void> {
    await this.connect();
  }
  
  subscribe(channel: string): RealtimeChannel | null {
    console.log(`[Mock] Subscribe to channel: ${channel}`);
    return {
      bind: () => () => {},
      unbind: () => {},
      trigger: () => {},
    };
  }
  
  subscribePresence(channel: string): PresenceChannel | null {
    console.log(`[Mock] Subscribe to presence channel: ${channel}`);
    return null;
  }
  
  unsubscribe(channel: string): void {
    console.log(`[Mock] Unsubscribe from channel: ${channel}`);
  }
  
  isConnected(): boolean {
    return this.connectionState.state === 'connected';
  }
}

// Export enhanced service
export const enhancedRealtimeService = createEnhancedRealtimeService();

// Export type guards
export function isEnhancedRealtimeService(service: any): service is EnhancedRealtimeService {
  return 'getConnectionState' in service && 'getMetrics' in service;
}