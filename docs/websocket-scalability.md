# WebSocket Scalability Infrastructure

## Overview

The Beer Olympics app now features an enhanced WebSocket infrastructure designed to handle **100+ concurrent connections** with reliability and performance. This upgrade introduces connection pooling, offline message queuing, room-based subscriptions, and automatic failover mechanisms.

## Key Features

### 1. Connection Pooling (`websocket-manager.ts`)
- **Multi-endpoint support**: Load balancing across multiple WebSocket servers
- **Connection health monitoring**: Automatic detection and removal of unhealthy connections
- **Smart routing**: Channels are distributed across connections based on load
- **Metrics tracking**: Real-time monitoring of connection health, latency, and throughput

Configuration:
```typescript
{
  maxConnections: 100,
  maxConnectionsPerEndpoint: 25,
  connectionTimeout: 10000,
  healthCheckInterval: 30000,
  maxReconnectAttempts: 5,
  reconnectBackoff: {
    initial: 1000,
    max: 30000,
    multiplier: 2
  }
}
```

### 2. Offline Message Queuing (`websocket-queue.ts`)
- **Priority-based queuing**: Critical messages (scores, winners) get priority
- **Persistent storage**: Important messages survive page reloads
- **Automatic retry**: Failed messages retry with exponential backoff
- **Message deduplication**: Prevents duplicate event processing
- **Batch processing**: Efficient sending of multiple messages

Message priorities:
- `critical`: Score updates, match winners
- `high`: Status updates, game events
- `normal`: Team joins/leaves
- `low`: Activity tracking, metadata

### 3. Room-Based Subscriptions (`websocket-rooms.ts`)
- **Efficient channel organization**: Group related subscriptions
- **Tournament-specific rooms**: Automatic room creation for tournaments
- **Presence tracking**: Know who's watching each tournament/match
- **Targeted broadcasting**: Send messages to specific teams or roles
- **Room lifecycle management**: Automatic cleanup of inactive rooms

Room types:
- `tournament`: Main tournament updates
- `match`: Individual match events
- `presence`: Active participant tracking
- `private`: Admin-only channels
- `global`: App-wide notifications

### 4. Enhanced React Hook (`useEnhancedRealtime.ts`)
- **Auto-reconnection**: Handles network interruptions gracefully
- **Fallback to polling**: Degrades gracefully when WebSocket unavailable
- **Connection metrics**: Monitor latency and connection health
- **Room management**: Easy API for joining/leaving rooms
- **Tournament helpers**: Specialized functions for tournament events

## Usage

### Enable Scalable WebSocket Service

In your `.env.local`:
```bash
# Enable the scalable WebSocket infrastructure
VITE_ENABLE_SCALABLE_WS=true

# Optional: Configure WebSocket endpoints
VITE_WS_URL=wss://your-websocket-server.com
```

### React Component Example

```typescript
import { useEnhancedRealtime } from '@/hooks/useEnhancedRealtime';

function TournamentView({ tournamentId }) {
  const realtime = useEnhancedRealtime({
    enableRooms: true,
    enablePresence: true,
    enableMetrics: true,
  });

  // Join tournament room
  useEffect(() => {
    if (realtime.isConnected) {
      realtime.joinRoom(`tournament:${tournamentId}`, userId);
      
      // Create tournament-specific rooms
      realtime.createTournamentRooms(tournamentId, {
        name: 'Summer Tournament',
        teams: teamIds,
        matches: matchIds,
      });
    }
  }, [realtime.isConnected]);

  // Monitor connection health
  if (realtime.metrics) {
    console.log(`Latency: ${realtime.latency}ms`);
    console.log(`Active connections: ${realtime.metrics.activeConnections}`);
    console.log(`Queue size: ${realtime.queueStats.total}`);
  }

  return (
    <div>
      {!realtime.isOnline && <OfflineBanner />}
      {realtime.error && <ErrorMessage error={realtime.error} />}
      <ConnectionStatus 
        isConnected={realtime.isConnected}
        latency={realtime.latency}
      />
    </div>
  );
}
```

### Tournament-Specific Hook

```typescript
import { useTournamentRealtime } from '@/hooks/useEnhancedRealtime';

function LiveTournament({ tournamentId }) {
  const { 
    scores, 
    participants, 
    activity,
    broadcastTournamentEvent 
  } = useTournamentRealtime(tournamentId);

  // Broadcast a tournament-wide notification
  const notifyAll = (message) => {
    broadcastTournamentEvent(tournamentId, 'notification', {
      type: 'info',
      title: 'Tournament Update',
      message,
    });
  };

  return (
    <div>
      <h2>Live Participants: {participants.size}</h2>
      <ScoreBoard scores={scores} />
      <ActivityFeed activities={activity} />
    </div>
  );
}
```

## Performance Characteristics

### Connection Pooling Benefits
- **Reduced latency**: Messages route through the healthiest connections
- **Load distribution**: No single connection becomes a bottleneck
- **Fault tolerance**: Failed connections don't affect others
- **Scalability**: Add more endpoints as needed

### Message Queue Benefits
- **Reliability**: Messages aren't lost during disconnections
- **Efficiency**: Batch sending reduces overhead
- **Priority handling**: Important updates always go first
- **Persistence**: Critical messages survive browser crashes

### Room-Based Architecture Benefits
- **Reduced bandwidth**: Only receive relevant events
- **Better organization**: Logical grouping of related events
- **Presence awareness**: Know who's active in each context
- **Targeted messaging**: Send to specific subsets of users

## Monitoring and Debugging

### Connection Metrics
```typescript
const metrics = realtime.getConnectionPoolMetrics();
console.log({
  totalConnections: metrics.totalConnections,
  activeConnections: metrics.activeConnections,
  averageLatency: metrics.averageLatency,
  connectionHealth: metrics.connectionHealth,
  messageRate: metrics.totalMessages,
});
```

### Queue Statistics
```typescript
const queueStats = realtime.getQueueStats();
console.log({
  queuedMessages: queueStats.total,
  byPriority: queueStats.byPriority,
  oldestMessage: new Date(queueStats.oldest),
  isProcessing: queueStats.processing,
});
```

### Room Information
```typescript
const roomStats = realtime.getRoomStats('tournament:123');
console.log({
  memberCount: roomStats.memberCount,
  subscriptions: roomStats.subscriptionCount,
  lastActivity: new Date(roomStats.lastActivity),
  uptime: roomStats.uptime,
});
```

## Best Practices

1. **Use rooms for logical grouping**: Create rooms for tournaments, matches, and teams
2. **Set appropriate message priorities**: Ensure critical updates aren't delayed
3. **Monitor connection health**: React to degraded connections proactively
4. **Clean up subscriptions**: Always unsubscribe when components unmount
5. **Handle offline scenarios**: Provide feedback when connection is lost
6. **Use presence for engagement**: Show who's actively watching
7. **Batch related updates**: Send multiple updates in a single message

## Migration from Basic WebSocket

The enhanced infrastructure is backward compatible. To migrate:

1. Enable scalable WebSocket in environment config
2. Replace `useRealtime` with `useEnhancedRealtime`
3. Add room management for better organization
4. Implement offline handling for better UX
5. Monitor metrics to optimize performance

## Future Enhancements

- **Binary protocol**: For even more efficient data transfer
- **Compression**: Reduce bandwidth for large payloads
- **Edge deployment**: WebSocket servers closer to users
- **Horizontal scaling**: Automatically spawn more connection pools
- **Analytics integration**: Track real-time engagement metrics