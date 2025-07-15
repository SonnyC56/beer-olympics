import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useEnhancedTournamentUpdates } from '../hooks/useEnhancedRealtime';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
export function RealtimeDemo({ tournamentId }) {
    const [events, setEvents] = useState([]);
    const [liveScore, setLiveScore] = useState({});
    // Setup tournament real-time updates
    const { connectionState, metrics, activeUsers, isConnected, latency } = useEnhancedTournamentUpdates(tournamentId, {
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
    });
    const clearEvents = () => setEvents([]);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Connection Status" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Status:" }), _jsx("span", { className: isConnected ? 'text-green-600' : 'text-red-600', children: connectionState.state })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Latency:" }), _jsxs("span", { children: [latency, "ms"] })] }), metrics && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Messages Sent:" }), _jsx("span", { children: metrics.messagesSent })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Messages Received:" }), _jsx("span", { children: metrics.messagesReceived })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Reconnects:" }), _jsx("span", { children: metrics.reconnectCount })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Connection Time:" }), _jsx("span", { children: new Date().toLocaleTimeString() })] })] }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: ["Active Users (", activeUsers.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-1", children: activeUsers.length > 0 ? (activeUsers.map((member) => (_jsxs("div", { className: "text-sm", children: [member.info?.name || member.id, " - ", member.info?.role || 'Viewer'] }, member.id)))) : (_jsx("p", { className: "text-gray-500", children: "No active users" })) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Live Scores" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: Object.entries(liveScore).length > 0 ? (Object.entries(liveScore).map(([teamId, score]) => (_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { children: ["Team ", teamId, ":"] }), _jsx("span", { className: "font-bold", children: score })] }, teamId)))) : (_jsx("p", { className: "text-gray-500", children: "No live scores yet" })) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs(CardTitle, { children: ["Event Log (", events.length, ")"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: clearEvents, children: "Clear" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: events.length > 0 ? (events.slice(-10).reverse().map((event, index) => (_jsxs("div", { className: "text-sm border-b pb-2", children: [_jsx("div", { className: "font-medium text-gray-700", children: event.type }), _jsx("div", { className: "text-xs text-gray-500", children: event.timestamp.toLocaleTimeString() }), _jsx("pre", { className: "text-xs mt-1 bg-gray-100 p-1 rounded overflow-x-auto", children: JSON.stringify(event.data, null, 2) })] }, index)))) : (_jsx("p", { className: "text-gray-500", children: "No events yet" })) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Test Actions" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: _jsx("p", { className: "text-sm text-gray-600", children: "Use the tournament control panel to trigger real-time events and see them appear above." }) }) })] })] }));
}
