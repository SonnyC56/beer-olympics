import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Users } from 'lucide-react';
import { trpc } from '@/utils/trpc';
export function DisplayPage() {
    const { slug } = useParams();
    const [currentView, setCurrentView] = useState('leaderboard');
    const { data: leaderboard } = trpc.leaderboard.list.useQuery({ slug: slug }, {
        enabled: !!slug,
        refetchInterval: 10000, // Refresh every 10 seconds
    });
    const { data: upcomingMatches } = trpc.match.getUpcomingMatches.useQuery({ tournamentId: slug }, {
        enabled: !!slug,
        refetchInterval: 10000,
    });
    const { data: tournament } = trpc.tournament.getBySlug.useQuery({ slug: slug }, { enabled: !!slug });
    // Auto-rotate views every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentView((prev) => prev === 'leaderboard' ? 'matches' : 'leaderboard');
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    if (!tournament) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-pulse text-3xl", children: "Loading display..." }) }));
    }
    return (_jsx("div", { className: "min-h-screen p-8 bg-gradient-to-br from-gray-950 to-gray-900", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "text-center mb-8", children: [_jsx("h1", { className: "text-6xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent", children: tournament.name }), _jsx("p", { className: "text-2xl text-gray-400 mt-2", children: new Date(tournament.date).toLocaleDateString() })] }), _jsx(AnimatePresence, { mode: "wait", children: currentView === 'leaderboard' ? (_jsxs(motion.div, { initial: { opacity: 0, x: 100 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -100 }, className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-center gap-3 mb-8", children: [_jsx(Trophy, { className: "w-10 h-10 text-amber-500" }), _jsx("h2", { className: "text-4xl font-bold", children: "Leaderboard" })] }), leaderboard && leaderboard.length > 0 ? (_jsx("div", { className: "grid gap-4", children: leaderboard.slice(0, 8).map((team, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: `
                        flex items-center justify-between p-6 rounded-2xl
                        ${index === 0 ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-2 border-yellow-700' : ''}
                        ${index === 1 ? 'bg-gradient-to-r from-gray-800/30 to-gray-700/30 border-2 border-gray-600' : ''}
                        ${index === 2 ? 'bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-2 border-amber-700' : ''}
                        ${index > 2 ? 'bg-gray-900/50 border border-gray-800' : ''}
                      `, children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsx("span", { className: "text-5xl font-bold text-gray-500", children: team.position }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "w-6 h-6 rounded-full", style: { backgroundColor: team.colorHex } }), _jsx("h3", { className: "text-3xl font-bold", children: team.teamName }), _jsx("span", { className: "text-4xl", children: team.flagCode })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-4xl font-bold", children: team.totalPoints }), _jsx("p", { className: "text-xl text-gray-400", children: "points" })] })] }, team.teamId))) })) : (_jsx("p", { className: "text-center text-3xl text-gray-400 py-16", children: "Tournament starting soon..." }))] }, "leaderboard")) : (_jsxs(motion.div, { initial: { opacity: 0, x: 100 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -100 }, className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-center gap-3 mb-8", children: [_jsx(Clock, { className: "w-10 h-10 text-amber-500" }), _jsx("h2", { className: "text-4xl font-bold", children: "Upcoming Matches" })] }), upcomingMatches && upcomingMatches.length > 0 ? (_jsx("div", { className: "grid gap-4", children: upcomingMatches.slice(0, 6).map((match, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "bg-gray-900/50 border border-gray-800 p-6 rounded-2xl", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-2xl font-semibold text-gray-400", children: ["Round ", match.round] }), _jsxs("p", { className: "text-3xl font-bold mt-2", children: ["Station ", match.stationId || 'TBD'] })] }), _jsx(Users, { className: "w-12 h-12 text-gray-600" })] }) }, match.id))) })) : (_jsx("p", { className: "text-center text-3xl text-gray-400 py-16", children: "Matches will appear here once scheduled" }))] }, "matches")) })] }) }));
}
