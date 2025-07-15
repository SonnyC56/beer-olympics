import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Target, Camera, Tv } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/material/card';
import { Button } from '@/components/ui/material/button';
import { FAB } from '@/components/ui/material/fab';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { isMobileDevice } from '@/utils/responsive';
import { MobileLayout, MobilePlayerDashboard } from '@/components/mobile';
import { useEffect, useState } from 'react';
export function DashboardPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(isMobileDevice());
        const handleResize = () => setIsMobile(isMobileDevice());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const { data: tournament, isLoading: tournamentLoading } = trpc.tournament.getBySlug.useQuery({ slug: slug }, { enabled: !!slug });
    const { data: upcomingMatches = [] } = trpc.match.getUpcomingMatches.useQuery({ tournamentId: slug }, { enabled: !!slug });
    const { data: leaderboard = [] } = trpc.leaderboard.list.useQuery({ slug: slug }, { enabled: !!slug });
    const handleSubmitScore = () => {
        toast.info('Score submission modal coming soon!');
    };
    const handleSpectatorMode = () => {
        navigate(`/spectator/${slug}`);
    };
    if (tournamentLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-pulse text-xl", children: "Loading tournament..." }) }));
    }
    if (!tournament) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "text-xl", children: "Tournament not found" }) }));
    }
    // Mobile view
    if (isMobile) {
        const playerStats = {
            wins: 0, // TODO: Calculate from match data
            losses: 0, // TODO: Calculate from match data
            totalGames: 0, // TODO: Calculate from match data
            rank: 1,
            totalPlayers: leaderboard.length,
            winStreak: 0,
        };
        const recentMatches = []; // TODO: Get from API
        const nextMatch = upcomingMatches[0] ? {
            id: upcomingMatches[0].id,
            opponent: 'Opponent Team', // TODO: Get actual opponent
            game: 'Beer Pong',
            time: new Date(),
            location: `Station ${upcomingMatches[0].stationId}`,
        } : undefined;
        return (_jsx(MobileLayout, { tournamentSlug: slug, children: _jsx(MobilePlayerDashboard, { playerName: "Player Name" // TODO: Get from auth
                , teamName: "Team Name" // TODO: Get from tournament data
                , teamColor: "#3b82f6", nextMatch: nextMatch, stats: playerStats, recentMatches: recentMatches }) }));
    }
    // Desktop view
    return (_jsxs("div", { className: "min-h-screen p-4 max-w-7xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "mb-8", children: [_jsx("h1", { className: "material-display-medium", children: tournament.name }), _jsx("p", { className: "material-body-large material-on-surface-variant mt-2", children: new Date(tournament.date).toLocaleDateString() })] }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs(Card, { variant: "elevated", elevation: 2, className: "material-motion-standard", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 material-primary" }), "Upcoming Matches"] }), _jsx(CardDescription, { children: "Your next games to play" })] }), _jsx(CardContent, { children: upcomingMatches && upcomingMatches.length > 0 ? (_jsx("div", { className: "space-y-4", children: upcomingMatches.slice(0, 3).map((match, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "p-4 material-surface-container rounded-xl flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "material-title-medium", children: ["Round ", match.round] }), _jsxs("p", { className: "material-body-small material-on-surface-variant", children: ["Station ", match.stationId || 'TBD'] })] }), _jsx(Button, { variant: "tonal", size: "small", onClick: handleSubmitScore, leadingIcon: "scoreboard", children: "Submit Score" })] }, match.id))) })) : (_jsx("p", { className: "text-center material-body-large material-on-surface-variant py-8", children: "No upcoming matches yet" })) })] }), _jsxs(Card, { variant: "elevated", elevation: 2, className: "material-motion-standard", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5 material-primary" }), "Quick Actions"] }) }), _jsxs(CardContent, { className: "grid grid-cols-2 gap-4", children: [_jsxs(Button, { variant: "elevated", className: "h-20 flex-col gap-2", fullWidth: true, onClick: handleSpectatorMode, children: [_jsx(Tv, { className: "w-6 h-6" }), "Spectator Mode"] }), _jsxs(Button, { variant: "elevated", className: "h-20 flex-col gap-2", fullWidth: true, children: [_jsx(Camera, { className: "w-6 h-6" }), "Upload Media"] }), _jsxs(Button, { variant: "elevated", className: "h-20 flex-col gap-2", fullWidth: true, children: [_jsx(Trophy, { className: "w-6 h-6" }), "Bonus Challenge"] })] })] })] }), _jsx("div", { children: _jsxs(Card, { variant: "elevated", elevation: 3, className: "material-motion-emphasized", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Trophy, { className: "w-5 h-5 material-primary" }), "Leaderboard"] }), _jsx(CardDescription, { children: "Current standings" })] }), _jsx(CardContent, { children: leaderboard && leaderboard.length > 0 ? (_jsx("div", { className: "space-y-2", children: leaderboard.slice(0, 5).map((team, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.05 }, className: "flex items-center justify-between p-3 material-surface-container rounded-xl", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "material-display-small material-on-surface-variant", children: team.position }), _jsxs("div", { children: [_jsx("p", { className: "material-title-medium", children: team.teamName }), _jsxs("p", { className: "material-body-small material-on-surface-variant", children: [team.totalPoints, " pts"] })] })] }), _jsx("span", { className: "text-2xl", children: team.flagCode })] }, team.teamId))) })) : (_jsx("p", { className: "text-center material-body-large material-on-surface-variant py-8", children: "No scores yet" })) })] }) })] }), _jsx(FAB, { icon: "edit_square", label: "Submit Score", onClick: handleSubmitScore, variant: "primary", size: "large", position: "bottom-right" })] }));
}
