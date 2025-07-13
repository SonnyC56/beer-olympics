import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

interface WSClient {
  id: string;
  ws: WebSocket;
  channels: Set<string>;
  userId?: string;
}

export class RealtimeWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, WSClient>();
  private channels = new Map<string, Set<string>>(); // channel -> client IDs
  
  constructor() {
    if (process.env.NODE_ENV === 'production') {
      console.log('WebSocket server is not initialized in production (use Pusher instead)');
      return;
    }
    
    this.initialize();
  }
  
  private initialize() {
    // In development, create WebSocket server on port 3001
    if (process.env.NODE_ENV === 'development') {
      this.wss = new WebSocketServer({ 
        port: 3001,
        path: '/ws',
      });
      
      this.wss.on('connection', this.handleConnection.bind(this));
      console.log('✅ WebSocket server running on ws://localhost:3001/ws');
    }
  }
  
  private handleConnection(ws: WebSocket, _req: IncomingMessage) {
    const clientId = this.generateClientId();
    const client: WSClient = {
      id: clientId,
      ws,
      channels: new Set(),
    };
    
    this.clients.set(clientId, client);
    
    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      clientId,
    }));
    
    ws.on('message', (data) => this.handleMessage(clientId, data));
    ws.on('close', () => this.handleDisconnect(clientId));
    ws.on('error', (error) => console.error(`WebSocket error for ${clientId}:`, error));
    
    // Setup ping/pong for connection health
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);
    
    ws.on('close', () => clearInterval(pingInterval));
  }
  
  private handleMessage(clientId: string, data: WebSocket.RawData) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'subscribe':
          this.subscribeToChannel(clientId, message.channel);
          break;
          
        case 'unsubscribe':
          this.unsubscribeFromChannel(clientId, message.channel);
          break;
          
        case 'message':
          this.broadcastToChannel(message.channel, message.event, message.data, clientId);
          break;
          
        case 'ping':
          client.ws.send(JSON.stringify({
            type: 'pong',
            timestamp: message.timestamp,
          }));
          break;
      }
    } catch (error) {
      console.error('Failed to handle WebSocket message:', error);
    }
  }
  
  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // Remove from all channels
    client.channels.forEach(channel => {
      const channelClients = this.channels.get(channel);
      if (channelClients) {
        channelClients.delete(clientId);
        if (channelClients.size === 0) {
          this.channels.delete(channel);
        }
      }
    });
    
    this.clients.delete(clientId);
  }
  
  private subscribeToChannel(clientId: string, channel: string) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    client.channels.add(channel);
    
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);
    
    // Confirm subscription
    client.ws.send(JSON.stringify({
      type: 'subscribed',
      channel,
    }));
  }
  
  private unsubscribeFromChannel(clientId: string, channel: string) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    client.channels.delete(channel);
    
    const channelClients = this.channels.get(channel);
    if (channelClients) {
      channelClients.delete(clientId);
      if (channelClients.size === 0) {
        this.channels.delete(channel);
      }
    }
    
    // Confirm unsubscription
    client.ws.send(JSON.stringify({
      type: 'unsubscribed',
      channel,
    }));
  }
  
  private broadcastToChannel(channel: string, event: string, data: any, excludeClientId?: string) {
    const channelClients = this.channels.get(channel);
    if (!channelClients) return;
    
    const message = JSON.stringify({
      type: 'message',
      channel,
      event,
      data,
    });
    
    channelClients.forEach(clientId => {
      if (clientId === excludeClientId) return;
      
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }
  
  // Public API for server-side broadcasting
  public broadcast(channel: string, event: string, data: any) {
    this.broadcastToChannel(channel, event, data);
  }
  
  // Get channel statistics
  public getChannelInfo(channel: string) {
    const channelClients = this.channels.get(channel);
    return {
      channel,
      subscriptionCount: channelClients ? channelClients.size : 0,
    };
  }
  
  // Get all active channels
  public getActiveChannels() {
    return Array.from(this.channels.keys());
  }
  
  private generateClientId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const wsServer = new RealtimeWebSocketServer();

// Middleware for Next.js API routes to upgrade to WebSocket
export function handleWebSocketUpgrade(req: IncomingMessage, socket: any, head: any) {
  const { pathname } = parse(req.url || '');
  
  if (pathname === '/api/ws' && wsServer['wss']) {
    wsServer['wss'].handleUpgrade(req, socket, head, (ws) => {
      wsServer['wss']!.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
}