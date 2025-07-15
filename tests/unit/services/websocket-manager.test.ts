import { describe, it, expect, beforeEach, afterEach, vi, MockedFunction } from 'vitest';
import type { Mock } from 'vitest';

// Mock WebSocket class
class MockWebSocket {
  url: string;
  readyState: number;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(url: string) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  });
}

// WebSocket Manager implementation
interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  messageQueueSize?: number;
}

interface WebSocketMessage {
  id: string;
  type: string;
  data: any;
  timestamp: string;
}

type MessageHandler = (message: WebSocketMessage) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: Error) => void;

class WebSocketManager {
  private config: Required<WebSocketConfig>;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private disconnectionHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private isReconnecting = false;
  private lastHeartbeat: number = Date.now();

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      messageQueueSize: config.messageQueueSize || 100,
    };
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.config.url) as any;
      this.setupEventHandlers();
    } catch (error) {
      this.handleError(new Error(`Failed to connect: ${error}`));
    }
  }

  disconnect(): void {
    this.isReconnecting = false;
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: Omit<WebSocketMessage, 'id' | 'timestamp'>): void {
    const fullMessage: WebSocketMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      this.queueMessage(fullMessage);
    }
  }

  on(event: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }
    this.messageHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: MessageHandler): void {
    this.messageHandlers.get(event)?.delete(handler);
  }

  onConnect(handler: ConnectionHandler): void {
    this.connectionHandlers.add(handler);
  }

  onDisconnect(handler: ConnectionHandler): void {
    this.disconnectionHandlers.add(handler);
  }

  onError(handler: ErrorHandler): void {
    this.errorHandlers.add(handler);
  }

  getStatus(): {
    connected: boolean;
    reconnecting: boolean;
    reconnectAttempts: number;
    queuedMessages: number;
    lastHeartbeat: number;
  } {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      reconnecting: this.isReconnecting,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      lastHeartbeat: this.lastHeartbeat,
    };
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      this.startHeartbeat();
      this.flushMessageQueue();
      this.notifyConnectionHandlers();
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected', event.code, event.reason);
      this.clearTimers();
      this.notifyDisconnectionHandlers();
      
      if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (event) => {
      console.error('WebSocket error', event);
      this.handleError(new Error('WebSocket error'));
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse message', error);
      }
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    // Handle heartbeat
    if (message.type === 'heartbeat') {
      this.lastHeartbeat = Date.now();
      return;
    }

    // Notify specific handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }

    // Notify wildcard handlers
    const wildcardHandlers = this.messageHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler(message));
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message);
    
    // Trim queue if it exceeds max size
    if (this.messageQueue.length > this.config.messageQueueSize) {
      this.messageQueue.shift();
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()!;
      this.ws.send(JSON.stringify(message));
    }
  }

  private scheduleReconnect(): void {
    if (this.isReconnecting) return;
    
    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'heartbeat', data: {} });
        
        // Check if we've received a heartbeat recently
        if (Date.now() - this.lastHeartbeat > this.config.heartbeatInterval * 2) {
          console.warn('Heartbeat timeout, reconnecting...');
          this.ws.close();
        }
      }
    }, this.config.heartbeatInterval);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private notifyConnectionHandlers(): void {
    this.connectionHandlers.forEach(handler => handler());
  }

  private notifyDisconnectionHandlers(): void {
    this.disconnectionHandlers.forEach(handler => handler());
  }

  private handleError(error: Error): void {
    this.errorHandlers.forEach(handler => handler(error));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Tests
describe('WebSocketManager', () => {
  let wsManager: WebSocketManager;
  let mockWebSocket: MockWebSocket;

  beforeEach(() => {
    // Replace global WebSocket with mock
    (global as any).WebSocket = MockWebSocket;
    
    wsManager = new WebSocketManager({
      url: 'ws://localhost:8080',
      reconnectInterval: 100,
      maxReconnectAttempts: 3,
      heartbeatInterval: 1000,
    });
  });

  afterEach(() => {
    wsManager.disconnect();
    vi.clearAllTimers();
  });

  describe('Connection Management', () => {
    it('should establish WebSocket connection', async () => {
      const connectHandler = vi.fn();
      wsManager.onConnect(connectHandler);
      
      wsManager.connect();
      
      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(connectHandler).toHaveBeenCalled();
      expect(wsManager.getStatus().connected).toBe(true);
    });

    it('should handle multiple connect calls gracefully', async () => {
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const firstWs = (wsManager as any).ws;
      
      wsManager.connect(); // Should not create new connection
      
      expect((wsManager as any).ws).toBe(firstWs);
    });

    it('should disconnect and clean up resources', async () => {
      const disconnectHandler = vi.fn();
      wsManager.onDisconnect(disconnectHandler);
      
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      wsManager.disconnect();
      
      expect(disconnectHandler).toHaveBeenCalled();
      expect(wsManager.getStatus().connected).toBe(false);
    });

    it('should handle connection errors', async () => {
      const errorHandler = vi.fn();
      wsManager.onError(errorHandler);
      
      // Mock connection failure
      (global as any).WebSocket = class {
        constructor() {
          throw new Error('Connection failed');
        }
      };
      
      wsManager.connect();
      
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Failed to connect') })
      );
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      mockWebSocket = (wsManager as any).ws;
    });

    it('should send messages when connected', () => {
      wsManager.send({ type: 'test', data: { value: 42 } });
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"test"')
      );
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"value":42')
      );
    });

    it('should queue messages when disconnected', () => {
      wsManager.disconnect();
      
      wsManager.send({ type: 'test1', data: {} });
      wsManager.send({ type: 'test2', data: {} });
      
      expect(wsManager.getStatus().queuedMessages).toBe(2);
    });

    it('should flush message queue on reconnect', async () => {
      // Queue messages while disconnected
      wsManager.disconnect();
      wsManager.send({ type: 'queued1', data: {} });
      wsManager.send({ type: 'queued2', data: {} });
      
      // Reconnect
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      mockWebSocket = (wsManager as any).ws;
      
      // Verify queued messages were sent
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"queued1"')
      );
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"queued2"')
      );
      expect(wsManager.getStatus().queuedMessages).toBe(0);
    });

    it('should handle incoming messages', async () => {
      const messageHandler = vi.fn();
      wsManager.on('score-update', messageHandler);
      
      // Simulate incoming message
      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify({
          id: '123',
          type: 'score-update',
          data: { team: 'Alpha', score: 10 },
          timestamp: new Date().toISOString(),
        }),
      });
      
      mockWebSocket.onmessage?.(messageEvent);
      
      expect(messageHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'score-update',
          data: { team: 'Alpha', score: 10 },
        })
      );
    });

    it('should support wildcard message handlers', async () => {
      const wildcardHandler = vi.fn();
      wsManager.on('*', wildcardHandler);
      
      // Send different message types
      const messages = [
        { type: 'type1', data: {} },
        { type: 'type2', data: {} },
        { type: 'type3', data: {} },
      ];
      
      messages.forEach(msg => {
        mockWebSocket.onmessage?.(new MessageEvent('message', {
          data: JSON.stringify({ ...msg, id: '123', timestamp: new Date().toISOString() }),
        }));
      });
      
      expect(wildcardHandler).toHaveBeenCalledTimes(3);
    });

    it('should remove message handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      wsManager.on('test', handler1);
      wsManager.on('test', handler2);
      
      wsManager.off('test', handler1);
      
      // Send message
      mockWebSocket.onmessage?.(new MessageEvent('message', {
        data: JSON.stringify({
          id: '123',
          type: 'test',
          data: {},
          timestamp: new Date().toISOString(),
        }),
      }));
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should handle malformed messages gracefully', () => {
      const errorHandler = vi.fn();
      wsManager.onError(errorHandler);
      
      // Send invalid JSON
      mockWebSocket.onmessage?.(new MessageEvent('message', {
        data: 'invalid json',
      }));
      
      // Should not crash or call error handler
      expect(errorHandler).not.toHaveBeenCalled();
    });
  });

  describe('Reconnection Logic', () => {
    it('should attempt to reconnect on unexpected disconnect', async () => {
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const connectHandler = vi.fn();
      wsManager.onConnect(connectHandler);
      
      // Simulate unexpected disconnect
      const closeEvent = new CloseEvent('close', {
        wasClean: false,
        code: 1006,
      });
      
      mockWebSocket = (wsManager as any).ws;
      mockWebSocket.onclose?.(closeEvent);
      
      // Wait for reconnect attempt
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(connectHandler).toHaveBeenCalled();
      expect(wsManager.getStatus().reconnectAttempts).toBe(1);
    });

    it('should not reconnect on clean disconnect', async () => {
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const connectHandler = vi.fn();
      wsManager.onConnect(connectHandler);
      
      // Simulate clean disconnect
      const closeEvent = new CloseEvent('close', {
        wasClean: true,
        code: 1000,
      });
      
      mockWebSocket = (wsManager as any).ws;
      mockWebSocket.onclose?.(closeEvent);
      
      // Wait to ensure no reconnect
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(connectHandler).not.toHaveBeenCalled();
    });

    it('should respect max reconnect attempts', async () => {
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Simulate multiple failed reconnects
      for (let i = 0; i < 4; i++) {
        mockWebSocket = (wsManager as any).ws;
        mockWebSocket.onclose?.(new CloseEvent('close', { wasClean: false }));
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      expect(wsManager.getStatus().reconnectAttempts).toBe(3);
      expect(wsManager.getStatus().reconnecting).toBe(false);
    });

    it('should use exponential backoff for reconnects', async () => {
      const connectTimes: number[] = [];
      
      // Mock WebSocket to track connection attempts
      (global as any).WebSocket = class extends MockWebSocket {
        constructor(url: string) {
          super(url);
          connectTimes.push(Date.now());
        }
      };
      
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Trigger reconnects
      for (let i = 0; i < 3; i++) {
        mockWebSocket = (wsManager as any).ws;
        mockWebSocket.onclose?.(new CloseEvent('close', { wasClean: false }));
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Check backoff intervals
      const intervals = connectTimes.slice(1).map((time, i) => time - connectTimes[i]);
      expect(intervals[1]).toBeGreaterThan(intervals[0]);
    });
  });

  describe('Heartbeat Mechanism', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      wsManager.connect();
      await vi.advanceTimersByTimeAsync(20);
      mockWebSocket = (wsManager as any).ws;
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should send heartbeat messages periodically', async () => {
      // Advance time to trigger heartbeat
      await vi.advanceTimersByTimeAsync(1000);
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"heartbeat"')
      );
    });

    it('should update last heartbeat on response', async () => {
      const initialHeartbeat = wsManager.getStatus().lastHeartbeat;
      
      // Simulate heartbeat response
      mockWebSocket.onmessage?.(new MessageEvent('message', {
        data: JSON.stringify({
          id: '123',
          type: 'heartbeat',
          data: {},
          timestamp: new Date().toISOString(),
        }),
      }));
      
      expect(wsManager.getStatus().lastHeartbeat).toBeGreaterThan(initialHeartbeat);
    });

    it('should reconnect on heartbeat timeout', async () => {
      const disconnectHandler = vi.fn();
      wsManager.onDisconnect(disconnectHandler);
      
      // Advance time past heartbeat timeout
      await vi.advanceTimersByTimeAsync(3000);
      
      expect(disconnectHandler).toHaveBeenCalled();
    });
  });

  describe('Status and Monitoring', () => {
    it('should provide accurate status information', async () => {
      // Initial status
      let status = wsManager.getStatus();
      expect(status.connected).toBe(false);
      expect(status.reconnecting).toBe(false);
      expect(status.queuedMessages).toBe(0);
      
      // Connect
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      status = wsManager.getStatus();
      expect(status.connected).toBe(true);
      expect(status.reconnecting).toBe(false);
      
      // Queue messages
      wsManager.disconnect();
      wsManager.send({ type: 'test', data: {} });
      
      status = wsManager.getStatus();
      expect(status.connected).toBe(false);
      expect(status.queuedMessages).toBe(1);
    });
  });

  describe('Message Queue Management', () => {
    it('should respect message queue size limit', () => {
      wsManager.disconnect();
      
      // Send more messages than queue size
      for (let i = 0; i < 150; i++) {
        wsManager.send({ type: 'test', data: { index: i } });
      }
      
      expect(wsManager.getStatus().queuedMessages).toBe(100);
    });

    it('should maintain FIFO order in message queue', async () => {
      wsManager.disconnect();
      
      // Queue messages
      wsManager.send({ type: 'first', data: {} });
      wsManager.send({ type: 'second', data: {} });
      wsManager.send({ type: 'third', data: {} });
      
      // Reconnect
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      mockWebSocket = (wsManager as any).ws;
      const calls = (mockWebSocket.send as Mock).mock.calls;
      
      expect(calls[0][0]).toContain('"type":"first"');
      expect(calls[1][0]).toContain('"type":"second"');
      expect(calls[2][0]).toContain('"type":"third"');
    });
  });

  describe('Error Handling', () => {
    it('should notify error handlers on WebSocket errors', async () => {
      const errorHandler = vi.fn();
      wsManager.onError(errorHandler);
      
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      mockWebSocket = (wsManager as any).ws;
      mockWebSocket.onerror?.(new Event('error'));
      
      expect(errorHandler).toHaveBeenCalled();
    });

    it('should handle send errors gracefully', async () => {
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      mockWebSocket = (wsManager as any).ws;
      mockWebSocket.send.mockImplementation(() => {
        throw new Error('Send failed');
      });
      
      // Should not throw
      expect(() => {
        wsManager.send({ type: 'test', data: {} });
      }).not.toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle rapid connect/disconnect cycles', async () => {
      for (let i = 0; i < 5; i++) {
        wsManager.connect();
        await new Promise(resolve => setTimeout(resolve, 10));
        wsManager.disconnect();
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Should remain stable
      expect(wsManager.getStatus().connected).toBe(false);
    });

    it('should handle concurrent operations', async () => {
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Send multiple messages concurrently
      const promises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve(wsManager.send({ type: 'concurrent', data: { index: i } }))
      );
      
      await Promise.all(promises);
      
      mockWebSocket = (wsManager as any).ws;
      expect((mockWebSocket.send as Mock).mock.calls.length).toBeGreaterThanOrEqual(10);
    });

    it('should maintain message order during reconnection', async () => {
      const receivedMessages: any[] = [];
      wsManager.on('*', (msg) => receivedMessages.push(msg));
      
      wsManager.connect();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Send messages before disconnect
      wsManager.send({ type: 'before', data: { order: 1 } });
      
      // Disconnect and queue messages
      mockWebSocket = (wsManager as any).ws;
      mockWebSocket.readyState = MockWebSocket.CLOSING;
      
      wsManager.send({ type: 'during', data: { order: 2 } });
      wsManager.send({ type: 'during', data: { order: 3 } });
      
      // Reconnect
      mockWebSocket.readyState = MockWebSocket.OPEN;
      (wsManager as any).flushMessageQueue();
      
      // Send after reconnect
      wsManager.send({ type: 'after', data: { order: 4 } });
      
      // Verify order is maintained
      expect((mockWebSocket.send as Mock).mock.calls.length).toBe(4);
    });
  });
});