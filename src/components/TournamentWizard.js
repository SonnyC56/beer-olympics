import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Beer, Users, Calendar, Clock, MapPin, Gamepad2, ChevronRight, ChevronLeft, Sparkles, PartyPopper, Star, Medal, Crown, Target, Zap, Camera, DollarSign, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
const WIZARD_STEPS = [
    { id: 'basics', title: 'Basic Info', icon: Trophy, description: 'Tournament name, date & location' },
    { id: 'format', title: 'Format', icon: Gamepad2, description: 'Choose tournament structure' },
    { id: 'games', title: 'Games', icon: Target, description: 'Select your games' },
    { id: 'rules', title: 'Rules', icon: Info, description: 'Scoring & tiebreakers' },
    { id: 'theme', title: 'Theme', icon: Sparkles, description: 'Customize the vibe' },
    { id: 'features', title: 'Features', icon: Star, description: 'Additional options' },
];
const PRESET_GAMES = [
    { id: 'beer-pong', name: 'Beer Pong', icon: '🏓', popularity: 95 },
    { id: 'flip-cup', name: 'Flip Cup', icon: '🥤', popularity: 90 },
    { id: 'cornhole', name: 'Cornhole', icon: '🎯', popularity: 85 },
    { id: 'quarters', name: 'Quarters', icon: '🪙', popularity: 75 },
    { id: 'giant-jenga', name: 'Giant Jenga', icon: '🗼', popularity: 70 },
    { id: 'kan-jam', name: 'Kan Jam', icon: '🥏', popularity: 65 },
    { id: 'dizzy-bat', name: 'Dizzy Bat', icon: '🦇', popularity: 60 },
    { id: 'beer-relay', name: 'Beer Relay', icon: '🏃', popularity: 55 },
    { id: 'spikeball', name: 'Spikeball', icon: '🏐', popularity: 50 },
    { id: 'ladder-golf', name: 'Ladder Golf', icon: '🪜', popularity: 45 },
];
const TOURNAMENT_FORMATS = [
    {
        id: 'single_elimination',
        name: 'Single Elimination',
        icon: Trophy,
        description: 'Classic knockout - lose once and you\'re out!',
        bestFor: 'Quick, exciting tournaments',
        color: 'from-red-500 to-orange-500'
    },
    {
        id: 'double_elimination',
        name: 'Double Elimination',
        icon: Medal,
        description: 'Get a second chance through the losers bracket',
        bestFor: 'Fair, competitive play',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'round_robin',
        name: 'Round Robin',
        icon: Users,
        description: 'Everyone plays everyone',
        bestFor: 'Small groups, social events',
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 'group_stage',
        name: 'Group Stage + Playoffs',
        icon: Crown,
        description: 'Groups first, then knockout rounds',
        bestFor: 'Large tournaments',
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'free_for_all',
        name: 'Free For All',
        icon: Zap,
        description: 'Points-based chaos!',
        bestFor: 'Casual, fun events',
        color: 'from-yellow-500 to-amber-500'
    },
    {
        id: 'masters',
        name: 'Masters Series',
        icon: Star,
        description: 'Multiple tournaments, cumulative scoring',
        bestFor: 'Season-long competitions',
        color: 'from-indigo-500 to-purple-500'
    }
];
const THEME_OPTIONS = [
    { id: 'classic', name: 'Classic Beer Olympics', colors: ['#F59E0B', '#EAB308'], icon: Beer },
    { id: 'neon', name: 'Neon Party', colors: ['#FF6B6B', '#4ECDC4'], icon: Sparkles },
    { id: 'tropical', name: 'Tropical Paradise', colors: ['#10B981', '#3B82F6'], icon: PartyPopper },
    { id: 'retro', name: 'Retro Arcade', colors: ['#8B5CF6', '#EC4899'], icon: Gamepad2 },
    { id: 'elegant', name: 'Elegant Championship', colors: ['#1F2937', '#D97706'], icon: Crown },
    { id: 'custom', name: 'Custom Theme', colors: ['#000000', '#FFFFFF'], icon: Star },
];
export default function TournamentWizard({ onComplete, onCancel }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        format: 'single_elimination',
        maxTeams: 16,
        teamSize: 2,
        entryFee: 0,
        prizePool: 0,
        games: [],
        customGames: [],
        scoringMethod: 'points',
        tieBreaker: 'head-to-head',
        features: [],
        theme: 'classic',
        primaryColor: '#F59E0B',
        accentColor: '#EAB308',
        isPublic: true,
        requiresApproval: false,
        allowLateJoin: true,
        streamingEnabled: false,
        photoSharing: true,
    });
    const updateFormData = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };
    const handleNext = () => {
        // Validate current step
        if (currentStep === 0 && (!formData.name || !formData.date)) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
        else {
            onComplete(formData);
        }
    };
    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };
    const toggleGame = (gameId) => {
        setFormData(prev => ({
            ...prev,
            games: prev.games.includes(gameId)
                ? prev.games.filter(id => id !== gameId)
                : [...prev.games, gameId]
        }));
    };
    const toggleFeature = (feature) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };
    const renderStepContent = () => {
        switch (WIZARD_STEPS[currentStep].id) {
            case 'basics':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "font-party text-lg text-party-pink flex items-center gap-2", children: [_jsx(Trophy, { className: "w-5 h-5" }), "Tournament Name *"] }), _jsx(Input, { value: formData.name, onChange: (e) => updateFormData({ name: e.target.value }), placeholder: "Summer Beer Olympics 2024", className: "input-party text-lg" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "font-party text-lg text-party-cyan flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-5 h-5" }), "Description"] }), _jsx("textarea", { value: formData.description, onChange: (e) => updateFormData({ description: e.target.value }), placeholder: "The ultimate backyard championship! Join us for an epic day of games, laughs, and legendary moments...", className: "input-party w-full min-h-[100px] resize-none" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "font-party text-lg text-party-yellow flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5" }), "Date *"] }), _jsx(Input, { type: "date", value: formData.date, onChange: (e) => updateFormData({ date: e.target.value }), min: new Date().toISOString().split('T')[0], className: "input-party" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "font-party text-lg text-party-orange flex items-center gap-2", children: [_jsx(MapPin, { className: "w-5 h-5" }), "Location"] }), _jsx(Input, { value: formData.location, onChange: (e) => updateFormData({ location: e.target.value }), placeholder: "123 Party St, Fun City", className: "input-party" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "font-party text-lg text-party-green flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5" }), "Start Time"] }), _jsx(Input, { type: "time", value: formData.startTime, onChange: (e) => updateFormData({ startTime: e.target.value }), className: "input-party" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "font-party text-lg text-beer-amber flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5" }), "End Time"] }), _jsx(Input, { type: "time", value: formData.endTime, onChange: (e) => updateFormData({ endTime: e.target.value }), className: "input-party" })] })] })] }));
            case 'format':
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: TOURNAMENT_FORMATS.map((format) => (_jsxs(motion.button, { onClick: () => updateFormData({ format: format.id }), className: `relative overflow-hidden rounded-2xl p-6 text-left transition-all ${formData.format === format.id
                                    ? 'ring-4 ring-party-pink shadow-glow scale-105'
                                    : 'hover:scale-102'}`, whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: [_jsx("div", { className: `absolute inset-0 bg-gradient-to-br ${format.color} opacity-20` }), _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx(format.icon, { className: "w-8 h-8 text-white" }), _jsx("h3", { className: "font-beer text-xl text-white", children: format.name })] }), _jsx("p", { className: "text-white/90 mb-2", children: format.description }), _jsxs("p", { className: "text-sm text-white/70", children: ["Best for: ", format.bestFor] })] }), formData.format === format.id && (_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, className: "absolute top-2 right-2 w-8 h-8 bg-party-pink rounded-full flex items-center justify-center", children: _jsx(Star, { className: "w-5 h-5 text-white" }) }))] }, format.id))) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "font-party text-lg text-party-cyan flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5" }), "Max Teams"] }), _jsx(Input, { type: "number", min: "4", max: "128", value: formData.maxTeams, onChange: (e) => updateFormData({ maxTeams: parseInt(e.target.value) || 16 }), className: "input-party" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "font-party text-lg text-party-yellow flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5" }), "Team Size"] }), _jsx(Input, { type: "number", min: "1", max: "10", value: formData.teamSize, onChange: (e) => updateFormData({ teamSize: parseInt(e.target.value) || 2 }), className: "input-party" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "font-party text-lg text-party-orange flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-5 h-5" }), "Entry Fee"] }), _jsx(Input, { type: "number", min: "0", value: formData.entryFee, onChange: (e) => updateFormData({ entryFee: parseInt(e.target.value) || 0 }), placeholder: "0", className: "input-party" })] })] })] }));
            case 'games':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-beer text-2xl mb-4 text-party-pink", children: "Select Your Games" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: PRESET_GAMES.map((game) => (_jsx(motion.button, { onClick: () => toggleGame(game.id), className: `relative overflow-hidden rounded-2xl p-4 text-left transition-all ${formData.games.includes(game.id)
                                            ? 'bg-gradient-party shadow-glow'
                                            : 'bg-white/10 hover:bg-white/20'}`, whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-3xl", children: game.icon }), _jsxs("div", { children: [_jsx("h4", { className: "font-party text-lg text-white", children: game.name }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx("div", { className: "w-20 bg-white/20 rounded-full h-2", children: _jsx("div", { className: "bg-white h-2 rounded-full transition-all", style: { width: `${game.popularity}%` } }) }), _jsxs("span", { className: "text-xs text-white/70", children: [game.popularity, "% popular"] })] })] })] }), formData.games.includes(game.id) && (_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, children: _jsx(Star, { className: "w-6 h-6 text-white" }) }))] }) }, game.id))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-beer text-xl mb-3 text-party-cyan", children: "Add Custom Games" }), _jsxs("div", { className: "space-y-3", children: [_jsx(Input, { placeholder: "Enter custom game name and press Enter", className: "input-party", onKeyPress: (e) => {
                                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                    updateFormData({
                                                        customGames: [...formData.customGames, e.currentTarget.value.trim()]
                                                    });
                                                    e.currentTarget.value = '';
                                                }
                                            } }), formData.customGames.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: formData.customGames.map((game, index) => (_jsxs("span", { className: "bg-gradient-beer text-beer-dark px-3 py-1 rounded-full text-sm font-party flex items-center gap-2", children: [game, _jsx("button", { onClick: () => updateFormData({
                                                            customGames: formData.customGames.filter((_, i) => i !== index)
                                                        }), className: "hover:text-beer-amber", children: "\u00D7" })] }, index))) }))] })] })] }));
            case 'rules':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-beer text-2xl mb-4 text-party-pink", children: "Scoring Method" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
                                        { id: 'points', name: 'Points Based', icon: Star, description: 'Teams earn points for placement' },
                                        { id: 'wins', name: 'Win/Loss', icon: Trophy, description: 'Simple win/loss tracking' },
                                        { id: 'combined', name: 'Combined', icon: Medal, description: 'Mix of points and wins' }
                                    ].map((method) => (_jsxs(motion.button, { onClick: () => updateFormData({ scoringMethod: method.id }), className: `card-party p-4 text-center ${formData.scoringMethod === method.id ? 'ring-4 ring-party-pink' : ''}`, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: [_jsx(method.icon, { className: "w-8 h-8 mx-auto mb-2 text-party-pink" }), _jsx("h4", { className: "font-party text-lg", children: method.name }), _jsx("p", { className: "text-sm text-neutral-600 mt-1", children: method.description })] }, method.id))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-beer text-2xl mb-4 text-party-cyan", children: "Tiebreaker Rules" }), _jsxs("select", { value: formData.tieBreaker, onChange: (e) => updateFormData({ tieBreaker: e.target.value }), className: "input-party w-full", children: [_jsx("option", { value: "head-to-head", children: "Head-to-Head Result" }), _jsx("option", { value: "points-differential", children: "Points Differential" }), _jsx("option", { value: "total-points", children: "Total Points Scored" }), _jsx("option", { value: "sudden-death", children: "Sudden Death Round" }), _jsx("option", { value: "coin-flip", children: "Coin Flip (Classic!)" })] })] }), _jsxs("div", { className: "card-beer p-6", children: [_jsxs("h4", { className: "font-beer text-xl mb-3 flex items-center gap-2", children: [_jsx(Info, { className: "w-6 h-6" }), "Tournament Rules Preview"] }), _jsxs("ul", { className: "space-y-2 text-beer-dark", children: [_jsxs("li", { children: ["\u2022 Scoring: ", formData.scoringMethod === 'points' ? 'Points-based system' : formData.scoringMethod === 'wins' ? 'Win/Loss tracking' : 'Combined scoring'] }), _jsxs("li", { children: ["\u2022 Tiebreaker: ", formData.tieBreaker.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())] }), _jsxs("li", { children: ["\u2022 Teams: ", formData.maxTeams, " max, ", formData.teamSize, " players each"] }), _jsxs("li", { children: ["\u2022 Format: ", TOURNAMENT_FORMATS.find(f => f.id === formData.format)?.name] })] })] })] }));
            case 'theme':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-beer text-2xl mb-4 text-party-pink", children: "Choose Your Vibe" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: THEME_OPTIONS.map((theme) => (_jsxs(motion.button, { onClick: () => updateFormData({
                                            theme: theme.id,
                                            primaryColor: theme.colors[0],
                                            accentColor: theme.colors[1]
                                        }), className: `relative overflow-hidden rounded-2xl p-6 text-center ${formData.theme === theme.id ? 'ring-4 ring-party-pink scale-105' : ''}`, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: [_jsx("div", { className: "absolute inset-0 opacity-30", style: {
                                                    background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`
                                                } }), _jsxs("div", { className: "relative z-10", children: [_jsx(theme.icon, { className: "w-12 h-12 mx-auto mb-3 text-white" }), _jsx("h4", { className: "font-party text-lg text-white", children: theme.name })] })] }, theme.id))) })] }), formData.theme === 'custom' && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "font-party text-lg", children: "Primary Color" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "color", value: formData.primaryColor, onChange: (e) => updateFormData({ primaryColor: e.target.value }), className: "w-16 h-16 rounded-lg cursor-pointer" }), _jsx(Input, { value: formData.primaryColor, onChange: (e) => updateFormData({ primaryColor: e.target.value }), className: "input-party" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "font-party text-lg", children: "Accent Color" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "color", value: formData.accentColor, onChange: (e) => updateFormData({ accentColor: e.target.value }), className: "w-16 h-16 rounded-lg cursor-pointer" }), _jsx(Input, { value: formData.accentColor, onChange: (e) => updateFormData({ accentColor: e.target.value }), className: "input-party" })] })] })] })), _jsxs("div", { className: "card-party p-6", children: [_jsx("h4", { className: "font-beer text-xl mb-3", children: "Theme Preview" }), _jsx("div", { className: "h-32 rounded-xl shadow-glow flex items-center justify-center", style: {
                                        background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`
                                    }, children: _jsx("span", { className: "text-white font-beer text-3xl text-shadow-lg", children: formData.name || 'Your Tournament' }) })] })] }));
            case 'features':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-beer text-2xl mb-4 text-party-pink", children: "Tournament Features" }), _jsx("div", { className: "space-y-4", children: [
                                        {
                                            id: 'isPublic',
                                            label: 'Public Tournament',
                                            description: 'Anyone can view the leaderboard',
                                            icon: Users
                                        },
                                        {
                                            id: 'requiresApproval',
                                            label: 'Require Team Approval',
                                            description: 'You must approve teams before they can join',
                                            icon: Crown
                                        },
                                        {
                                            id: 'allowLateJoin',
                                            label: 'Allow Late Registration',
                                            description: 'Teams can join after tournament starts',
                                            icon: Clock
                                        },
                                        {
                                            id: 'streamingEnabled',
                                            label: 'Enable Live Streaming',
                                            description: 'Built-in streaming support for matches',
                                            icon: Camera
                                        },
                                        {
                                            id: 'photoSharing',
                                            label: 'Photo Sharing',
                                            description: 'Teams can upload and share photos',
                                            icon: Camera
                                        }
                                    ].map((feature) => (_jsxs("label", { className: "card-party p-4 flex items-center gap-4 cursor-pointer hover:scale-102 transition-transform", children: [_jsx("input", { type: "checkbox", checked: formData[feature.id], onChange: (e) => updateFormData({ [feature.id]: e.target.checked }), className: "w-5 h-5 rounded text-party-pink focus:ring-party-pink" }), _jsx(feature.icon, { className: "w-6 h-6 text-party-pink" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-party text-lg", children: feature.label }), _jsx("p", { className: "text-sm text-neutral-600", children: feature.description })] })] }, feature.id))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-beer text-2xl mb-4 text-party-cyan", children: "Special Features" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
                                        'Live Leaderboard Updates',
                                        'SMS Notifications',
                                        'QR Code Check-in',
                                        'Custom Trophies',
                                        'Sponsor Logos',
                                        'Prize Tracking',
                                        'Weather Updates',
                                        'Music Playlist'
                                    ].map((feature) => (_jsx("button", { onClick: () => toggleFeature(feature), className: `p-3 rounded-xl font-party transition-all ${formData.features.includes(feature)
                                            ? 'bg-gradient-party text-white'
                                            : 'bg-white/10 hover:bg-white/20 text-white'}`, children: feature }, feature))) })] })] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("div", { className: "mb-8", children: _jsx("div", { className: "flex items-center justify-between mb-4", children: WIZARD_STEPS.map((step, index) => (_jsxs("div", { className: "flex items-center", children: [_jsxs(motion.div, { className: `relative ${index <= currentStep ? 'text-white' : 'text-white/30'}`, animate: {
                                    scale: index === currentStep ? 1.2 : 1,
                                }, children: [_jsx("div", { className: `w-12 h-12 rounded-full flex items-center justify-center ${index < currentStep ? 'bg-gradient-party' :
                                            index === currentStep ? 'bg-gradient-party animate-pulse-glow' :
                                                'bg-white/10'}`, children: _jsx(step.icon, { className: "w-6 h-6" }) }), index === currentStep && (_jsx(motion.div, { className: "absolute -bottom-8 left-1/2 transform -translate-x-1/2", initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, children: _jsx("span", { className: "text-xs font-party whitespace-nowrap", children: step.title }) }))] }), index < WIZARD_STEPS.length - 1 && (_jsx("div", { className: `w-full h-1 mx-2 ${index < currentStep ? 'bg-gradient-party' : 'bg-white/10'}` }))] }, step.id))) }) }), _jsxs(Card, { className: "card-party mb-8", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "font-beer text-3xl flex items-center gap-3", children: [React.createElement(WIZARD_STEPS[currentStep].icon, { className: "w-8 h-8" }), WIZARD_STEPS[currentStep].title] }), _jsx(CardDescription, { className: "font-party text-lg", children: WIZARD_STEPS[currentStep].description })] }), _jsx(CardContent, { children: _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3 }, children: renderStepContent() }, currentStep) }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Button, { onClick: currentStep === 0 ? onCancel : handlePrevious, variant: "outline", className: "border-white/30 text-white hover:bg-white/10", children: [_jsx(ChevronLeft, { className: "w-5 h-5 mr-2" }), currentStep === 0 ? 'Cancel' : 'Previous'] }), _jsx("div", { className: "flex items-center gap-2", children: WIZARD_STEPS.map((_, index) => (_jsx(motion.div, { className: `w-2 h-2 rounded-full ${index === currentStep ? 'bg-white w-8' : 'bg-white/30'}`, animate: {
                                width: index === currentStep ? 32 : 8,
                            } }, index))) }), _jsx(Button, { onClick: handleNext, className: "btn-party", children: currentStep === WIZARD_STEPS.length - 1 ? (_jsxs(_Fragment, { children: ["Create Tournament", _jsx(Trophy, { className: "w-5 h-5 ml-2" })] })) : (_jsxs(_Fragment, { children: ["Next", _jsx(ChevronRight, { className: "w-5 h-5 ml-2" })] })) })] })] }));
}
