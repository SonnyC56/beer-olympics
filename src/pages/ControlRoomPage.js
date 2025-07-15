import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Users, Calendar, Trophy, Lock, Unlock, Copy, ExternalLink, ArrowLeft, Beer, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { trpc } from '@/utils/trpc';
export function ControlRoomPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isClosing, setIsClosing] = useState(false);
    // Use tRPC hooks
    const { data: tournament, refetch: refetchTournament } = trpc.tournament.getBySlug.useQuery({ slug: slug }, { enabled: !!slug });
    const { data: teams = [] } = trpc.tournament.listTeams.useQuery({ tournamentId: slug }, { enabled: !!slug });
    const setOpenMutation = trpc.tournament.setOpen.useMutation();
    const handleToggleRegistration = async () => {
        if (!tournament || !slug)
            return;
        setIsClosing(true);
        try {
            await setOpenMutation.mutateAsync({
                slug,
                isOpen: !tournament.isOpen,
            });
            toast.success(tournament.isOpen ? 'Registration closed' : 'Registration opened');
            refetchTournament();
        }
        catch (error) {
            toast.error('Failed to update registration status');
        }
        finally {
            setIsClosing(false);
        }
    };
    const handleGenerateSchedule = () => {
        toast.info('Schedule generation coming soon!');
    };
    const handleGenerateHighlight = () => {
        toast.info('Highlight reel generation coming soon!');
    };
    if (!tournament) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-pulse text-xl", children: "Loading control room..." }) }));
    }
    // Check if user is owner
    if (user?.id !== tournament.ownerId) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("p", { className: "text-xl text-center", children: "Access denied" }), _jsx("p", { className: "text-gray-400 text-center mt-2", children: "Only the tournament owner can access this page" }), _jsx(Button, { onClick: () => navigate(`/dashboard/${slug}`), className: "w-full mt-4", children: "Back to Dashboard" })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20", children: [_jsx("header", { className: "px-6 py-8 border-b border-white/10", children: _jsx("div", { className: "max-w-7xl mx-auto flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", onClick: () => navigate('/'), className: "text-white hover:bg-white/10 border border-white/20", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Home"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Beer, { className: "w-6 h-6 text-amber-500" }), _jsx("span", { className: "text-lg font-bold text-white", children: "Beer Olympics" })] })] }) }) }), _jsxs("div", { className: "px-6 py-8 max-w-7xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "mb-12 text-center", children: [_jsx("div", { className: "flex items-center justify-center gap-3 mb-4", children: _jsx("div", { className: "p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl", children: _jsx(Crown, { className: "w-8 h-8 text-white" }) }) }), _jsx("h1", { className: "text-5xl font-bold tracking-tight text-white mb-3", children: "Control Room" }), _jsx("p", { className: "text-2xl text-amber-400 font-medium", children: tournament.name }), _jsxs("p", { className: "text-gray-400 mt-2", children: ["Tournament Date: ", new Date(tournament.date).toLocaleDateString()] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "grid lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl", children: [_jsxs(CardHeader, { className: "pb-6", children: [_jsxs(CardTitle, { className: "flex items-center gap-3 text-white text-2xl", children: [_jsx(Users, { className: "w-6 h-6 text-amber-400" }), "Registered Teams"] }), _jsxs(CardDescription, { className: "text-gray-300 text-lg", children: [teams.length, " teams ready to compete"] })] }), _jsx(CardContent, { children: teams.length > 0 ? (_jsx("div", { className: "space-y-4", children: teams.map((team, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.1 * index }, className: "flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-6 h-6 rounded-full ring-2 ring-white/20 shadow-lg", style: {
                                                                        backgroundColor: team.colorHex,
                                                                        boxShadow: `0 0 20px ${team.colorHex}40`
                                                                    } }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold text-white text-lg", children: team.name }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx("span", { className: "text-2xl", children: team.flagCode }), _jsxs("span", { className: "text-sm text-gray-400", children: [team.memberIds.length, " member", team.memberIds.length !== 1 ? 's' : ''] })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm text-gray-400", children: ["Team #", index + 1] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Created ", new Date(team.createdAt).toLocaleDateString()] })] })] }, team.id))) })) : (_jsxs("div", { className: "text-center py-16", children: [_jsx(Users, { className: "w-16 h-16 text-gray-600 mx-auto mb-4" }), _jsx("p", { className: "text-xl text-gray-400 mb-2", children: "No teams registered yet" }), _jsx("p", { className: "text-gray-500", children: "Share the join link to get teams signed up!" })] })) })] }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl", children: [_jsxs(CardHeader, { className: "pb-6", children: [_jsxs(CardTitle, { className: "flex items-center gap-3 text-white text-xl", children: [_jsx(Settings, { className: "w-5 h-5 text-amber-400" }), "Registration Control"] }), _jsx(CardDescription, { className: "text-gray-300", children: "Control who can join the tournament" })] }), _jsx(CardContent, { children: _jsx(Button, { onClick: handleToggleRegistration, disabled: isClosing, variant: tournament.isOpen ? 'danger' : 'success', className: "w-full h-12 font-semibold", children: tournament.isOpen ? (_jsxs(_Fragment, { children: [_jsx(Lock, { className: "w-4 h-4 mr-2" }), "Close Registration"] })) : (_jsxs(_Fragment, { children: [_jsx(Unlock, { className: "w-4 h-4 mr-2" }), "Open Registration"] })) }) })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl", children: [_jsxs(CardHeader, { className: "pb-6", children: [_jsxs(CardTitle, { className: "flex items-center gap-3 text-white text-xl", children: [_jsx(Trophy, { className: "w-5 h-5 text-amber-400" }), "Tournament Actions"] }), _jsx(CardDescription, { className: "text-gray-300", children: "Generate schedules and highlights" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: handleGenerateSchedule, variant: "outline", className: "w-full h-12 border-white/30 text-white hover:bg-white/10 hover:border-amber-400/50 transition-all duration-200", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2" }), "Generate Schedule"] }), _jsxs(Button, { onClick: handleGenerateHighlight, variant: "outline", className: "w-full h-12 border-white/30 text-white hover:bg-white/10 hover:border-amber-400/50 transition-all duration-200", children: [_jsx(Trophy, { className: "w-4 h-4 mr-2" }), "Generate Highlight Reel"] })] })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl", children: [_jsxs(CardHeader, { className: "pb-6", children: [_jsxs(CardTitle, { className: "flex items-center gap-3 text-white text-xl", children: [_jsx(ExternalLink, { className: "w-5 h-5 text-amber-400" }), "Quick Navigation"] }), _jsx(CardDescription, { className: "text-gray-300", children: "Access tournament pages and tools" })] }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs(Button, { variant: "ghost", className: "w-full justify-start h-11 text-white hover:bg-white/10 hover:text-amber-400 transition-all duration-200", onClick: () => navigate(`/leaderboard/${slug}`), children: [_jsx(Trophy, { className: "w-4 h-4 mr-3" }), "View Leaderboard"] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start h-11 text-white hover:bg-white/10 hover:text-amber-400 transition-all duration-200", onClick: () => navigate(`/display/${slug}`), children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-3" }), "TV Display Mode"] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start h-11 text-white hover:bg-white/10 hover:text-amber-400 transition-all duration-200", onClick: () => navigate(`/rsvp-management/${slug}`), children: [_jsx(Users, { className: "w-4 h-4 mr-3" }), "Manage RSVPs"] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start h-11 text-white hover:bg-white/10 hover:text-amber-400 transition-all duration-200", onClick: () => {
                                                            const url = `${window.location.origin}/join/${slug}`;
                                                            navigator.clipboard.writeText(url);
                                                            toast.success('Join link copied!');
                                                        }, children: [_jsx(Copy, { className: "w-4 h-4 mr-3" }), "Copy Join Link"] })] })] })] })] })] })] }));
}
