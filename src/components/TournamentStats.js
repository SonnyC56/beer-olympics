import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { MdTrendingUp, MdSportsScore, MdGroup, MdTimer, MdEmojiEvents, MdLocalFireDepartment, MdShowChart } from 'react-icons/md';
import { trpc } from '../utils/trpc';
function StatCard({ icon, label, value, trend, color = 'primary', compact = false }) {
    if (compact) {
        return (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-card/50", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `text-${color}`, children: icon }), _jsx("span", { className: "text-sm text-muted-foreground", children: label })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold", children: value }), trend && (_jsxs("p", { className: `text-xs ${trend.value > 0 ? 'text-green-500' : 'text-red-500'}`, children: [trend.value > 0 ? '+' : '', trend.value, "% ", trend.label] }))] })] }));
    }
    return (_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("div", { className: `p-2 rounded-lg bg-${color}/10`, children: _jsx("div", { className: `text-xl text-${color}`, children: icon }) }), trend && (_jsxs(Badge, { variant: trend.value > 0 ? 'default' : 'secondary', className: "text-xs", children: [trend.value > 0 ? '+' : '', trend.value, "%"] }))] }), _jsx("h3", { className: "text-2xl font-bold mb-1", children: value }), _jsx("p", { className: "text-sm text-muted-foreground", children: label }), trend && (_jsx("p", { className: "text-xs text-muted-foreground mt-1", children: trend.label }))] }));
}
export function TournamentStats({ tournamentId, compact = false }) {
    const { data: stats } = trpc.tournament.getStats.useQuery({ tournamentId }, {
        refetchInterval: 30000 // Update every 30 seconds
    });
    const { data: leaderboard } = trpc.tournament.getLeaderboard.useQuery({ tournamentId }, {
        refetchInterval: 30000
    });
    if (!stats) {
        return (_jsx(Card, { className: "p-6 animate-pulse", children: _jsx("div", { className: "h-32 bg-muted rounded-lg" }) }));
    }
    // Calculate additional stats
    const completionRate = stats.totalMatches > 0
        ? Math.round((stats.completedMatches / stats.totalMatches) * 100)
        : 0;
    const avgMatchDuration = stats.avgMatchDuration || 15; // minutes
    const remainingTime = (stats.totalMatches - stats.completedMatches) * avgMatchDuration;
    const hoursRemaining = Math.floor(remainingTime / 60);
    const minutesRemaining = remainingTime % 60;
    // Find hot streaks
    const hotTeam = leaderboard?.[0];
    if (compact) {
        return (_jsxs("div", { className: "space-y-2", children: [_jsxs("h3", { className: "font-semibold flex items-center gap-2 mb-3", children: [_jsx(MdShowChart, { className: "text-primary" }), "Tournament Stats"] }), _jsx(StatCard, { icon: _jsx(MdSportsScore, {}), label: "Matches", value: `${stats.completedMatches}/${stats.totalMatches}`, compact: true }), _jsx(StatCard, { icon: _jsx(MdGroup, {}), label: "Teams", value: stats.activeTeams, compact: true }), _jsx(StatCard, { icon: _jsx(MdTimer, {}), label: "Time Left", value: `${hoursRemaining}h ${minutesRemaining}m`, compact: true }), hotTeam && (_jsx(StatCard, { icon: _jsx(MdLocalFireDepartment, {}), label: "Leading", value: hotTeam.name, color: "orange", compact: true }))] }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h2", { className: "text-2xl font-bold flex items-center gap-2", children: [_jsx(MdShowChart, { className: "text-primary" }), "Tournament Statistics"] }), _jsx(Badge, { variant: "outline", children: "Live Updates" })] }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(StatCard, { icon: _jsx(MdSportsScore, {}), label: "Matches Completed", value: `${stats.completedMatches}/${stats.totalMatches}`, trend: {
                            value: completionRate,
                            label: "completion"
                        } }), _jsx(StatCard, { icon: _jsx(MdGroup, {}), label: "Active Teams", value: stats.activeTeams, color: "blue" }), _jsx(StatCard, { icon: _jsx(MdTimer, {}), label: "Avg Match Time", value: `${avgMatchDuration}m`, trend: stats.matchDurationTrend ? {
                            value: stats.matchDurationTrend,
                            label: "vs last hour"
                        } : undefined, color: "purple" }), _jsx(StatCard, { icon: _jsx(MdEmojiEvents, {}), label: "Games Played", value: stats.uniqueGamesPlayed || 0, color: "orange" })] }), _jsxs(Card, { className: "p-4", children: [_jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2", children: [_jsx(MdTrendingUp, { className: "text-green-500" }), "Performance Insights"] }), _jsxs("div", { className: "space-y-3", children: [hotTeam && (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, className: "flex items-center justify-between p-3 rounded-lg bg-primary/10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(MdLocalFireDepartment, { className: "text-orange-500 text-xl" }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium", children: [hotTeam.name, " is on fire!"] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [hotTeam.wins, " wins \u2022 ", hotTeam.points, " points"] })] })] }), _jsx(Badge, { variant: "default", className: "bg-orange-500", children: "#1" })] })), _jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-card", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(MdTimer, { className: "text-blue-500 text-xl" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Estimated time remaining" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Based on current pace" })] })] }), _jsxs("span", { className: "font-semibold", children: [hoursRemaining, "h ", minutesRemaining, "m"] })] })] })] }), _jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Tournament Progress" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [completionRate, "%"] })] }), _jsx("div", { className: "w-full bg-muted rounded-full h-3 overflow-hidden", children: _jsx(motion.div, { className: "h-full bg-primary rounded-full", initial: { width: 0 }, animate: { width: `${completionRate}%` }, transition: { duration: 1, ease: "easeOut" } }) })] })] }));
}
