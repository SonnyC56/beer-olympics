import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Activity, Users, Trophy, AlertCircle, CheckCircle, Zap, Shield, Eye } from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime';
export function ActivityMonitor({ recentActivity, tournamentId }) {
    const [activities, setActivities] = useState(recentActivity);
    const { subscribe } = useRealtime();
    useEffect(() => {
        // Subscribe to real-time activity updates
        const channel = subscribe(`tournament:${tournamentId}:activity`);
        if (channel && 'bind' in channel) {
            const cleanup = channel.bind('activity', (payload) => {
                const newActivity = {
                    type: payload.type,
                    createdAt: new Date().toISOString(),
                    description: payload.description
                };
                setActivities(prev => [newActivity, ...prev].slice(0, 20));
            });
            return () => {
                if (cleanup && typeof cleanup === 'function') {
                    cleanup();
                }
            };
        }
        return () => { };
    }, [tournamentId, subscribe]);
    const getActivityIcon = (type) => {
        switch (type) {
            case 'team_joined':
                return _jsx(Users, { className: "w-4 h-4 text-blue-400" });
            case 'match_completed':
                return _jsx(Trophy, { className: "w-4 h-4 text-green-400" });
            case 'score_submitted':
                return _jsx(CheckCircle, { className: "w-4 h-4 text-purple-400" });
            case 'dispute_raised':
                return _jsx(AlertCircle, { className: "w-4 h-4 text-red-400" });
            case 'tournament_started':
                return _jsx(Zap, { className: "w-4 h-4 text-yellow-400" });
            case 'admin_action':
                return _jsx(Shield, { className: "w-4 h-4 text-orange-400" });
            default:
                return _jsx(Activity, { className: "w-4 h-4 text-gray-400" });
        }
    };
    const getActivityColor = (type) => {
        switch (type) {
            case 'team_joined':
                return 'border-blue-500/30 bg-blue-500/10';
            case 'match_completed':
                return 'border-green-500/30 bg-green-500/10';
            case 'score_submitted':
                return 'border-purple-500/30 bg-purple-500/10';
            case 'dispute_raised':
                return 'border-red-500/30 bg-red-500/10';
            case 'tournament_started':
                return 'border-yellow-500/30 bg-yellow-500/10';
            case 'admin_action':
                return 'border-orange-500/30 bg-orange-500/10';
            default:
                return 'border-gray-500/30 bg-gray-500/10';
        }
    };
    const formatActivityType = (type) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };
    return (_jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20 h-full", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-white flex items-center gap-3", children: [_jsx(Activity, { className: "w-6 h-6 text-purple-400" }), "Live Activity Feed"] }), _jsxs(Badge, { className: "bg-green-500/20 text-green-400 border-green-500/50", children: [_jsx(Eye, { className: "w-3 h-3 mr-1" }), "LIVE"] })] }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[400px] pr-4", children: _jsx(AnimatePresence, { initial: false, children: _jsx("div", { className: "space-y-3", children: activities.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Activity, { className: "w-12 h-12 text-gray-500 mx-auto mb-3" }), _jsx("p", { className: "text-gray-400", children: "No recent activity" })] })) : (activities.map((activity, index) => (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, transition: { duration: 0.3, delay: index * 0.05 }, className: `p-3 rounded-lg border ${getActivityColor(activity.type)} 
                      transition-all hover:border-white/30`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "mt-0.5", children: getActivityIcon(activity.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-sm font-medium text-white truncate", children: formatActivityType(activity.type) }), _jsx("span", { className: "text-xs text-gray-500 whitespace-nowrap", children: formatDistanceToNow(new Date(activity.createdAt), {
                                                                addSuffix: true
                                                            }) })] }), _jsx("p", { className: "text-sm text-gray-400 mt-1", children: activity.description })] })] }) }, `${activity.type}-${activity.createdAt}-${index}`)))) }) }) }) })] }));
}
