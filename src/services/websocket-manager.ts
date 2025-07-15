import { EventEmitter } from 'events';

// Connection pool manager for handling 100+ concurrent WebSocket connections
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
  healthScore: number; // 0-100
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

export class WebSocketConnectionPool extends EventEmitter {
  private connections = new Map<string, PooledConnection>();
  private channelToConnection = new Map<string, string>();
  private endpoints: string[];
  private config: ConnectionPoolConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private metricsBuffer: ConnectionMetrics[] = [];
  
  constructor(endpoints: string[], config?: Partial<ConnectionPoolConfig>) {
    super();
    this.endpoints = endpoints;
    this.config = {
      maxConnections: 100,
      maxConnectionsPerEndpoint: 25,
      connectionTimeout: 10000,
      healthCheckInterval: 30000,
      maxReconnectAttempts: 5,
      reconnectBackoff: {
        initial: 1000,
        max: 30000,
        multiplier: 2,
      },
      ...config,
    };
    
    this.startHealthChecks();
  }
  
  // Get or create a connection for a channel
  async getConnectionForChannel(channel: string): Promise<PooledConnection> {
    // Check if channel already has a connection
    const existingConnId = this.channelToConnection.get(channel);
    if (existingConnId) {
      const conn = this.connections.get(existingConnId);
      if (conn && conn.state === 'connected') {
        return conn;
      }
    }
    
    // Find the best connection based on load balancing
    const connection = await this.findOrCreateBestConnection();
    
    // Map channel to connection
    this.channelToConnection.set(channel, connection.id);
    connection.activeChannels.add(channel);
    
    return connection;
  }
  
  // Find the best available connection or create a new one
  private async findOrCreateBestConnection(): Promise<PooledConnection> {
    // First, try to find an existing connection with capacity
    const availableConnections = Array.from(this.connections.values())
      .filter(conn => conn.state === 'connected')
      .sort((a, b) => {
        // Sort by: health score, then by channel count
        const scoreA = a.healthScore - (a.activeChannels.size * 2);
        const scoreB = b.healthScore - (b.activeChannels.size * 2);
        return scoreB - scoreA;
      });
    
    if (availableConnections.length > 0) {
      const best = availableConnections[0];
      // Use existing connection if it has capacity
      if (best.activeChannels.size < 20) { // Max 20 channels per connection
        return best;
      }
    }
    
    // Create new connection if under limit
    if (this.connections.size < this.config.maxConnections) {
      return await this.createConnection();
    }
    
    // If at capacity, use the healthiest connection
    if (availableConnections.length > 0) {
      return availableConnections[0];
    }
    
    throw new Error('No available connections and cannot create new ones');
  }
  
  // Create a new WebSocket connection
  private async createConnection(): Promise<PooledConnection> {
    const endpoint = this.selectEndpoint();
    const id = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const connection: PooledConnection = {
      id,
      endpoint,
      ws: new WebSocket(endpoint),
      state: 'connecting',
      activeChannels: new Set(),
      metrics: {
        messagesIn: 0,
        messagesOut: 0,
        bytesIn: 0,
        bytesOut: 0,
        latency: [],
        lastActivity: Date.now(),
      },
      reconnectAttempts: 0,
      healthScore: 100,
    };
    
    this.connections.set(id, connection);
    
    // Setup connection handlers
    await this.setupConnection(connection);
    
    return connection;
  }
  
  // Select endpoint with least connections
  private selectEndpoint(): string {
    const endpointCounts = new Map<string, number>();
    
    // Count connections per endpoint
    for (const conn of this.connections.values()) {
      const count = endpointCounts.get(conn.endpoint) || 0;
      endpointCounts.set(conn.endpoint, count + 1);
    }
    
    // Find endpoint with least connections
    let bestEndpoint = this.endpoints[0];
    let minCount = Infinity;
    
    for (const endpoint of this.endpoints) {
      const count = endpointCounts.get(endpoint) || 0;
      if (count < minCount && count < this.config.maxConnectionsPerEndpoint) {
        minCount = count;
        bestEndpoint = endpoint;
      }
    }
    
    return bestEndpoint;
  }
  
