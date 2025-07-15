import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveMatchTracker } from '../components/LiveMatchTracker';
import { UpcomingMatches } from '../components/UpcomingMatches';
import { LiveLeaderboard } from '../components/LiveLeaderboardSimple';
import { TournamentStats } from '../components/TournamentStats';
import SocialFeed from '../components/SocialFeed';
import { MdFullscreen, MdFullscreenExit, MdSplitscreen, MdTv, MdPhoneIphone } from 'react-icons/md';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
export function SpectatorPage() {
    const { slug } = useParams();
    const [viewMode, setViewMode] = useState('split');
    const [displayMode, setDisplayMode] = useState('desktop');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [focusedStation, setFocusedStation] = useState(null);
    const [favoriteTeams, setFavoriteTeams] = useState([]);
    const { data: tournament } = trpc.tournament.getBySlug.useQuery({ slug: slug || '' }, { enabled: !!slug });
    const { data: activeMatches } = trpc.match.getActiveMatches.useQuery({ tournamentId: tournament?.slug || '' }, {
        enabled: !!tournament?.slug,
        refetchInterval: 5000 // Poll every 5 seconds
    });
    const { data: upcomingMatches } = trpc.match.getUpcomingMatches.useQuery({ tournamentId: tournament?.slug || '' }, {
        enabled: !!tournament?.slug,
        refetchInterval: 30000 // Poll every 30 seconds
    });
    // Detect display mode based on screen size
    useEffect(() => {
        const detectDisplayMode = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setDisplayMode('mobile');
            }
            else if (width > 1920) {
                setDisplayMode('tv');
            }
            else {
                setDisplayMode('desktop');
            }
        };
        detectDisplayMode();
        window.addEventListener('resize', detectDisplayMode);
        return () => window.removeEventListener('resize', detectDisplayMode);
    }, []);
    // Fullscreen handling
    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        }
        else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };
    // Handle favorite team notifications
    useEffect(() => {
        if (!activeMatches)
            return;
        const checkFavoriteMatches = () => {
            activeMatches.forEach(match => {
                const hasFavoriteTeam = match.teams.some(team => team && favoriteTeams.includes(team.id));
                if (hasFavoriteTeam && match.status === 'in_progress') {
                    // Send browser notification if permitted
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Your team is playing!', {
                            body: `${match.game.name} at ${match.station.name}`,
                            icon: '/beer-olympics-icon.png'
                        });
                    }
                }
            });
        };
        checkFavoriteMatches();
    }, [activeMatches, favoriteTeams]);
    if (!tournament) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-primary", children: "Tournament not found" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Please check the URL and try again." })] }) }));
    }
    return (_jsxs("div", { className: `min-h-screen bg-background ${displayMode === 'tv' ? 'p-0' : 'p-4'}`, children: [_jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: `mb-6 ${displayMode === 'tv' ? 'px-8 pt-6' : ''}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-4xl font-bold text-primary flex items-center gap-2", children: [_jsx(MdTv, { className: "text-3xl" }), tournament.name, " - Live"] }), _jsxs("p", { className: "text-muted-foreground mt-1", children: [activeMatches?.length || 0, " matches in progress \u2022 ", upcomingMatches?.length || 0, " upcoming"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "bg-card rounded-lg p-1 flex gap-1", children: [_jsxs(Button, { variant: viewMode === 'split' ? 'default' : 'ghost', size: "sm", onClick: () => setViewMode('split'), className: "flex items-center gap-1", children: [_jsx(MdSplitscreen, { className: "text-lg" }), "Split"] }), _jsx(Button, { variant: viewMode === 'focus' ? 'default' : 'ghost', size: "sm", onClick: () => setViewMode('focus'), children: "Focus" }), _jsx(Button, { variant: viewMode === 'grid' ? 'default' : 'ghost', size: "sm", onClick: () => setViewMode('grid'), children: "Grid" }), _jsxs(Button, { variant: viewMode === 'tv' ? 'default' : 'ghost', size: "sm", onClick: () => setViewMode('tv'), className: "flex items-center gap-1", children: [_jsx(MdTv, { className: "text-lg" }), "TV"] })] }), _jsxs("div", { className: "bg-card rounded-lg px-3 py-1.5 flex items-center gap-2", children: [displayMode === 'mobile' && _jsx(MdPhoneIphone, { className: "text-lg" }), displayMode === 'tv' && _jsx(MdTv, { className: "text-lg" }), _jsx("span", { className: "text-sm capitalize", children: displayMode })] }), _jsx(Button, { variant: "outline", size: "icon", onClick: toggleFullscreen, className: "rounded-lg", children: isFullscreen ? _jsx(MdFullscreenExit, { className: "text-xl" }) : _jsx(MdFullscreen, { className: "text-xl" }) })] })] }) }), _jsxs(AnimatePresence, { mode: "wait", children: [viewMode === 'split' && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: `grid ${displayMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-12'} gap-4`, children: [_jsx("div", { className: `${displayMode === 'mobile' ? '' : 'col-span-8'}`, children: _jsx(LiveMatchTracker, { matches: (activeMatches || []).map(match => ({
                                        ...match,
                                        teams: match.teams.filter(team => team !== null),
                                        scores: match.scores.filter(score => score !== null)
                                    })), onFocusMatch: (stationId) => {
                                        setFocusedStation(stationId);
                                        setViewMode('focus');
                                    }, favoriteTeams: favoriteTeams, displayMode: displayMode }) }), _jsx("div", { className: `${displayMode === 'mobile' ? '' : 'col-span-4'} space-y-4`, children: _jsxs(Tabs, { defaultValue: "leaderboard", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3 bg-card", children: [_jsx(TabsTrigger, { value: "leaderboard", children: "Standings" }), _jsx(TabsTrigger, { value: "upcoming", children: "Upcoming" }), _jsx(TabsTrigger, { value: "social", children: "Social" })] }), _jsx(TabsContent, { value: "leaderboard", className: "mt-4", children: _jsx(LiveLeaderboard, { tournamentId: tournament.slug, compact: true, highlightTeams: favoriteTeams }) }), _jsx(TabsContent, { value: "upcoming", className: "mt-4", children: _jsx(UpcomingMatches, { matches: upcomingMatches || [], favoriteTeams: favoriteTeams, onToggleFavorite: (teamId) => {
                                                    setFavoriteTeams(prev => prev.includes(teamId)
                                                        ? prev.filter(id => id !== teamId)
                                                        : [...prev, teamId]);
                                                } }) }), _jsx(TabsContent, { value: "social", className: "mt-4", children: _jsx(SocialFeed, { posts: [] }) })] }) })] }, "split")), viewMode === 'focus' && focusedStation && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: "space-y-4", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                    setViewMode('split');
                                    setFocusedStation(null);
                                }, className: "mb-4", children: "\u2190 Back to Split View" }), _jsx(LiveMatchTracker, { matches: (activeMatches?.filter(m => m.station.id === focusedStation) || []).map(match => ({
                                    ...match,
                                    teams: match.teams.filter(team => team !== null),
                                    scores: match.scores.filter(score => score !== null)
                                })), focused: true, displayMode: displayMode })] }, "focus")), viewMode === 'grid' && (_jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: `grid ${displayMode === 'mobile' ? 'grid-cols-1' :
                            displayMode === 'tv' ? 'grid-cols-4' : 'grid-cols-3'} gap-4`, children: _jsx(LiveMatchTracker, { matches: (activeMatches || []).map(match => ({
                                ...match,
                                teams: match.teams.filter(team => team !== null),
                                scores: match.scores.filter(score => score !== null)
                            })), gridView: true, displayMode: displayMode }) }, "grid")), viewMode === 'tv' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "h-screen flex flex-col", children: [_jsxs("div", { className: "flex-1 grid grid-cols-12 gap-6 p-6", children: [_jsx("div", { className: "col-span-9", children: _jsx(LiveMatchTracker, { matches: (activeMatches || []).map(match => ({
                                                ...match,
                                                teams: match.teams.filter(team => team !== null),
                                                scores: match.scores.filter(score => score !== null)
                                            })), tvMode: true, displayMode: "tv" }) }), _jsxs("div", { className: "col-span-3 space-y-4", children: [_jsx(TournamentStats, { tournamentId: tournament.slug, compact: true }), _jsx(LiveLeaderboard, { tournamentId: tournament.slug, compact: true, maxTeams: 8 })] })] }), _jsx("div", { className: "bg-card/80 backdrop-blur-sm p-4 border-t", children: _jsx(UpcomingMatches, { matches: upcomingMatches?.slice(0, 5) || [], tickerMode: true }) })] }, "tv"))] }), favoriteTeams.length > 0 && 'Notification' in window && Notification.permission === 'default' && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "fixed bottom-4 right-4 bg-card p-4 rounded-lg shadow-lg max-w-sm", children: [_jsx("p", { className: "text-sm mb-2", children: "Enable notifications for your favorite teams?" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", onClick: () => Notification.requestPermission(), children: "Enable" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => { }, children: "Not Now" })] })] }))] }));
}
