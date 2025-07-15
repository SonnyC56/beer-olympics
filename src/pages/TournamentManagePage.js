import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Settings, Users, Calendar, Gamepad2, BarChart3, MessageSquare, ArrowLeft, Plus, Edit, Pause, Share2, QrCode, Download, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import TournamentWizard from '@/components/TournamentWizard';
import GameConfigPanel from '@/components/GameConfigPanel';
import BracketView from '@/components/BracketView';
import LiveLeaderboard from '@/components/LiveLeaderboard';
import SocialFeed from '@/components/SocialFeed';
export default function TournamentManagePage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showWizard, setShowWizard] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    // Fetch tournament data
    const { data: tournament, isLoading: tournamentLoading } = trpc.tournament.getBySlug.useQuery({ slug: slug }, { enabled: !!slug });
    const { data: teams = [] } = trpc.team.list.useQuery({ slug: slug }, { enabled: !!slug });
    const { data: matches = [] } = trpc.match.list.useQuery({ slug: slug }, { enabled: !!slug });
    const { data: leaderboard = [] } = trpc.leaderboard.list.useQuery({ slug: slug }, { enabled: !!slug });
    // Mock data for demo
    const mockStats = leaderboard.map((team) => ({
        ...team,
        gamesPlayed: Math.floor(Math.random() * 5) + 1,
        wins: Math.floor(Math.random() * 5),
        losses: Math.floor(Math.random() * 3),
        pointsPerGame: team.totalPoints / (Math.floor(Math.random() * 5) + 1),
        recentForm: ['W', 'L', 'W', 'W', 'L'].slice(0, Math.floor(Math.random() * 5) + 1),
        gameBreakdown: [
            { gameId: '1', gameName: 'Beer Pong', points: 100, rank: 1 },
            { gameId: '2', gameName: 'Flip Cup', points: 75, rank: 2 },
            { gameId: '3', gameName: 'Cornhole', points: 50, rank: 3 }
        ]
    }));
    const mockPosts = [
        {
            id: '1',
            type: 'result',
            author: {
                id: '1',
                name: 'Tournament Bot',
                isOrganizer: true
            },
            content: 'Epic match just finished!',
            gameData: {
                gameId: '1',
                gameName: 'Beer Pong',
                team1: { name: 'Team Alpha', score: 10, color: '#FF6B6B' },
                team2: { name: 'Team Beta', score: 8, color: '#4ECDC4' },
                winner: 'Team Alpha'
            },
            timestamp: new Date().toISOString(),
            likes: 15,
            comments: [],
            hasLiked: false
        },
        {
            id: '2',
            type: 'achievement',
            author: {
                id: '2',
                name: 'Team Alpha',
                teamId: '1',
                teamName: 'Team Alpha',
                teamColor: '#FF6B6B'
            },
            content: 'What a comeback! Down 5 cups and came back to win!',
            achievement: {
                type: 'comeback',
                title: 'Comeback Kings',
                description: 'Won after being down by 5+ points',
                icon: '🔥'
            },
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            likes: 32,
            comments: [
                {
                    id: '1',
                    author: { id: '3', name: 'Team Beta', avatar: '🍺' },
                    content: 'GG! That was insane!',
                    timestamp: new Date(Date.now() - 1800000).toISOString()
                }
            ],
            hasLiked: true
        }
    ];
    const tabs = [
        { id: 'overview', name: 'Overview', icon: Trophy },
        { id: 'bracket', name: 'Bracket', icon: Gamepad2 },
        { id: 'leaderboard', name: 'Leaderboard', icon: BarChart3 },
        { id: 'games', name: 'Games', icon: Settings },
        { id: 'teams', name: 'Teams', icon: Users },
        { id: 'feed', name: 'Social Feed', icon: MessageSquare },
        { id: 'settings', name: 'Settings', icon: Settings }
    ];
    const _handleStartTournament = () => {
        toast.success('Tournament started! Let the games begin! 🎉');
    };
    const handlePauseTournament = () => {
        toast.info('Tournament paused');
    };
    const handleShareTournament = () => {
        setShowShareModal(true);
        // Copy link to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Tournament link copied to clipboard!');
    };
    const handleExportData = () => {
        // Export tournament data as JSON
        const data = {
            tournament,
            teams,
            matches,
            leaderboard,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tournament?.name || 'tournament'}-data.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Tournament data exported!');
    };
    if (tournamentLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Trophy, { className: "w-12 h-12 text-party-yellow animate-bounce mx-auto mb-4" }), _jsx("p", { className: "text-xl font-party text-white animate-pulse", children: "Loading tournament..." })] }) }));
    }
    if (!tournament) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Card, { className: "card-party max-w-md", children: _jsxs(CardContent, { className: "text-center py-8", children: [_jsx(Trophy, { className: "w-12 h-12 text-white/30 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-beer text-white mb-2", children: "Tournament Not Found" }), _jsx("p", { className: "text-white/70 mb-6", children: "This tournament doesn't exist or has been removed." }), _jsx(Button, { onClick: () => navigate('/'), className: "btn-party", children: "Back to Home" })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen p-4 max-w-7xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs(Button, { onClick: () => navigate('/'), variant: "ghost", className: "text-white hover:bg-white/10", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: handleShareTournament, variant: "outline", className: "border-white/30 text-white hover:bg-white/10", children: [_jsx(Share2, { className: "w-4 h-4 mr-2" }), "Share"] }), _jsxs(Button, { onClick: handleExportData, variant: "outline", className: "border-white/30 text-white hover:bg-white/10", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export"] }), _jsx(Button, { onClick: () => toast.info('Notifications coming soon!'), variant: "outline", size: "icon", className: "border-white/30 text-white hover:bg-white/10", children: _jsx(Bell, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "font-beer text-5xl md:text-6xl text-white mb-2 animate-bounce-in", children: tournament.name }), _jsxs("div", { className: "flex items-center justify-center gap-4 text-white/70", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), new Date(tournament.date).toLocaleDateString()] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4" }), teams.length, " Teams"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Trophy, { className: "w-4 h-4" }), tournament.format.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())] })] })] })] }), _jsx("div", { className: "mb-6 overflow-x-auto", children: _jsx("div", { className: "flex gap-2 min-w-max pb-2", children: tabs.map((tab) => (_jsxs(motion.button, { onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 px-4 py-2 rounded-xl font-party transition-all ${activeTab === tab.id
                            ? 'bg-gradient-party text-white shadow-glow'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: [_jsx(tab.icon, { className: "w-4 h-4" }), tab.name] }, tab.id))) }) }), _jsx(AnimatePresence, { mode: "wait", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.3 }, children: [activeTab === 'overview' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "card-party lg:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "font-beer text-2xl", children: "Tournament Status" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-white/10 rounded-xl", children: [_jsxs("div", { children: [_jsx("p", { className: "font-party text-lg text-white", children: "Status" }), _jsx("p", { className: "text-2xl font-bold text-green-400", children: "Active" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: handlePauseTournament, variant: "outline", size: "sm", children: [_jsx(Pause, { className: "w-4 h-4 mr-2" }), "Pause"] }), _jsxs(Button, { onClick: () => navigate(`/control/${slug}`), className: "btn-party", size: "sm", children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Control Room"] })] })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                                                            { label: 'Teams', value: teams.length, max: tournament.maxTeams, icon: Users },
                                                            { label: 'Matches Played', value: matches.filter((m) => m.status === 'completed').length, max: matches.length, icon: Gamepad2 },
                                                            { label: 'Total Points', value: leaderboard.reduce((sum, t) => sum + t.totalPoints, 0), icon: Trophy },
                                                            { label: 'Active Players', value: teams.length * 2, icon: Users }
                                                        ].map((stat, index) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.1 }, className: "bg-white/10 rounded-xl p-4 text-center", children: [_jsx(stat.icon, { className: "w-6 h-6 text-party-cyan mx-auto mb-2" }), _jsxs("p", { className: "text-2xl font-bold text-white", children: [stat.value, stat.max && _jsxs("span", { className: "text-sm text-white/50", children: ["/", stat.max] })] }), _jsx("p", { className: "text-xs text-white/70 font-party", children: stat.label })] }, stat.label))) })] }) })] }), _jsxs(Card, { className: "card-party", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "font-beer text-2xl", children: "Quick Actions" }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs(Button, { onClick: () => navigate(`/leaderboard/${slug}`), className: "w-full btn-party", children: [_jsx(BarChart3, { className: "w-4 h-4 mr-2" }), "Public Leaderboard"] }), _jsxs(Button, { onClick: () => {
                                                        const qrUrl = `${window.location.origin}/join/${slug}`;
                                                        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrUrl}`, '_blank');
                                                    }, variant: "outline", className: "w-full border-white/30 text-white hover:bg-white/10", children: [_jsx(QrCode, { className: "w-4 h-4 mr-2" }), "QR Code"] }), _jsxs(Button, { onClick: () => toast.info('Team registration link copied!'), variant: "outline", className: "w-full border-white/30 text-white hover:bg-white/10", children: [_jsx(Users, { className: "w-4 h-4 mr-2" }), "Invite Teams"] }), _jsxs(Button, { onClick: () => setActiveTab('feed'), variant: "outline", className: "w-full border-white/30 text-white hover:bg-white/10", children: [_jsx(MessageSquare, { className: "w-4 h-4 mr-2" }), "Make Announcement"] })] })] }), _jsxs(Card, { className: "card-party lg:col-span-3", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "font-beer text-2xl", children: "Recent Activity" }) }), _jsx(CardContent, { children: _jsx(SocialFeed, { posts: mockPosts.slice(0, 3), allowPosting: false, onLike: (id) => console.log('Liked:', id), onComment: (id, comment) => console.log('Comment:', id, comment), onShare: (id) => console.log('Shared:', id) }) })] })] })), activeTab === 'bracket' && (_jsx(BracketView, { tournamentName: tournament.name, format: tournament.format, matches: matches.map((m) => ({
                                ...m,
                                team1: teams.find((t) => t.id === m.team1Id),
                                team2: teams.find((t) => t.id === m.team2Id)
                            })), teams: teams, onMatchClick: (match) => console.log('Match clicked:', match), onRefresh: () => window.location.reload() })), activeTab === 'leaderboard' && (_jsx(LiveLeaderboard, { stats: mockStats, tournamentName: tournament.name, onTeamClick: (teamId) => console.log('Team clicked:', teamId), showAnimations: true })), activeTab === 'games' && (_jsx(GameConfigPanel, { games: ['beer-pong', 'flip-cup', 'cornhole'], onSave: (configs) => {
                                console.log('Game configs saved:', configs);
                                toast.success('Game configurations saved!');
                            } })), activeTab === 'teams' && (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { className: "card-party", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "font-beer text-2xl", children: "Teams Management" }), _jsxs(Button, { onClick: () => toast.info('Add team feature coming soon!'), className: "btn-party", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Team"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: teams.map((team, index) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.05 }, className: "bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors cursor-pointer", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full", style: { backgroundColor: team.colorHex } }), _jsxs("div", { children: [_jsx("h3", { className: "font-party text-lg text-white", children: team.name }), _jsx("p", { className: "text-sm text-white/70", children: team.flagCode })] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-white/70", children: "Players: 2" }), _jsxs(Button, { variant: "ghost", size: "sm", className: "text-white hover:bg-white/20", children: [_jsx(Edit, { className: "w-3 h-3 mr-1" }), "Edit"] })] })] }, team.id))) }) })] }) })), activeTab === 'feed' && (_jsx(SocialFeed, { posts: mockPosts, currentUserId: "organizer", allowPosting: true, onPostCreate: (post) => {
                                console.log('New post:', post);
                                toast.success('Post created!');
                            }, onLike: (id) => console.log('Liked:', id), onComment: (id, comment) => console.log('Comment:', id, comment), onShare: (id) => console.log('Shared:', id) })), activeTab === 'settings' && (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { className: "card-party", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "font-beer text-2xl", children: "Tournament Settings" }), _jsx(CardDescription, { className: "text-white/70", children: "Manage your tournament configuration" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-white/10 rounded-xl", children: [_jsx("h3", { className: "font-party text-lg text-white mb-2", children: "Edit Tournament" }), _jsx("p", { className: "text-sm text-white/70 mb-4", children: "Update tournament details, format, and rules" }), _jsxs(Button, { onClick: () => setShowWizard(true), className: "btn-party", children: [_jsx(Edit, { className: "w-4 h-4 mr-2" }), "Edit Settings"] })] }), _jsxs("div", { className: "p-4 bg-red-500/10 rounded-xl border border-red-500/20", children: [_jsx("h3", { className: "font-party text-lg text-red-400 mb-2", children: "Danger Zone" }), _jsx("p", { className: "text-sm text-white/70 mb-4", children: "These actions cannot be undone" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", className: "border-red-500/30 text-red-400 hover:bg-red-500/10", onClick: () => toast.error('Tournament reset is not available in demo'), children: "Reset Tournament" }), _jsx(Button, { variant: "outline", className: "border-red-500/30 text-red-400 hover:bg-red-500/10", onClick: () => toast.error('Tournament deletion is not available in demo'), children: "Delete Tournament" })] })] })] }) })] }) }))] }, activeTab) }), _jsx(AnimatePresence, { children: showWizard && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: () => setShowWizard(false), children: _jsx(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-neutral-900 rounded-3xl p-6 max-h-[90vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: _jsx(TournamentWizard, { onComplete: (data) => {
                                console.log('Tournament updated:', data);
                                setShowWizard(false);
                                toast.success('Tournament settings updated!');
                            }, onCancel: () => setShowWizard(false) }) }) })) })] }));
}
