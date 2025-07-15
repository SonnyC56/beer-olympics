import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MdSchedule, MdLocationOn, MdStar, MdStarBorder, MdNotificationsActive } from 'react-icons/md';
import { format, formatDistanceToNow, addMinutes } from 'date-fns';
export function UpcomingMatches({ matches, favoriteTeams = [], onToggleFavorite, tickerMode = false, compact = false }) {
    // Ticker mode for TV display
    if (tickerMode) {
        return (_jsxs("div", { className: "flex items-center gap-4 overflow-x-hidden", children: [_jsx(Badge, { variant: "destructive", className: "shrink-0", children: "UPCOMING" }), _jsx(motion.div, { className: "flex gap-6", animate: { x: [0, -100 + '%'] }, transition: {
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: matches.length * 10,
                            ease: "linear",
                        },
                    }, children: [...matches, ...matches].map((match, index) => (_jsxs("div", { className: "flex items-center gap-2 whitespace-nowrap", children: [_jsx(MdSchedule, { className: "text-muted-foreground" }), _jsx("span", { className: "font-medium", children: format(new Date(match.scheduledFor), 'h:mm a') }), _jsx("span", { className: "text-muted-foreground", children: "\u2022" }), _jsx("span", { children: match.game.name }), _jsx("span", { className: "text-muted-foreground", children: "@" }), _jsx("span", { children: match.station.name }), _jsx("span", { className: "text-muted-foreground", children: "\u2022" }), _jsx("span", { className: "font-medium", children: match.teams.map(t => t.name).join(' vs ') })] }, `${match.id}-${index}`))) })] }));
    }
    const renderMatch = (match, index) => {
        const hasFavorite = match.teams.some(team => favoriteTeams.includes(team.id));
        const timeUntil = formatDistanceToNow(new Date(match.scheduledFor), { addSuffix: true });
        const estimatedEnd = match.game.estimatedDuration
            ? addMinutes(new Date(match.scheduledFor), match.game.estimatedDuration)
            : null;
        if (compact) {
            return (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.05 }, className: "p-3 rounded-lg bg-card/50 hover:bg-card transition-colors", children: _jsx("div", { className: "flex items-center justify-between gap-2", children: _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: format(new Date(match.scheduledFor), 'h:mm a') }), hasFavorite && _jsx(MdStar, { className: "text-primary text-sm" })] }), _jsx("p", { className: "text-sm font-medium truncate", children: match.teams.map(t => t.name).join(' vs ') }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [match.game.name, " \u2022 ", match.station.name] })] }) }) }, match.id));
        }
        return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { delay: index * 0.1 }, children: _jsxs(Card, { className: `p-4 ${hasFavorite ? 'ring-2 ring-primary/50' : ''}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-muted p-2 rounded-lg", children: _jsx(MdSchedule, { className: "text-lg" }) }), _jsxs("div", { children: [_jsxs("h4", { className: "font-semibold flex items-center gap-2", children: [match.game.name, match.round && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: match.round }))] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(MdLocationOn, { className: "text-sm" }), _jsx("span", { children: match.station.name }), match.station.location && (_jsxs("span", { className: "opacity-60", children: ["\u2022 ", match.station.location] }))] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-medium", children: format(new Date(match.scheduledFor), 'h:mm a') }), _jsx("p", { className: "text-xs text-muted-foreground", children: timeUntil })] })] }), _jsx("div", { className: "space-y-2 mb-3", children: match.teams.map((team) => {
                            const isFavorite = favoriteTeams.includes(team.id);
                            return (_jsxs("div", { className: "flex items-center justify-between p-2 rounded-lg bg-background/50", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold", style: { backgroundColor: team.color }, children: team.avatar || team.name[0] }), _jsx("span", { className: "font-medium", children: team.name })] }), onToggleFavorite && (_jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => onToggleFavorite(team.id), children: isFavorite ? (_jsx(MdStar, { className: "text-primary" })) : (_jsx(MdStarBorder, { className: "text-muted-foreground" })) }))] }, team.id));
                        }) }), _jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground pt-3 border-t", children: [_jsxs("div", { className: "flex items-center gap-3", children: [match.game.estimatedDuration && (_jsxs("span", { children: ["~", match.game.estimatedDuration, " min"] })), estimatedEnd && (_jsxs("span", { children: ["Ends ~", format(estimatedEnd, 'h:mm a')] }))] }), hasFavorite && (_jsxs("div", { className: "flex items-center gap-1 text-primary", children: [_jsx(MdNotificationsActive, { className: "text-sm" }), _jsx("span", { children: "Notifications on" })] }))] })] }) }, match.id));
    };
    if (matches.length === 0) {
        return (_jsxs(Card, { className: "p-6 text-center", children: [_jsx(MdSchedule, { className: "text-3xl text-muted-foreground mx-auto mb-2" }), _jsx("h3", { className: "font-medium mb-1", children: "No Upcoming Matches" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "All matches have been scheduled or completed." })] }));
    }
    return (_jsxs("div", { className: "space-y-3", children: [!compact && (_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [_jsx(MdSchedule, { className: "text-primary" }), "Upcoming Matches"] }), _jsxs(Badge, { variant: "secondary", children: [matches.length, " scheduled"] })] })), _jsx(AnimatePresence, { mode: "popLayout", children: matches.map((match, index) => renderMatch(match, index)) })] }));
}
