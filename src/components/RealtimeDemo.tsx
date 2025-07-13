import { useState } from 'react';
import { 
  useEnhancedTournamentUpdates
} from '../hooks/useEnhancedRealtime';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';

interface RealtimeDemoProps {
  tournamentId: string;
  teamId?: string;
  userId?: string;
}

export function RealtimeDemo({ tournamentId }: RealtimeDemoProps) {
  const [events, setEvents] = useState<Array<{ type: string; data: any; timestamp: Date }>>([]);
  const [liveScore, setLiveScore] = useState<Record<string, number>>({});
  
  // Setup tournament real-time updates
  const { connectionState, metrics, activeUsers, isConnected, latency } = useEnhancedTournamentUpdates(
    tournamentId,
    {
      onScoreUpdate: (data) => {
        console.log('Score update:', data);
        setEvents(prev => [...prev, { type: 'score-update', data, timestamp: new Date() }]);
      },
      onMatchComplete: (data) => {
        console.log('Match complete:', data);
        setEvents(prev => [...prev, { type: 'match-complete', data, timestamp: new Date() }]);
      },
      onTeamJoined: (data) => {
        console.log('Team joined:', data);
        setEvents(prev => [...prev, { type: 'team-joined', data, timestamp: new Date() }]);
      },
      onLiveScore: (data) => {
        console.log('Live score:', data);
        setLiveScore(prev => ({
          ...prev,
          [data.teamId]: data.score,
        }));
        setEvents(prev => [...prev, { type: 'live-score', data, timestamp: new Date() }]);
      },
      onLeaderboardUpdate: (data) => {
        console.log('Leaderboard update:', data);
        setEvents(prev => [...prev, { type: 'leaderboard-update', data, timestamp: new Date() }]);
      },
      onNotification: (data) => {
        console.log('Notification:', data);
        setEvents(prev => [...prev, { type: 'notification', data, timestamp: new Date() }]);
      },
      onGameStart: (data) => {
        console.log('Game start:', data);
        setEvents(prev => [...prev, { type: 'game-start', data, timestamp: new Date() }]);
      },
      onGameEnd: (data) => {
        console.log('Game end:', data);
        setEvents(prev => [...prev, { type: 'game-end', data, timestamp: new Date() }]);
      },
    }
  );

  const clearEvents = () => setEvents([]);

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {connectionState.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Latency:</span>
              <span>{latency}ms</span>
            </div>
            {metrics && (
              <>
                <div className="flex justify-between">
                  <span>Messages Sent:</span>
                  <span>{metrics.messagesSent}</span>
                </div>
                <div className="flex justify-between">
                  <span>Messages Received:</span>
                  <span>{metrics.messagesReceived}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reconnects:</span>
                  <span>{metrics.reconnectCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Connection Time:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card>
        <CardHeader>
          <CardTitle>Active Users ({activeUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {activeUsers.length > 0 ? (
              activeUsers.map((member: any) => (
                <div key={member.id} className="text-sm">
                  {member.info?.name || member.id} - {member.info?.role || 'Viewer'}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No active users</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Live Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(liveScore).length > 0 ? (
              Object.entries(liveScore).map(([teamId, score]) => (
                <div key={teamId} className="flex justify-between">
                  <span>Team {teamId}:</span>
                  <span className="font-bold">{score}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No live scores yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Event Log ({events.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={clearEvents}>
            Clear
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.length > 0 ? (
              events.slice(-10).reverse().map((event, index) => (
                <div key={index} className="text-sm border-b pb-2">
                  <div className="font-medium text-gray-700">{event.type}</div>
                  <div className="text-xs text-gray-500">{event.timestamp.toLocaleTimeString()}</div>
                  <pre className="text-xs mt-1 bg-gray-100 p-1 rounded overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No events yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Use the tournament control panel to trigger real-time events and see them appear above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}