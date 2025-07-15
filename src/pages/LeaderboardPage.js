import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useTournamentUpdates } from '@/hooks/useRealtime';
import { useCallback } from 'react';
import { Card } from '@/components/ui/material/card';
export function LeaderboardPage() {
    const { slug } = useParams();
    const { data: tournament, isLoading: tournamentLoading } = trpc.tournament.getBySlug.useQuery({ slug: slug }, { enabled: !!slug });
    const { data: leaderboard = [], isLoading: leaderboardLoading, refetch: refetchLeaderboard } = trpc.leaderboard.list.useQuery({ slug: slug }, { enabled: !!slug, refetchInterval: 30000 } // Refetch every 30 seconds as fallback
    );
    // Real-time updates
    const handleScoreUpdate = useCallback(() => {
        refetchLeaderboard();
    }, [refetchLeaderboard]);
    const handleMatchComplete = useCallback(() => {
        refetchLeaderboard();
    }, [refetchLeaderboard]);
    useTournamentUpdates(slug, {
        onScoreUpdate: handleScoreUpdate,
        onMatchComplete: handleMatchComplete,
    });
    const getMedalIcon = (position) => {
        switch (position) {
            case 1:
                return _jsx(Trophy, { className: "w-8 h-8 text-yellow-500" });
            case 2:
                return _jsx(Medal, { className: "w-8 h-8 text-gray-400" });
            case 3:
                return _jsx(Award, { className: "w-8 h-8 text-amber-700" });
            default:
                return null;
        }
    };
    if (tournamentLoading || leaderboardLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-pulse text-xl", children: "Loading leaderboard..." }) }));
    }
    if (!tournament) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "text-xl", children: "Tournament not found" }) }));
    }
    return (_jsxs("div", { className: "min-h-screen p-4 max-w-4xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "text-center mb-12", children: [_jsx("h1", { className: "material-display-large mb-2", children: tournament.name }), _jsx("p", { className: "material-headline-medium material-on-surface-variant", children: "Leaderboard" })] }), _jsx("div", { className: "space-y-4", children: leaderboard.map((team, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, children: _jsxs(Card, { variant: "elevated", elevation: team.position <= 3 ? 3 : 1, className: `
                relative overflow-hidden p-6 material-motion-standard
                ${team.position === 1 ? 'material-gold-container' : ''}
                ${team.position === 2 ? 'material-silver-container' : ''}
                ${team.position === 3 ? 'material-bronze-container' : ''}
                ${team.position > 3 ? 'material-surface-container' : ''}
              `, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "material-display-medium material-on-surface-variant", children: team.position }), getMedalIcon(team.position)] }), _jsx("div", { children: _jsxs("h3", { className: "material-headline-medium flex items-center gap-3", children: [_jsx("span", { className: "w-4 h-4 rounded-full material-motion-standard", style: { backgroundColor: team.colorHex } }), team.teamName, _jsx("span", { className: "material-headline-large", children: team.flagCode })] }) })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "material-display-small", children: team.totalPoints }), _jsx("p", { className: "material-label-medium material-on-surface-variant", children: "points" })] })] }), team.position <= 3 && (_jsx(motion.div, { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent", animate: {
                                    x: [-1000, 1000],
                                }, transition: {
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatDelay: 5,
                                } }))] }) }, team.teamId))) })] }));
}
