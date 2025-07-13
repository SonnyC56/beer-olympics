# Real-Time Features Documentation

## Overview

The Beer Olympics app includes comprehensive real-time features for live score updates, push notifications, and real-time leaderboard updates. The system uses Pusher as the primary real-time service with a WebSocket fallback for development.

## Architecture

### Client-Side
- **Enhanced Real-Time Service** (`src/services/realtime-enhanced.ts`)
  - Pusher implementation with auto-reconnect
  - WebSocket fallback for development
  - Connection state management
  - Latency monitoring
  - Presence channel support

- **React Hooks** (`src/hooks/useEnhancedRealtime.ts`)
  - `useEnhancedRealtime` - Core real-time connection management
  - `useEnhancedTournamentUpdates` - Tournament-specific events
  - `useGamePresence` - Track online players in games
  - `useLeaderboardRealtime` - Live leaderboard with optimistic updates
  - `usePushNotifications` - Browser push notification support

### Server-Side
- **Pusher Server** (`src/api/services/pusher-server.ts`)
  - Server-side broadcasting
  - Channel authentication
  - Batch event triggering
  - Health monitoring

- **WebSocket Server** (`src/api/services/websocket-server.ts`)
  - Development fallback server
  - Runs on port 3001
  - Full channel/event support

### API Integration
- Match router broadcasts score updates and match completion
- Team router broadcasts when teams join
- Tournament router broadcasts status changes
- Automatic leaderboard recalculation and broadcast

## Event Types

### Tournament Events
```typescript
// Basic events (backward compatible)
'score-update': { tournamentId, matchId, teamId, points }
'match-complete': { tournamentId, matchId, winner }
'team-joined': { tournamentId, team }
'tournament-status': { tournamentId, isOpen }

// Enhanced events
'game-start': { tournamentId, matchId, gameType, teams, startTime }
'game-end': { tournamentId, matchId, finalScores, duration }
'live-score': { tournamentId, matchId, teamId, score, delta, timestamp, playerAction? }
'notification': { tournamentId, type, title, message, targetTeams? }
'leaderboard-update': { tournamentId, rankings, changedPositions }
'tournament-start': { tournamentId, totalTeams, totalMatches }
'tournament-complete': { tournamentId, winner, finalRankings }
```

## Configuration

### Environment Variables
```env
# Pusher Configuration
VITE_PUSHER_KEY=your-pusher-app-key
VITE_PUSHER_CLUSTER=us2
PUSHER_APP_ID=your-pusher-app-id
PUSHER_SECRET=your-pusher-secret

# Real-time Control
VITE_ENABLE_REALTIME=true  # Set to 'false' to disable

# WebSocket Fallback (optional)
VITE_WS_URL=  # Leave empty for defaults
```

### Channel Structure
- **Public Channels**: `tournament-{id}` - All tournament events
- **Private Channels**: `private-team-{id}` - Team-specific events
- **Presence Channels**: `presence-game-{id}` - Track online players

## Usage Examples

### Basic Tournament Updates
```typescript
import { useEnhancedTournamentUpdates } from '@/hooks/useEnhancedRealtime';

function TournamentView({ tournamentId }) {
  const { connectionState, isConnected } = useEnhancedTournamentUpdates(
    tournamentId,
    {
      onScoreUpdate: (data) => {
        console.log('Score updated:', data);
        // Update UI with new score
      },
      onLeaderboardUpdate: (data) => {
        console.log('Leaderboard changed:', data);
        // Update leaderboard display
      }
    }
  );

  return (
    <div>
      {isConnected ? '🟢 Live' : '🔴 Offline'}
      {/* Tournament UI */}
    </div>
  );
}
```

### Game Presence Tracking
```typescript
import { useGamePresence } from '@/hooks/useEnhancedRealtime';

function GameLobby({ gameId, userId }) {
  const { members, totalMembers } = useGamePresence(gameId, userId, {
    name: 'Player Name',
    team: 'Team A'
  });

  return (
    <div>
      <h3>Players Online ({totalMembers})</h3>
      {members.map(member => (
        <div key={member.user_id}>{member.user_info.name}</div>
      ))}
    </div>
  );
}
```

### Push Notifications
```typescript
import { usePushNotifications } from '@/hooks/useEnhancedRealtime';

function NotificationSetup({ tournamentId, teamId }) {
  const { permission, requestPermission, isEnabled } = usePushNotifications(
    tournamentId,
    teamId
  );

  if (!isEnabled) {
    return (
      <button onClick={requestPermission}>
        Enable Push Notifications
      </button>
    );
  }

  return <div>✅ Notifications enabled</div>;
}
```

### Optimistic Updates
```typescript
import { useLeaderboardRealtime } from '@/hooks/useEnhancedRealtime';

function Leaderboard({ tournamentId, initialRankings }) {
  const { rankings, updateScoreOptimistically } = useLeaderboardRealtime(
    tournamentId,
    initialRankings
  );

  const handleScoreSubmit = (teamId, points) => {
    // Update UI immediately
    updateScoreOptimistically(teamId, points);
    
    // Then submit to server
    submitScore.mutate({ teamId, points });
  };

  return (
    <div>
      {rankings.map(team => (
        <div key={team.teamId}>
          #{team.rank} {team.teamId}: {team.points} pts
        </div>
      ))}
    </div>
  );
}
```

## Performance Optimization

### Connection Management
- Automatic reconnection with exponential backoff
- Connection state monitoring
- Latency tracking (ping/pong every 30s)
- Channel subscription caching

### Event Batching
- Server-side batch triggering (up to 10 events)
- Client-side event debouncing
- Optimistic UI updates

### Fallback Strategy
1. Try Pusher if configured
2. Fall back to WebSocket if available
3. Gracefully degrade to polling/refresh

## Monitoring

### Connection Metrics
```typescript
const { metrics } = useEnhancedRealtime();
console.log({
  latency: metrics.averageLatency,
  uptime: metrics.connectionUptime,
  messages: metrics.messagesReceived,
  reconnects: metrics.reconnectCount
});
```

### Health Checks
```typescript
// Server-side
const isHealthy = pusherServer.isHealthy();

// Client-side
const { connectionState } = useEnhancedRealtime();
const isConnected = connectionState.state === 'connected';
```

## Testing

### Development Setup
1. Run WebSocket server: `npm run dev` (auto-starts on port 3001)
2. Use RealtimeDemo component: `<RealtimeDemo tournamentId="test" />`
3. Monitor events in browser console

### Production Testing
1. Configure Pusher credentials
2. Enable real-time features: `VITE_ENABLE_REALTIME=true`
3. Test with multiple browser tabs/devices

## Troubleshooting

### Connection Issues
- Check environment variables are set correctly
- Verify Pusher credentials are valid
- Check browser console for connection errors
- Ensure WebSocket port 3001 is not blocked (dev only)

### Event Not Received
- Verify channel subscription succeeded
- Check event name matches exactly
- Ensure tournament/game ID is correct
- Look for server-side broadcast errors

### Performance Problems
- Monitor latency metrics
- Check for event flooding
- Verify reconnection settings
- Consider implementing rate limiting