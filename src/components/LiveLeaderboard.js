import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Zap, Search, ArrowUp, ArrowDown, Minus, Activity, Users, Target, Sparkles, ChevronUp, ChevronDown, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
const POSITION_COLORS = {
    1: 'from-yellow-500 to-amber-500',
    2: 'from-gray-400 to-gray-500',
    3: 'from-amber-600 to-amber-700',
};
export default function LiveLeaderboard({ stats: initialStats, onTeamClick, updateInterval = 5000, showAnimations = true, compactMode = false }) {
    const [stats, setStats] = useState(initialStats);
    const [sortField, setSortField] = useState('position');
    const [sortAscending, setSortAscending] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState(compactMode ? 'compact' : 'standard');
    const [expandedTeams, setExpandedTeams] = useState(new Set());
    const [highlightedTeam, setHighlightedTeam] = useState(null);
    const previousStatsRef = useRef(initialStats);
    useEffect(() => {
        setStats(initialStats);
    }, [initialStats]);
    // Simulate real-time updates for demo
    useEffect(() => {
        if (!showAnimations)
            return;
        const interval = setInterval(() => {
            setStats(prev => {
                // Store previous positions
                previousStatsRef.current = prev;
                // Simulate some random changes
                const updated = prev.map(team => ({
                    ...team,
                    previousPosition: team.position,
                    totalPoints: team.totalPoints + (Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0)
                }));
                // Recalculate positions
                updated.sort((a, b) => b.totalPoints - a.totalPoints);
                updated.forEach((team, index) => {
                    team.position = index + 1;
                });
                return updated;
            });
        }, updateInterval);
        return () => clearInterval(interval);
    }, [updateInterval, showAnimations]);
    const sortedStats = [...stats]
        .filter(team => team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.flagCode.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case 'position':
                comparison = a.position - b.position;
                break;
            case 'points':
                comparison = b.totalPoints - a.totalPoints;
                break;
            case 'wins':
                comparison = b.wins - a.wins;
                break;
            case 'ppg':
                comparison = b.pointsPerGame - a.pointsPerGame;
                break;
            case 'name':
                comparison = a.teamName.localeCompare(b.teamName);
                break;
        }
        return sortAscending ? comparison : -comparison;
    });
    const getPositionChange = (team) => {
        if (!team.previousPosition || team.previousPosition === team.position) {
            return { icon: Minus, color: 'text-gray-400', change: 0 };
        }
        else if (team.previousPosition > team.position) {
            return {
                icon: ArrowUp,
                color: 'text-green-500',
                change: team.previousPosition - team.position
            };
        }
        else {
            return {
                icon: ArrowDown,
                color: 'text-red-500',
                change: team.position - team.previousPosition
            };
        }
    };
    const getPositionIcon = (position) => {
        switch (position) {
            case 1:
                return _jsx(Trophy, { className: "w-6 h-6 text-yellow-500" });
            case 2:
                return _jsx(Medal, { className: "w-6 h-6 text-gray-400" });
            case 3:
                return _jsx(Medal, { className: "w-6 h-6 text-amber-600" });
            default:
                return null;
        }
    };
    const toggleTeamExpansion = (teamId) => {
        setExpandedTeams(prev => {
            const newSet = new Set(prev);
            if (newSet.has(teamId)) {
                newSet.delete(teamId);
            }
            else {
                newSet.add(teamId);
            }
            return newSet;
        });
    };
    const renderTeamRow = (team, index) => {
        const positionChange = getPositionChange(team);
        const isExpanded = expandedTeams.has(team.teamId);
        const isHighlighted = highlightedTeam === team.teamId;
        return (_jsx(motion.div, { layout: true, initial: { opacity: 0, y: 20 }, animate: {
                opacity: 1,
                y: 0,
                scale: isHighlighted ? 1.02 : 1
            }, exit: { opacity: 0, y: -20 }, transition: {
                duration: 0.3,
                delay: index * 0.05,
                layout: { duration: 0.5, type: 'spring' }
            }, className: `group ${isHighlighted ? 'z-10' : ''}`, onMouseEnter: () => setHighlightedTeam(team.teamId), onMouseLeave: () => setHighlightedTeam(null), children: _jsxs("div", { className: `relative overflow-hidden rounded-2xl transition-all cursor-pointer
            ${team.position <= 3 ? `bg-gradient-to-r ${POSITION_COLORS[team.position]} bg-opacity-20` : 'bg-white/10'}
            ${isHighlighted ? 'shadow-glow ring-2 ring-party-pink' : 'hover:bg-white/15'}
          `, onClick: () => onTeamClick?.(team.teamId), children: [team.position <= 3 && showAnimations && (_jsx(motion.div, { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent", animate: {
                            x: [-200, 200],
                        }, transition: {
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 2,
                        } })), _jsxs("div", { className: "relative z-10 p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "text-3xl font-bold text-white/20", children: team.position }), getPositionIcon(team.position), positionChange.change > 0 && (_jsxs(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, className: "flex items-center gap-1", children: [_jsx(positionChange.icon, { className: `w-4 h-4 ${positionChange.color}` }), _jsx("span", { className: `text-xs font-bold ${positionChange.color}`, children: positionChange.change })] }))] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-4 h-4 rounded-full shadow-lg", style: { backgroundColor: team.colorHex } }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-party text-xl text-white", children: team.teamName }), _jsx("span", { className: "text-2xl", children: team.flagCode })] }), viewMode === 'detailed' && (_jsxs("div", { className: "flex items-center gap-3 mt-1 text-sm text-white/70", children: [_jsxs("span", { children: [team.gamesPlayed, " games"] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [team.wins, "W - ", team.losses, "L"] }), team.streak && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsxs("span", { className: team.streak.type === 'win' ? 'text-green-400' : 'text-red-400', children: [team.streak.count, team.streak.type === 'win' ? 'W' : 'L', " streak"] })] }))] }))] })] })] }), _jsxs("div", { className: "flex items-center gap-6", children: [viewMode !== 'compact' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-white", children: team.totalPoints }), _jsx("p", { className: "text-xs text-white/50 font-party", children: "Points" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xl font-bold text-white", children: team.pointsPerGame.toFixed(1) }), _jsx("p", { className: "text-xs text-white/50 font-party", children: "PPG" })] })] })), viewMode === 'standard' && team.recentForm.length > 0 && (_jsx("div", { className: "flex gap-1", children: team.recentForm.slice(-5).map((result, i) => (_jsx("div", { className: `w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                          ${result === 'W' ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'}
                        `, children: result }, i))) })), viewMode === 'compact' && (_jsx("div", { className: "text-xl font-bold text-white", children: team.totalPoints })), _jsx(Button, { onClick: (e) => {
                                                    e.stopPropagation();
                                                    toggleTeamExpansion(team.teamId);
                                                }, variant: "ghost", size: "sm", className: "text-white hover:bg-white/20", children: isExpanded ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" })) })] })] }), _jsx(AnimatePresence, { children: isExpanded && (_jsxs(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.3 }, className: "mt-4 pt-4 border-t border-white/20", children: [_jsx("h4", { className: "font-party text-sm text-white/70 mb-3", children: "Game Breakdown" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2", children: team.gameBreakdown.map((game) => (_jsxs("div", { className: "bg-white/10 rounded-lg p-2 text-center", children: [_jsx("p", { className: "text-xs text-white/70 font-party", children: game.gameName }), _jsx("p", { className: "text-lg font-bold text-white", children: game.points }), _jsxs("p", { className: "text-xs text-white/50", children: ["Rank #", game.rank] })] }, game.gameId))) })] })) })] })] }) }, team.teamId));
    };
    return (_jsxs(Card, { className: "card-party", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "font-beer text-3xl flex items-center gap-3", children: [_jsx(Trophy, { className: "w-8 h-8 text-party-yellow animate-bounce-in" }), "Live Leaderboard", showAnimations && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Activity, { className: "w-5 h-5 text-green-500 animate-pulse" }), _jsx("span", { className: "text-sm font-party text-green-500", children: "LIVE" })] }))] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("div", { className: "flex bg-white/10 rounded-lg p-1", children: ['compact', 'standard', 'detailed'].map((mode) => (_jsx("button", { onClick: () => setViewMode(mode), className: `px-3 py-1 rounded text-sm font-party capitalize transition-all ${viewMode === mode
                                        ? 'bg-gradient-party text-white'
                                        : 'text-white/70 hover:text-white'}`, children: mode }, mode))) }) })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" }), _jsx(Input, { value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Search teams...", className: "input-party pl-10" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("select", { value: sortField, onChange: (e) => setSortField(e.target.value), className: "input-party", children: [_jsx("option", { value: "position", children: "Position" }), _jsx("option", { value: "points", children: "Total Points" }), _jsx("option", { value: "wins", children: "Wins" }), _jsx("option", { value: "ppg", children: "Points Per Game" }), _jsx("option", { value: "name", children: "Team Name" })] }), _jsx(Button, { onClick: () => setSortAscending(!sortAscending), variant: "outline", size: "icon", className: "border-white/30 text-white hover:bg-white/10", children: sortAscending ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" })) })] })] }), viewMode !== 'compact' && (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                            { label: 'Total Teams', value: stats.length, icon: Users },
                            { label: 'Games Played', value: stats.reduce((sum, t) => sum + t.gamesPlayed, 0), icon: Target },
                            { label: 'Total Points', value: stats.reduce((sum, t) => sum + t.totalPoints, 0), icon: Star },
                            { label: 'Avg PPG', value: (stats.reduce((sum, t) => sum + t.pointsPerGame, 0) / stats.length).toFixed(1), icon: Zap }
                        ].map((stat, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "bg-white/10 rounded-xl p-3 text-center", children: [_jsx(stat.icon, { className: "w-6 h-6 text-party-cyan mx-auto mb-1" }), _jsx("p", { className: "text-2xl font-bold text-white", children: stat.value }), _jsx("p", { className: "text-xs text-white/70 font-party", children: stat.label })] }, stat.label))) })), _jsx("div", { className: "space-y-2", children: _jsx(AnimatePresence, { children: sortedStats.map((team, index) => renderTeamRow(team, index)) }) }), sortedStats.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Sparkles, { className: "w-12 h-12 text-white/30 mx-auto mb-3" }), _jsx("p", { className: "text-white/50 font-party", children: "No teams found" })] }))] })] }));
}
