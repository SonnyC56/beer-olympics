import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Sparkles, Clock, CheckCircle, AlertCircle, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
const ROUND_NAMES = {
    1: 'Round of 16',
    2: 'Quarterfinals',
    3: 'Semifinals',
    4: 'Finals',
    5: 'Grand Finals'
};
export default function BracketView({ tournamentName, format, matches, teams, onMatchClick, onRefresh, compact = false }) {
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [hoveredMatch, setHoveredMatch] = useState(null);
    // Group matches by round
    const roundMatches = matches.reduce((acc, match) => {
        if (!acc[match.round])
            acc[match.round] = [];
        acc[match.round].push(match);
        return acc;
    }, {});
    const rounds = Object.keys(roundMatches)
        .map(Number)
        .sort((a, b) => a - b);
    const getMatchHeight = () => compact ? 60 : 80;
    const getMatchSpacing = () => compact ? 20 : 30;
    const getMatchStatus = (match) => {
        if (match.status === 'completed') {
            return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20' };
        }
        else if (match.status === 'in_progress') {
            return { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
        }
        else {
            return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-400/20' };
        }
    };
    const renderTeam = (team, score, isWinner) => {
        if (!team) {
            return (_jsx("div", { className: "flex items-center justify-between px-3 py-2 bg-white/5 text-white/40", children: _jsx("span", { className: "text-sm", children: "TBD" }) }));
        }
        return (_jsxs(motion.div, { className: `flex items-center justify-between px-3 py-2 transition-all ${isWinner ? 'bg-gradient-party text-white font-bold' : 'bg-white/10 text-white'}`, whileHover: { scale: 1.02 }, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-3 h-3 rounded-full", style: { backgroundColor: team.color } }), _jsxs("span", { className: "text-sm font-party", children: [team.flag && _jsx("span", { className: "mr-1", children: team.flag }), team.name] }), isWinner && _jsx(Crown, { className: "w-4 h-4 text-yellow-300 ml-1" })] }), score !== undefined && (_jsx("span", { className: `text-sm font-bold ${isWinner ? 'text-yellow-300' : ''}`, children: score }))] }));
    };
    const renderMatch = (match, roundIndex) => {
        const status = getMatchStatus(match);
        const isSelected = selectedMatch === match.id;
        const isHovered = hoveredMatch === match.id;
        return (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: roundIndex * 0.1 + match.position * 0.05 }, className: `relative ${compact ? 'mb-4' : 'mb-6'}`, style: { height: getMatchHeight() }, onMouseEnter: () => setHoveredMatch(match.id), onMouseLeave: () => setHoveredMatch(null), children: [_jsx(Card, { className: `h-full cursor-pointer transition-all ${isSelected ? 'ring-2 ring-party-pink shadow-glow' : ''} ${isHovered ? 'scale-105 shadow-lg' : ''}`, onClick: () => {
                        setSelectedMatch(match.id);
                        onMatchClick?.(match);
                    }, children: _jsxs("div", { className: "h-full flex flex-col justify-center p-2", children: [_jsx("div", { className: `absolute -top-2 -right-2 w-6 h-6 rounded-full ${status.bg} flex items-center justify-center`, children: _jsx(status.icon, { className: `w-4 h-4 ${status.color}` }) }), _jsx("div", { className: "absolute -left-3 top-1/2 -translate-y-1/2 bg-white/10 rounded-full px-2 py-1", children: _jsxs("span", { className: "text-xs font-party text-white/70", children: ["M", match.id] }) }), _jsxs("div", { className: "space-y-1", children: [renderTeam(match.team1, match.score1, match.winner === match.team1?.id), _jsx("div", { className: "h-px bg-white/20 mx-2" }), renderTeam(match.team2, match.score2, match.winner === match.team2?.id)] }), match.gameType && !compact && (_jsx("div", { className: "absolute -bottom-2 left-1/2 -translate-x-1/2 bg-beer-amber text-beer-dark px-2 py-0.5 rounded-full text-xs font-party whitespace-nowrap", children: match.gameType }))] }) }), roundIndex < rounds.length - 1 && (_jsx("svg", { className: "absolute top-1/2 -right-6 w-6 h-1", style: { transform: 'translateY(-50%)' }, children: _jsx("line", { x1: "0", y1: "0", x2: "24", y2: "0", stroke: "rgba(255,255,255,0.2)", strokeWidth: "2" }) }))] }, match.id));
    };
    const renderRoundRobin = () => {
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: matches.map((match, index) => (_jsx(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.05 }, children: _jsx(Card, { className: `cursor-pointer transition-all ${selectedMatch === match.id ? 'ring-2 ring-party-pink shadow-glow' : ''}`, onClick: () => {
                        setSelectedMatch(match.id);
                        onMatchClick?.(match);
                    }, children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("span", { className: "text-sm font-party text-white/70", children: ["Match ", match.id] }), getMatchStatus(match).icon ? (_jsx("div", { className: `w-6 h-6 rounded-full ${getMatchStatus(match).bg} flex items-center justify-center`, children: React.createElement(getMatchStatus(match).icon, {
                                            className: `w-4 h-4 ${getMatchStatus(match).color}`
                                        }) })) : null] }), _jsxs("div", { className: "space-y-2", children: [renderTeam(match.team1, match.score1, match.winner === match.team1?.id), _jsx("div", { className: "text-center text-xs text-white/50 font-party", children: "VS" }), renderTeam(match.team2, match.score2, match.winner === match.team2?.id)] }), match.gameType && (_jsx("div", { className: "mt-3 text-center", children: _jsx("span", { className: "bg-beer-amber/20 text-beer-amber px-2 py-1 rounded-full text-xs font-party", children: match.gameType }) }))] }) }) }, match.id))) }));
    };
    const renderElimination = () => {
        return (_jsxs("div", { className: "flex gap-8 overflow-x-auto pb-4", children: [rounds.map((round, roundIndex) => (_jsxs("div", { className: "flex-shrink-0", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { delay: roundIndex * 0.1 }, className: "text-center mb-4", children: [_jsx("h3", { className: "font-beer text-xl text-white", children: ROUND_NAMES[round] || `Round ${round}` }), _jsxs("div", { className: "flex items-center justify-center gap-2 mt-1", children: [_jsx(Sparkles, { className: "w-4 h-4 text-party-yellow animate-pulse" }), _jsxs("span", { className: "text-sm text-white/70 font-party", children: [roundMatches[round].length, " ", roundMatches[round].length === 1 ? 'match' : 'matches'] })] })] }), _jsx("div", { className: "space-y-4", style: {
                                marginTop: roundIndex * getMatchSpacing(),
                                minHeight: `${(Math.pow(2, rounds.length - roundIndex - 1) * (getMatchHeight() + getMatchSpacing()))}px`
                            }, children: roundMatches[round].map((match) => renderMatch(match, roundIndex)) })] }, round))), format === 'single_elimination' && rounds.length > 0 && (_jsx("div", { className: "flex-shrink-0 flex items-center justify-center", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, transition: { delay: rounds.length * 0.1, type: 'spring' }, className: "text-center", children: [_jsx("div", { className: "w-32 h-32 rounded-full bg-gradient-victory flex items-center justify-center shadow-victory mb-4", children: _jsx(Trophy, { className: "w-16 h-16 text-white animate-bounce-in" }) }), _jsx("h3", { className: "font-beer text-2xl text-white mb-2", children: "Champion" }), (() => {
                                const finalMatch = roundMatches[rounds[rounds.length - 1]]?.[0];
                                const winner = finalMatch?.winner ?
                                    teams.find(t => t.id === finalMatch.winner) : null;
                                return winner ? (_jsx("div", { className: "bg-gradient-party rounded-xl px-4 py-2", children: _jsxs("span", { className: "text-white font-party text-lg", children: [winner.flag, " ", winner.name] }) })) : (_jsx("span", { className: "text-white/50 font-party", children: "TBD" }));
                            })()] }) }))] }));
    };
    const content = (_jsxs("div", { className: `${fullscreen ? 'fixed inset-0 z-50 bg-neutral-900 p-8 overflow-auto' : ''}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsxs("h2", { className: "font-beer text-3xl text-white flex items-center gap-3", children: [_jsx(Trophy, { className: "w-8 h-8 text-party-yellow" }), tournamentName] }), _jsxs("p", { className: "text-white/70 font-party mt-1", children: [format.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), " Format"] })] }), _jsxs("div", { className: "flex gap-2", children: [onRefresh && (_jsxs(Button, { onClick: onRefresh, variant: "outline", size: "sm", className: "border-white/30 text-white hover:bg-white/10", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] })), _jsx(Button, { onClick: () => setFullscreen(!fullscreen), variant: "outline", size: "sm", className: "border-white/30 text-white hover:bg-white/10", children: fullscreen ? (_jsxs(_Fragment, { children: [_jsx(Minimize2, { className: "w-4 h-4 mr-2" }), "Exit Fullscreen"] })) : (_jsxs(_Fragment, { children: [_jsx(Maximize2, { className: "w-4 h-4 mr-2" }), "Fullscreen"] })) })] })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-party text-white/70", children: "Tournament Progress" }), _jsxs("span", { className: "text-sm font-party text-white", children: [matches.filter(m => m.status === 'completed').length, " / ", matches.length, " matches completed"] })] }), _jsx("div", { className: "w-full bg-white/10 rounded-full h-3", children: _jsx(motion.div, { className: "bg-gradient-party h-3 rounded-full", initial: { width: 0 }, animate: {
                                width: `${(matches.filter(m => m.status === 'completed').length / matches.length) * 100}%`
                            }, transition: { duration: 1, ease: 'easeOut' } }) })] }), _jsx("div", { className: `${fullscreen ? 'h-[calc(100vh-200px)]' : ''} overflow-auto`, children: format === 'round_robin' ? renderRoundRobin() : renderElimination() }), !compact && (_jsxs("div", { className: "mt-6 flex flex-wrap items-center gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }), _jsx("span", { className: "text-white/70", children: "Completed" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-yellow-500" }), _jsx("span", { className: "text-white/70", children: "In Progress" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-white/70", children: "Pending" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Crown, { className: "w-4 h-4 text-yellow-300" }), _jsx("span", { className: "text-white/70", children: "Winner" })] })] }))] }));
    return fullscreen ? content : _jsx(Card, { className: "card-party", children: content });
}
