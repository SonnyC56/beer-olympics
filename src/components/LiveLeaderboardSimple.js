import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { trpc } from '../utils/trpc';
import { MdLeaderboard, MdRemove } from 'react-icons/md';
export function LiveLeaderboard({ tournamentId, compact = false, highlightTeams = [], maxTeams }) {
    const { data: leaderboard, isLoading } = trpc.tournament.getLeaderboard.useQuery({ tournamentId }, {
        refetchInterval: 10000 // Update every 10 seconds
    });
    if (isLoading) {
        return (_jsx(Card, { className: "p-4 animate-pulse", children: _jsx("div", { className: "h-32 bg-muted rounded-lg" }) }));
    }
    const teams = maxTeams ? leaderboard?.slice(0, maxTeams) : leaderboard;
    // Simplified getRankChange as previousRank is not available from API
    const getRankChange = (team) => {
        return { icon: _jsx(MdRemove, { className: "text-muted-foreground" }), change: 0 };
    };
    const getRankBadge = (rank) => {
        switch (rank) {
            case 1:
                return _jsx(Badge, { className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50", children: "\uD83E\uDD47 1st" });
            case 2:
                return _jsx(Badge, { className: "bg-gray-400/20 text-gray-400 border-gray-400/50", children: "\uD83E\uDD48 2nd" });
            case 3:
                return _jsx(Badge, { className: "bg-amber-600/20 text-amber-600 border-amber-600/50", children: "\uD83E\uDD49 3rd" });
            default:
                return _jsxs(Badge, { variant: "outline", children: [rank, "th"] });
        }
    };
    if (compact) {
        return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [_jsx(MdLeaderboard, { className: "text-primary" }), "Standings"] }), teams && teams.length > 0 && (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: [teams[0].gamesPlayed, " games"] }))] }), _jsx(AnimatePresence, { mode: "popLayout", children: teams?.map((team, index) => {
                        const rankChange = getRankChange(team);
                        const isHighlighted = highlightTeams.includes(team.id);
                        return (_jsx(motion.div, { layout: true, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, transition: { delay: index * 0.05 }, className: `p-2 rounded-lg ${isHighlighted ? 'bg-primary/20 ring-1 ring-primary' : 'bg-card/50'} hover:bg-card transition-colors`, children: _jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [_jsx("span", { className: "text-sm font-bold w-6 text-center", children: team.rank }), rankChange.icon, _jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [team.color && (_jsx("div", { className: "w-3 h-3 rounded-full shrink-0", style: { backgroundColor: team.color } })), _jsx("span", { className: "font-medium truncate", children: team.name })] })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsxs("span", { className: "text-muted-foreground", children: [team.wins, "-", team.losses] }), _jsx("span", { className: "font-bold tabular-nums", children: team.points })] })] }) }, team.id));
                    }) }), (!teams || teams.length === 0) && (_jsx("div", { className: "text-center py-4 text-muted-foreground text-sm", children: "No teams yet" }))] }));
    }
    return (_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h2", { className: "text-xl font-bold flex items-center gap-2", children: [_jsx(MdLeaderboard, { className: "text-primary" }), "Live Standings"] }), _jsx(Badge, { variant: "outline", children: "Updated every 10s" })] }), _jsx("div", { className: "space-y-2", children: _jsx(AnimatePresence, { mode: "popLayout", children: teams?.map((team, index) => {
                        const rankChange = getRankChange(team);
                        const isHighlighted = highlightTeams.includes(team.id);
                        return (_jsx(motion.div, { layout: true, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, transition: { delay: index * 0.05 }, className: `p-3 rounded-lg ${isHighlighted ? 'bg-primary/10 ring-2 ring-primary' : 'bg-card'} ${team.rank <= 3 ? 'shadow-lg' : ''}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getRankBadge(team.rank), _jsx("div", { className: "flex items-center gap-1", children: rankChange.icon }), _jsxs("div", { className: "flex items-center gap-2", children: [team.color && (_jsx("div", { className: "w-4 h-4 rounded-full", style: { backgroundColor: team.color } })), _jsx("span", { className: "font-semibold text-lg", children: team.name })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold", children: team.points }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Points" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-sm font-medium", children: [team.wins, "-", team.losses] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "W-L" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm font-medium", children: team.gamesPlayed > 0
                                                            ? (team.points / team.gamesPlayed).toFixed(1)
                                                            : '0.0' }), _jsx("p", { className: "text-xs text-muted-foreground", children: "PPG" })] })] })] }) }, team.id));
                    }) }) }), (!teams || teams.length === 0) && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(MdLeaderboard, { className: "text-4xl mx-auto mb-2 opacity-50" }), _jsx("p", { children: "No teams in the tournament yet" })] }))] }));
}
