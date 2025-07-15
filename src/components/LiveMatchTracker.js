import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { MdSportsScore, MdTimer, MdLocationOn, MdStar, MdCameraAlt, MdVideocam } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';
export function LiveMatchTracker({ matches, onFocusMatch, favoriteTeams = [], displayMode = 'desktop', focused = false, gridView = false, tvMode = false }) {
    const [pulsingMatches, setPulsingMatches] = useState(new Set());
    const [recentScores, setRecentScores] = useState(new Map());
    // Track score changes for animations
    useEffect(() => {
        const newScores = new Map();
        const newPulsing = new Set();
        matches.forEach(match => {
            match.scores.forEach(score => {
                const key = `${match.id}-${score.teamId}`;
                const prevScore = recentScores.get(key);
                if (prevScore !== undefined && prevScore !== score.score) {
                    newPulsing.add(key);
                    setTimeout(() => {
                        setPulsingMatches(prev => {
                            const next = new Set(prev);
                            next.delete(key);
                            return next;
                        });
                    }, 3000);
                }
                newScores.set(key, score.score);
            });
        });
        setRecentScores(newScores);
        setPulsingMatches(prev => new Set([...prev, ...newPulsing]));
    }, [matches]);
    const getMatchCardSize = () => {
        if (tvMode)
            return 'h-64';
        if (focused)
            return 'h-96';
        if (gridView)
            return 'h-48';
        if (displayMode === 'mobile')
            return 'h-40';
        return 'h-56';
    };
    const renderMatch = (match) => {
        const hasFavorite = match.teams.some(team => favoriteTeams.includes(team.id));
        const matchDuration = match.startedAt
            ? formatDistanceToNow(new Date(match.startedAt), { includeSeconds: true })
            : 'Starting soon';
        return (_jsxs(motion.div, { layout: true, initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, whileHover: { scale: 1.02 }, className: `relative ${gridView ? '' : 'col-span-1'}`, children: [_jsxs(Card, { className: `${getMatchCardSize()} p-4 cursor-pointer transition-all ${hasFavorite ? 'ring-2 ring-primary ring-offset-2' : ''}`, onClick: () => onFocusMatch?.(match.station.id), children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "bg-primary/10 p-2 rounded-lg", children: _jsx(MdSportsScore, { className: "text-lg text-primary" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: match.game.name }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(MdLocationOn, { className: "text-sm" }), _jsx("span", { children: match.station.name }), match.station.location && (_jsxs("span", { className: "opacity-60", children: ["\u2022 ", match.station.location] }))] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [hasFavorite && (_jsxs(Badge, { variant: "default", className: "bg-primary/20 text-primary gap-1", children: [_jsx(MdStar, { className: "text-xs" }), "Favorite"] })), _jsxs(Badge, { variant: match.status === 'in_progress' ? 'destructive' : 'secondary', className: "gap-1", children: [match.status === 'in_progress' && (_jsx(motion.div, { animate: { opacity: [1, 0.3, 1] }, transition: { duration: 2, repeat: Infinity }, className: "w-2 h-2 bg-current rounded-full" })), _jsx(MdTimer, { className: "text-xs" }), matchDuration] })] })] }), _jsx("div", { className: "space-y-2 flex-1", children: match.teams.map((team, index) => {
                                const teamScore = match.scores.find(s => s.teamId === team.id);
                                const scoreKey = `${match.id}-${team.id}`;
                                const isPulsing = pulsingMatches.has(scoreKey);
                                return (_jsxs(motion.div, { className: `flex items-center justify-between p-2 rounded-lg bg-card ${teamScore?.position === 1 ? 'ring-2 ring-primary/50' : ''}`, animate: isPulsing ? {
                                        backgroundColor: ['rgba(var(--primary), 0.2)', 'rgba(var(--primary), 0)', 'rgba(var(--primary), 0.2)']
                                    } : {}, transition: { duration: 0.5, repeat: isPulsing ? 3 : 0 }, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold", style: { backgroundColor: team.color }, children: team.avatar || team.name[0] }), _jsx("span", { className: "font-medium", children: team.name }), favoriteTeams.includes(team.id) && (_jsx(MdStar, { className: "text-primary text-sm" }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [teamScore?.position === 1 && (_jsx("span", { className: "text-xs font-medium text-primary", children: "LEADING" })), _jsx(motion.span, { initial: { scale: 1.5, color: 'var(--primary)' }, animate: { scale: 1, color: 'var(--foreground)' }, className: "text-2xl font-bold tabular-nums", children: teamScore?.score || 0 }, `${scoreKey}-${teamScore?.score}`)] })] }, team.id));
                            }) }), match.highlights && match.highlights.length > 0 && (_jsxs("div", { className: "mt-3 pt-3 border-t flex items-center gap-2", children: [_jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(MdCameraAlt, {}), _jsx("span", { children: match.highlights.filter(h => h.type === 'photo').length })] }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(MdVideocam, {}), _jsx("span", { children: match.highlights.filter(h => h.type === 'video').length })] }), _jsx("span", { className: "text-xs text-muted-foreground ml-auto", children: "View highlights \u2192" })] }))] }), tvMode && match.status === 'in_progress' && (_jsx(motion.div, { className: "absolute top-2 right-2", animate: { opacity: [1, 0.5, 1] }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Badge, { variant: "destructive", className: "text-xs", children: "LIVE" }) }))] }, match.id));
    };
    if (matches.length === 0) {
        return (_jsxs(Card, { className: "p-8 text-center", children: [_jsx(MdSportsScore, { className: "text-4xl text-muted-foreground mx-auto mb-2" }), _jsx("h3", { className: "text-lg font-medium mb-1", children: "No Active Matches" }), _jsx("p", { className: "text-muted-foreground", children: "Check back soon for live match updates!" })] }));
    }
    // TV Mode Layout
    if (tvMode) {
        return (_jsx("div", { className: "h-full", children: _jsx(AnimatePresence, { mode: "popLayout", children: matches.slice(0, 4).map(renderMatch) }) }));
    }
    // Focused Mode
    if (focused && matches.length === 1) {
        return (_jsx("div", { className: "max-w-4xl mx-auto", children: renderMatch(matches[0]) }));
    }
    // Grid/Split View
    return (_jsx("div", { className: `grid gap-4 ${gridView
            ? `grid-cols-${displayMode === 'mobile' ? '1' : '2'} lg:grid-cols-3`
            : 'grid-cols-1'}`, children: _jsx(AnimatePresence, { mode: "popLayout", children: matches.map(renderMatch) }) }));
}
