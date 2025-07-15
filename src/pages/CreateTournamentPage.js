import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Beer, Calendar, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/material/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/material/card';
import { TextField } from '@/components/ui/material/text-field';
import { Select } from '@/components/ui/material/select';
import { useAuth } from '@/context/auth';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { MegaTournamentCreator } from '@/components/MegaTournamentCreator';
export function CreateTournamentPage() {
    const navigate = useNavigate();
    const { user, signIn } = useAuth();
    const [tournamentName, setTournamentName] = useState('');
    const [tournamentDate, setTournamentDate] = useState('');
    const [tournamentFormat, setTournamentFormat] = useState('single_elimination');
    const [maxTeams, setMaxTeams] = useState(8);
    const [isCreating, setIsCreating] = useState(false);
    const [isMegaTournament, setIsMegaTournament] = useState(false);
    const createTournamentMutation = trpc.tournament.create.useMutation({
        onSuccess: (data) => {
            toast.success('Tournament created successfully!');
            navigate(`/control/${data.slug}`);
        },
        onError: (error) => {
            toast.error(`Failed to create tournament: ${error.message}`);
        },
        onSettled: () => {
            setIsCreating(false);
        },
    });
    const handleCreate = async () => {
        if (!user) {
            try {
                await signIn();
            }
            catch {
                toast.error('Please sign in to create a tournament');
                return;
            }
        }
        if (!tournamentName.trim()) {
            toast.error('Please enter a tournament name');
            return;
        }
        if (!tournamentDate) {
            toast.error('Please select a tournament date');
            return;
        }
        setIsCreating(true);
        createTournamentMutation.mutate({
            name: tournamentName.trim(),
            date: tournamentDate,
            format: tournamentFormat,
            maxTeams: maxTeams,
            settings: {
                allowTies: false,
                pointsPerWin: 3,
                pointsPerLoss: 0,
                tiebreakMethod: 'head2head',
                autoAdvance: true,
                bronzeMatch: false,
                seedingMethod: 'random'
            }
        });
    };
    if (!user) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 flex items-center justify-center p-4", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "max-w-md w-full", children: _jsxs(Card, { variant: "elevated", elevation: 3, className: "material-surface-container-highest material-motion-standard", children: [_jsxs(CardHeader, { className: "text-center space-y-4", children: [_jsx("div", { className: "mx-auto w-16 h-16 material-primary-container rounded-full flex items-center justify-center material-motion-standard-decelerate", children: _jsx(Trophy, { className: "w-8 h-8 material-on-primary-container" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "material-headline-medium", children: "Sign In Required" }), _jsx(CardDescription, { className: "material-body-large", children: "You need to sign in to create a tournament" })] })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx(Button, { onClick: () => signIn(), variant: "filled", size: "large", fullWidth: true, leadingIcon: "login", children: "Sign In with Google" }), _jsx(Button, { variant: "outlined", onClick: () => navigate('/'), size: "large", fullWidth: true, leadingIcon: "arrow_back", children: "Back to Home" })] })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20", children: [_jsx("header", { className: "px-6 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto flex items-center justify-between", children: [_jsx(Button, { variant: "text", onClick: () => navigate('/'), leadingIcon: "arrow_back", className: "material-on-surface", children: "Back to Home" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Beer, { className: "w-6 h-6 text-amber-500" }), _jsx("span", { className: "text-lg font-bold text-white", children: "Beer Olympics" })] })] }) }), _jsx("div", { className: "flex items-center justify-center px-6 pb-32", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "max-w-2xl w-full", children: _jsxs(Card, { variant: "elevated", elevation: 4, className: "material-surface-container-highest material-motion-emphasized", children: [_jsxs(CardHeader, { className: "text-center space-y-6 pb-8", children: [_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: "spring", bounce: 0.5, delay: 0.2 }, className: "mx-auto w-20 h-20 material-primary-container rounded-full flex items-center justify-center", children: _jsx(Trophy, { className: "w-10 h-10 material-on-primary-container" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "material-display-small", children: "Create Tournament" }), _jsx(CardDescription, { className: "material-title-large max-w-md mx-auto", children: "Set up your Beer Olympics event and get ready for epic competition" }), _jsxs("div", { className: "flex justify-center gap-2 mt-6", children: [_jsx(Button, { variant: !isMegaTournament ? "filled" : "outlined", onClick: () => setIsMegaTournament(false), leadingIcon: "emoji_events", children: "Single Tournament" }), _jsx(Button, { variant: isMegaTournament ? "filled" : "outlined", onClick: () => setIsMegaTournament(true), leadingIcon: "auto_awesome", children: "Mega Tournament" })] })] })] }), _jsx(CardContent, { className: "space-y-8 px-8 pb-8", children: isMegaTournament ? (_jsx("div", { className: "bg-transparent", children: _jsx(MegaTournamentCreator, {}) })) : (_jsxs(_Fragment, { children: [_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "space-y-3", children: [_jsxs("label", { className: "text-sm font-medium text-gray-300 flex items-center gap-2", children: [_jsx(Beer, { className: "w-4 h-4 text-amber-400" }), "Tournament Name"] }), _jsx(TextField, { label: "Tournament Name", placeholder: "e.g., Summer Beer Olympics 2024", value: tournamentName, onChange: (e) => setTournamentName(e.target.value), fullWidth: true, variant: "outlined", leadingIcon: "local_activity" })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, className: "space-y-3", children: [_jsxs("label", { className: "text-sm font-medium text-gray-300 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-amber-400" }), "Tournament Date"] }), _jsx(TextField, { type: "date", label: "Tournament Date", value: tournamentDate, onChange: (e) => setTournamentDate(e.target.value), min: new Date().toISOString().split('T')[0], fullWidth: true, variant: "outlined", leadingIcon: "event" })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.45 }, className: "space-y-3", children: [_jsxs("label", { className: "text-sm font-medium text-gray-300 flex items-center gap-2", children: [_jsx(Trophy, { className: "w-4 h-4 text-amber-400" }), "Tournament Format"] }), _jsx(Select, { label: "Tournament Format", value: tournamentFormat, onValueChange: (value) => setTournamentFormat(value), fullWidth: true, variant: "outlined", options: [
                                                        { value: 'single_elimination', label: 'Single Elimination' },
                                                        { value: 'double_elimination', label: 'Double Elimination' },
                                                        { value: 'round_robin', label: 'Round Robin' },
                                                        { value: 'group_stage', label: 'Group Stage' },
                                                        { value: 'free_for_all', label: 'Free For All' },
                                                        { value: 'masters', label: 'Masters' }
                                                    ] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.47 }, className: "space-y-3", children: [_jsxs("label", { className: "text-sm font-medium text-gray-300 flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-amber-400" }), "Maximum Teams"] }), _jsx(TextField, { type: "number", label: "Maximum Teams", min: "2", max: "128", value: maxTeams, onChange: (e) => setMaxTeams(parseInt(e.target.value) || 8), fullWidth: true, variant: "outlined", leadingIcon: "groups" })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5 }, className: "material-surface-container p-6 rounded-xl border material-outline-variant", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx(Users, { className: "w-5 h-5 material-primary" }), _jsxs("span", { className: "material-title-medium", children: ["Signed in as: ", user.name] })] }), _jsx("p", { className: "material-body-medium material-on-surface-variant", children: "You'll be the tournament organizer and can manage teams, scoring, and settings." })] }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6 }, className: "pt-4", children: _jsx(Button, { onClick: handleCreate, disabled: isCreating, variant: "filled", size: "large", fullWidth: true, leadingIcon: isCreating ? "" : "emoji_events", className: "material-motion-standard", children: isCreating ? (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }), "Creating Tournament..."] })) : ("Create Tournament") }) })] })) })] }) }) })] }));
}