  // Setup WebSocket connection handlers
  private async setupConnection(connection: PooledConnection): Promise<void> {
    const { ws } = connection;
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        connection.state = 'failed';
        reject(new Error('Connection timeout'));
      }, this.config.connectionTimeout);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        connection.state = 'connected';
        connection.metrics.connectedAt = Date.now();
        connection.reconnectAttempts = 0;
        
        this.emit('connection:open', connection);
        
        // Send initial ping
        this.sendPing(connection);
        
        resolve();
      };
      
      ws.onmessage = (event) => {
        connection.metrics.messagesIn++;
        connection.metrics.bytesIn += event.data.length;
        connection.metrics.lastActivity = Date.now();
        
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(connection, message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };
      
      ws.onclose = () => {
        clearTimeout(timeout);
        connection.state = 'disconnected';
        this.handleDisconnection(connection);
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error(`WebSocket error on ${connection.id}:`, error);
        connection.healthScore = Math.max(0, connection.healthScore - 20);
      };
    });
  }
  
  // Handle incoming messages
  private handleMessage(connection: PooledConnection, message: any) {
    switch (message.type) {
      case 'pong':
        const latency = Date.now() - message.timestamp;
        connection.metrics.latency.push(latency);
        if (connection.metrics.latency.length > 100) {
          connection.metrics.latency.shift();
        }
        break;
        
      case 'message':
        // Route message to appropriate channels
        this.emit('message', {
          connectionId: connection.id,
          channel: message.channel,
          event: message.event,
          data: message.data,
        });
        break;
        
      case 'error':
        console.error(`Server error on ${connection.id}:`, message.error);
        connection.healthScore = Math.max(0, connection.healthScore - 10);
        break;
    }
  }
  
  // Handle connection disconnection
  private async handleDisconnection(connection: PooledConnection) {
    this.emit('connection:close', connection);
    
    // Remove channel mappings
    for (const channel of connection.activeChannels) {
      this.channelToConnection.delete(channel);
    }
    
    // Attempt reconnection if needed
    if (connection.activeChannels.size > 0 && 
        connection.reconnectAttempts < this.config.maxReconnectAttempts) {
      await this.scheduleReconnection(connection);
    } else {
      // Remove connection if no active channels or max attempts reached
      this.connections.delete(connection.id);
    }
  }
  
  // Schedule reconnection with exponential backoff
  private async scheduleReconnection(connection: PooledConnection) {
    const backoff = Math.min(
      this.config.reconnectBackoff.initial * 
      Math.pow(this.config.reconnectBackoff.multiplier, connection.reconnectAttempts),
      this.config.reconnectBackoff.max
    );
    
    connection.reconnectAttempts++;
    
    setTimeout(async () => {
      try {
        connection.ws = new WebSocket(connection.endpoint);
        await this.setupConnection(connection);
        
        // Resubscribe to channels
        for (const channel of connection.activeChannels) {
          this.sendMessage(connection, {
            type: 'subscribe',
            channel,
          });
        }
      } catch (error) {
        console.error(`Reconnection failed for ${connection.id}:`, error);
        await this.handleDisconnection(connection);
      }
    }, backoff);
  }
  
  // Send message through a connection
  sendMessage(connection: PooledConnection, message: any): boolean {
    if (connection.state !== 'connected' || connection.ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      const data = JSON.stringify(message);
      connection.ws.send(data);
      connection.metrics.messagesOut++;
      connection.metrics.bytesOut += data.length;
      connection.metrics.lastActivity = Date.now();
      return true;
    } catch (error) {
      console.error(`Failed to send message on ${connection.id}:`, error);
      connection.healthScore = Math.max(0, connection.healthScore - 5);
      return false;
    }
  }
  
  // Send ping to measure latency
  private sendPing(connection: PooledConnection) {
    this.sendMessage(connection, {
      type: 'ping',
      timestamp: Date.now(),
    });
  }
  
  // Start health check timer
  private startHealthChecks() {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }
  
  // Perform health checks on all connections
  private performHealthChecks() {
    const now = Date.now();
    
    for (const connection of this.connections.values()) {
      // Check connection state
      if (connection.state === 'connected') {
        // Send ping
        this.sendPing(connection);
        
        // Check for stale connections
        const idleTime = now - connection.metrics.lastActivity;
        if (idleTime > 60000) { // 1 minute idle
          connection.healthScore = Math.max(0, connection.healthScore - 5);
        }
        
        // Check latency
        if (connection.metrics.latency.length > 0) {
          const avgLatency = connection.metrics.latency.reduce((a, b) => a + b, 0) / 
                           connection.metrics.latency.length;
          
          if (avgLatency > 1000) { // High latency
            connection.healthScore = Math.max(0, connection.healthScore - 10);
          } else if (avgLatency < 100) { // Good latency
            connection.healthScore = Math.min(100, connection.healthScore + 5);
          }
        }
      }
      
      // Close unhealthy connections with no active channels
      if (connection.healthScore < 20 && connection.activeChannels.size === 0) {
        connection.ws.close();
        this.connections.delete(connection.id);
      }
    }
    
    // Collect metrics
    this.collectMetrics();
  }
  
  // Collect pool metrics
  private collectMetrics() {
    const metrics: ConnectionMetrics = {
      totalConnections: this.connections.size,
      activeConnections: Array.from(this.connections.values())
        .filter(c => c.state === 'connected').length,
      totalMessages: 0,
      totalBytes: 0,
      averageLatency: 0,
      connectionHealth: 0,
      channelDistribution: new Map(),
    };
    
    let totalLatency = 0;
    let latencyCount = 0;
    
    for (const conn of this.connections.values()) {
      metrics.totalMessages += conn.metrics.messagesIn + conn.metrics.messagesOut;
      metrics.totalBytes += conn.metrics.bytesIn + conn.metrics.bytesOut;
      
      if (conn.metrics.latency.length > 0) {
        const avgLatency = conn.metrics.latency.reduce((a, b) => a + b, 0) / 
                         conn.metrics.latency.length;
        totalLatency += avgLatency;
        latencyCount++;
      }
      
      metrics.connectionHealth += conn.healthScore;
      
      for (const channel of conn.activeChannels) {
        const count = metrics.channelDistribution.get(channel) || 0;
        metrics.channelDistribution.set(channel, count + 1);
      }
    }
    
    if (latencyCount > 0) {
      metrics.averageLatency = totalLatency / latencyCount;
    }
    
    if (this.connections.size > 0) {
      metrics.connectionHealth /= this.connections.size;
    }
    
    this.metricsBuffer.push(metrics);
    if (this.metricsBuffer.length > 60) { // Keep last 60 samples
      this.metricsBuffer.shift();
    }
    
    this.emit('metrics', metrics);
  }
  
  // Get current metrics
  getMetrics(): ConnectionMetrics {
    if (this.metricsBuffer.length === 0) {
      this.collectMetrics();
    }
    return this.metricsBuffer[this.metricsBuffer.length - 1];
  }
  
  // Get connection details
  getConnectionDetails(): PooledConnection[] {
    return Array.from(this.connections.values());
  }
  
  // Gracefully close all connections
  async close() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    for (const connection of this.connections.values()) {
      connection.ws.close();
    }
    
    this.connections.clear();
    this.channelToConnection.clear();
  }
}

