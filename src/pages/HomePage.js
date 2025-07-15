import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/material/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/material/card';
import { TextField } from '@/components/ui/material/text-field';
import { FAB } from '@/components/ui/material/fab';
export function HomePage() {
    const [tournamentCode, setTournamentCode] = useState('');
    const navigate = useNavigate();
    const handleJoinTournament = () => {
        if (tournamentCode) {
            navigate(`/join/${tournamentCode}`);
        }
    };
    const handleCreateTournament = () => {
        navigate('/create');
    };
    const handleStyleGuide = () => {
        navigate('/style-guide');
    };
    const handleRSVP = () => {
        navigate('/rsvp');
    };
    const handleDemoTournament = () => {
        navigate('/manage/demo-tournament');
    };
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center p-4", children: [_jsxs("header", { className: "text-center mb-12 material-header-animation", children: [_jsx("h1", { className: "text-7xl font-party font-bold text-neutral-0 text-shadow-lg material-display-large", children: "Beer Olympics" }), _jsx("p", { className: "text-2xl text-neutral-0/90 mt-2 text-shadow material-title-large", children: "Transform your backyard games into professional tournaments with real-time scoring and leaderboards" })] }), _jsxs("main", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full", children: [_jsxs(Card, { variant: "elevated", elevation: 2, className: "material-motion-standard-decelerate", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Join Tournament" }), _jsx(CardDescription, { children: "Enter your tournament code to join the party!" })] }), _jsxs(CardContent, { className: "flex flex-col gap-4", children: [_jsx(TextField, { label: "Tournament Code", placeholder: "Enter tournament code", value: tournamentCode, onChange: (e) => setTournamentCode(e.target.value), fullWidth: true, leadingIcon: "sports_esports" }), _jsx(Button, { onClick: handleJoinTournament, variant: "filled", size: "large", fullWidth: true, leadingIcon: "login", children: "Join Tournament" })] })] }), _jsxs(Card, { variant: "elevated", elevation: 2, className: "material-motion-standard-decelerate", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Create Tournament" }), _jsx(CardDescription, { children: "Host your own epic Beer Olympics event!" })] }), _jsx(CardContent, { children: _jsx(Button, { onClick: handleCreateTournament, variant: "tonal", size: "large", fullWidth: true, leadingIcon: "add_circle", children: "Create Tournament" }) })] })] }), _jsxs("section", { className: "mt-12 max-w-4xl w-full", children: [_jsx("h2", { className: "text-3xl font-party font-bold text-neutral-0 text-center mb-6", children: "\uD83C\uDFA8 Test Our New Features! \uD83C\uDF89" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { variant: "filled", className: "material-surface-container-high material-motion-standard", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\uD83C\uDFA8 STYLE GUIDE" }), _jsx(CardDescription, { children: "Explore our fun & playful design system!" })] }), _jsx(CardContent, { children: _jsx(Button, { onClick: handleStyleGuide, variant: "elevated", fullWidth: true, leadingIcon: "palette", children: "View Style Guide" }) })] }), _jsxs(Card, { variant: "filled", className: "material-surface-container-high material-motion-standard", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\uD83D\uDCCB RSVP PAGE" }), _jsx(CardDescription, { children: "Try our fully functional RSVP form with preferred partner field! All data saves locally." })] }), _jsx(CardContent, { children: _jsx(Button, { onClick: handleRSVP, variant: "elevated", fullWidth: true, leadingIcon: "event_available", children: "Test RSVP Form" }) })] }), _jsxs(Card, { variant: "elevated", elevation: 3, className: "lg:col-span-2 material-motion-emphasized", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: ["\uD83C\uDFC6 TOURNAMENT MANAGEMENT", _jsx("span", { className: "material-badge-new px-3 py-1 rounded-full text-xs font-medium", children: "NEW!" })] }), _jsx(CardDescription, { children: "Experience our brand new tournament management system with live leaderboards, bracket visualization, game configuration, and social features!" })] }), _jsx(CardContent, { children: _jsx(Button, { onClick: handleDemoTournament, variant: "filled", size: "large", fullWidth: true, leadingIcon: "emoji_events", children: "View Demo Tournament" }) })] })] })] }), _jsx(FAB, { icon: "add", label: "Create", onClick: handleCreateTournament, variant: "primary", size: "large", position: "bottom-right" })] }));
}