// Binary protocol support for efficient data transfer
export class BinaryProtocol {
  private static readonly MESSAGE_TYPES = {
    SUBSCRIBE: 0x01,
    UNSUBSCRIBE: 0x02,
    MESSAGE: 0x03,
    PING: 0x04,
    PONG: 0x05,
    ERROR: 0x06,
  };
  
  // Encode message to binary format
  static encode(message: any): ArrayBuffer {
    const json = JSON.stringify(message);
    const jsonBytes = new TextEncoder().encode(json);
    
    // Check if binary encoding would be more efficient
    if (jsonBytes.length < 100) {
      return jsonBytes.buffer;
    }
    
    // For larger messages, use compression
    return this.compress(jsonBytes);
  }
  
  // Decode binary message
  static decode(data: ArrayBuffer): any {
    const bytes = new Uint8Array(data);
    
    // Check if compressed
    if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
      const decompressed = this.decompress(bytes.slice(2));
      return JSON.parse(new TextDecoder().decode(decompressed));
    }
    
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  
  // Simple compression using repeated string detection
  private static compress(data: Uint8Array): ArrayBuffer {
    // This is a placeholder - in production, use a proper compression library
    // like pako (zlib) or lz4
    const header = new Uint8Array([0xFF, 0xFE]); // Compression marker
    const result = new Uint8Array(header.length + data.length);
    result.set(header);
    result.set(data, header.length);
    return result.buffer;
  }
  
  private static decompress(data: Uint8Array): Uint8Array {
    // Placeholder - matches compress method
    return data;
  }
}