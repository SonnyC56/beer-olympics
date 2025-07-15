import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Timer, Users, Trophy, Target, Info, Plus, Trash2, Copy, Save, RotateCcw, Star, Medal, Crown, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
const DEFAULT_GAME_CONFIGS = {
    'beer-pong': {
        name: 'Beer Pong',
        icon: '🏓',
        description: 'Classic cup elimination game',
        minPlayers: 2,
        maxPlayers: 4,
        duration: 15,
        pointsForWin: 100,
        pointsForSecond: 50,
        pointsForThird: 25,
        rules: [
            'Standard 10-cup triangle formation',
            'Elbow rule enforced',
            'Re-racks at 6, 3, and 1 cups',
            'Redemption shots allowed'
        ],
        equipment: ['Table', 'Cups', 'Ping pong balls', 'Beer'],
        bonusPoints: [
            { id: '1', name: 'Perfect Game', points: 50, description: 'Win without losing a cup' },
            { id: '2', name: 'Trick Shot', points: 10, description: 'Score with a bounce or behind-the-back' }
        ]
    },
    'flip-cup': {
        name: 'Flip Cup',
        icon: '🥤',
        description: 'Fast-paced team relay race',
        minPlayers: 4,
        maxPlayers: 10,
        duration: 5,
        pointsForWin: 75,
        pointsForSecond: 40,
        pointsForThird: 20,
        rules: [
            'Teams line up on opposite sides',
            'Must drink then flip cup',
            'Next player goes after successful flip',
            'First team to finish wins'
        ],
        equipment: ['Table', 'Plastic cups', 'Beer'],
        bonusPoints: [
            { id: '1', name: 'Clean Sweep', points: 25, description: 'Win by 3+ cups' },
            { id: '2', name: 'One Flip Wonder', points: 15, description: 'Flip on first try' }
        ]
    },
    'cornhole': {
        name: 'Cornhole',
        icon: '🎯',
        description: 'Aim for the hole with bean bags',
        minPlayers: 2,
        maxPlayers: 4,
        duration: 20,
        pointsForWin: 100,
        pointsForSecond: 50,
        pointsForThird: 25,
        rules: [
            'Play to 21 points',
            '3 points for hole, 1 for board',
            'Cancel out scoring',
            'Win by 2'
        ],
        equipment: ['Cornhole boards', 'Bean bags'],
        bonusPoints: [
            { id: '1', name: 'Four Bagger', points: 30, description: 'All 4 bags in the hole' },
            { id: '2', name: 'Skunk', points: 20, description: 'Win 21-0' }
        ]
    }
};
export default function GameConfigPanel({ games, onSave, initialConfigs = [] }) {
    const [configs, setConfigs] = useState(() => {
        return games.map(gameId => {
            const existing = initialConfigs.find(c => c.id === gameId);
            if (existing)
                return existing;
            const defaultConfig = DEFAULT_GAME_CONFIGS[gameId] || {};
            return {
                id: gameId,
                name: defaultConfig.name || gameId,
                icon: defaultConfig.icon || '🎮',
                description: defaultConfig.description || '',
                minPlayers: defaultConfig.minPlayers || 2,
                maxPlayers: defaultConfig.maxPlayers || 4,
                duration: defaultConfig.duration || 15,
                pointsForWin: defaultConfig.pointsForWin || 100,
                pointsForSecond: defaultConfig.pointsForSecond || 50,
                pointsForThird: defaultConfig.pointsForThird || 25,
                bonusPoints: defaultConfig.bonusPoints || [],
                rules: defaultConfig.rules || [],
                equipment: defaultConfig.equipment || [],
                customSettings: {}
            };
        });
    });
    const [selectedGame, setSelectedGame] = useState(games[0] || '');
    const [newRule, setNewRule] = useState('');
    const [newEquipment, setNewEquipment] = useState('');
    const currentConfig = configs.find(c => c.id === selectedGame);
    const updateConfig = (gameId, updates) => {
        setConfigs(prev => prev.map(config => config.id === gameId ? { ...config, ...updates } : config));
    };
    const addBonusPoint = (gameId) => {
        const newBonus = {
            id: Date.now().toString(),
            name: '',
            points: 10,
            description: ''
        };
        updateConfig(gameId, {
            bonusPoints: [...(currentConfig?.bonusPoints || []), newBonus]
        });
    };
    const updateBonusPoint = (gameId, bonusId, updates) => {
        const config = configs.find(c => c.id === gameId);
        if (!config)
            return;
        updateConfig(gameId, {
            bonusPoints: config.bonusPoints.map(bonus => bonus.id === bonusId ? { ...bonus, ...updates } : bonus)
        });
    };
    const removeBonusPoint = (gameId, bonusId) => {
        const config = configs.find(c => c.id === gameId);
        if (!config)
            return;
        updateConfig(gameId, {
            bonusPoints: config.bonusPoints.filter(bonus => bonus.id !== bonusId)
        });
    };
    const addRule = (gameId) => {
        if (!newRule.trim())
            return;
        const config = configs.find(c => c.id === gameId);
        if (!config)
            return;
        updateConfig(gameId, {
            rules: [...config.rules, newRule.trim()]
        });
        setNewRule('');
    };
    const removeRule = (gameId, index) => {
        const config = configs.find(c => c.id === gameId);
        if (!config)
            return;
        updateConfig(gameId, {
            rules: config.rules.filter((_, i) => i !== index)
        });
    };
    const addEquipment = (gameId) => {
        if (!newEquipment.trim())
            return;
        const config = configs.find(c => c.id === gameId);
        if (!config)
            return;
        updateConfig(gameId, {
            equipment: [...config.equipment, newEquipment.trim()]
        });
        setNewEquipment('');
    };
    const removeEquipment = (gameId, index) => {
        const config = configs.find(c => c.id === gameId);
        if (!config)
            return;
        updateConfig(gameId, {
            equipment: config.equipment.filter((_, i) => i !== index)
        });
    };
    const copyConfig = (fromId, toId) => {
        const sourceConfig = configs.find(c => c.id === fromId);
        if (!sourceConfig)
            return;
        updateConfig(toId, {
            ...sourceConfig,
            id: toId
        });
        toast.success(`Copied settings from ${sourceConfig.name}`);
    };
    const resetConfig = (gameId) => {
        const defaultConfig = DEFAULT_GAME_CONFIGS[gameId];
        if (defaultConfig) {
            updateConfig(gameId, defaultConfig);
            toast.success('Reset to default settings');
        }
    };
    const handleSave = () => {
        onSave(configs);
        toast.success('Game configurations saved!');
    };
    if (!currentConfig)
        return null;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex flex-wrap gap-2 p-4 bg-white/5 rounded-2xl", children: configs.map((config) => (_jsxs(motion.button, { onClick: () => setSelectedGame(config.id), className: `px-4 py-2 rounded-xl font-party transition-all ${selectedGame === config.id
                        ? 'bg-gradient-party text-white shadow-glow'
                        : 'bg-white/10 hover:bg-white/20 text-white'}`, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: [_jsx("span", { className: "mr-2", children: config.icon }), config.name] }, config.id))) }), _jsx(AnimatePresence, { mode: "wait", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.3 }, className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "card-party", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "font-beer text-2xl flex items-center gap-2", children: [_jsx(Settings, { className: "w-6 h-6" }), "Basic Settings"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "font-party text-sm text-party-pink", children: "Game Name" }), _jsx(Input, { value: currentConfig.name, onChange: (e) => updateConfig(selectedGame, { name: e.target.value }), className: "input-party" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "font-party text-sm text-party-cyan", children: "Icon" }), _jsx(Input, { value: currentConfig.icon, onChange: (e) => updateConfig(selectedGame, { icon: e.target.value }), className: "input-party text-center text-2xl", maxLength: 2 })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "font-party text-sm text-party-yellow", children: "Description" }), _jsx("textarea", { value: currentConfig.description, onChange: (e) => updateConfig(selectedGame, { description: e.target.value }), className: "input-party w-full min-h-[80px] resize-none", placeholder: "Brief game description..." })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "font-party text-sm flex items-center gap-1", children: [_jsx(Users, { className: "w-4 h-4" }), "Min Players"] }), _jsx(Input, { type: "number", min: "1", value: currentConfig.minPlayers, onChange: (e) => updateConfig(selectedGame, { minPlayers: parseInt(e.target.value) || 1 }), className: "input-party" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "font-party text-sm flex items-center gap-1", children: [_jsx(Users, { className: "w-4 h-4" }), "Max Players"] }), _jsx(Input, { type: "number", min: "1", value: currentConfig.maxPlayers, onChange: (e) => updateConfig(selectedGame, { maxPlayers: parseInt(e.target.value) || 4 }), className: "input-party" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "font-party text-sm flex items-center gap-1", children: [_jsx(Timer, { className: "w-4 h-4" }), "Duration (min)"] }), _jsx(Input, { type: "number", min: "1", value: currentConfig.duration, onChange: (e) => updateConfig(selectedGame, { duration: parseInt(e.target.value) || 15 }), className: "input-party" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: () => resetConfig(selectedGame), variant: "outline", size: "sm", className: "border-white/30 text-white hover:bg-white/10", children: [_jsx(RotateCcw, { className: "w-4 h-4 mr-2" }), "Reset"] }), _jsxs(Button, { onClick: () => {
                                                        const otherGames = configs.filter(c => c.id !== selectedGame);
                                                        if (otherGames.length > 0) {
                                                            copyConfig(selectedGame, otherGames[0].id);
                                                        }
                                                    }, variant: "outline", size: "sm", className: "border-white/30 text-white hover:bg-white/10", children: [_jsx(Copy, { className: "w-4 h-4 mr-2" }), "Copy to Others"] })] })] })] }), _jsxs(Card, { className: "card-party", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "font-beer text-2xl flex items-center gap-2", children: [_jsx(Trophy, { className: "w-6 h-6" }), "Points & Scoring"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "font-party text-sm flex items-center gap-1", children: [_jsx(Crown, { className: "w-4 h-4 text-yellow-500" }), "1st Place"] }), _jsx(Input, { type: "number", min: "0", value: currentConfig.pointsForWin, onChange: (e) => updateConfig(selectedGame, { pointsForWin: parseInt(e.target.value) || 0 }), className: "input-party" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "font-party text-sm flex items-center gap-1", children: [_jsx(Medal, { className: "w-4 h-4 text-gray-400" }), "2nd Place"] }), _jsx(Input, { type: "number", min: "0", value: currentConfig.pointsForSecond, onChange: (e) => updateConfig(selectedGame, { pointsForSecond: parseInt(e.target.value) || 0 }), className: "input-party" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "font-party text-sm flex items-center gap-1", children: [_jsx(Star, { className: "w-4 h-4 text-amber-700" }), "3rd Place"] }), _jsx(Input, { type: "number", min: "0", value: currentConfig.pointsForThird, onChange: (e) => updateConfig(selectedGame, { pointsForThird: parseInt(e.target.value) || 0 }), className: "input-party" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h4", { className: "font-party text-lg flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-5 h-5" }), "Bonus Points"] }), _jsxs(Button, { onClick: () => addBonusPoint(selectedGame), size: "sm", className: "btn-party h-8", children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), "Add"] })] }), _jsxs("div", { className: "space-y-2", children: [currentConfig.bonusPoints.map((bonus) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, className: "bg-white/10 rounded-xl p-3 space-y-2", children: [_jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsx(Input, { value: bonus.name, onChange: (e) => updateBonusPoint(selectedGame, bonus.id, { name: e.target.value }), placeholder: "Bonus name", className: "input-party h-8 text-sm" }), _jsx(Input, { type: "number", value: bonus.points, onChange: (e) => updateBonusPoint(selectedGame, bonus.id, { points: parseInt(e.target.value) || 0 }), placeholder: "Points", className: "input-party h-8 text-sm" }), _jsx(Button, { onClick: () => removeBonusPoint(selectedGame, bonus.id), variant: "ghost", size: "sm", className: "h-8 text-red-400 hover:bg-red-400/20", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsx(Input, { value: bonus.description, onChange: (e) => updateBonusPoint(selectedGame, bonus.id, { description: e.target.value }), placeholder: "Description", className: "input-party h-8 text-sm" })] }, bonus.id))), currentConfig.bonusPoints.length === 0 && (_jsx("p", { className: "text-center text-white/50 py-4", children: "No bonus points yet" }))] })] })] })] }), _jsxs(Card, { className: "card-party lg:col-span-2", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "font-beer text-2xl flex items-center gap-2", children: [_jsx(Info, { className: "w-6 h-6" }), "Rules & Equipment"] }) }), _jsxs(CardContent, { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-party text-lg mb-3 text-party-pink", children: "Game Rules" }), _jsx("div", { className: "space-y-2 mb-3", children: currentConfig.rules.map((rule, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, className: "flex items-center gap-2 bg-white/10 rounded-lg p-2", children: [_jsx("span", { className: "flex-1 text-sm", children: rule }), _jsx(Button, { onClick: () => removeRule(selectedGame, index), variant: "ghost", size: "sm", className: "h-6 w-6 p-0 text-red-400 hover:bg-red-400/20", children: _jsx(Trash2, { className: "w-3 h-3" }) })] }, index))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { value: newRule, onChange: (e) => setNewRule(e.target.value), onKeyPress: (e) => {
                                                                if (e.key === 'Enter') {
                                                                    addRule(selectedGame);
                                                                }
                                                            }, placeholder: "Add a rule...", className: "input-party" }), _jsx(Button, { onClick: () => addRule(selectedGame), className: "btn-party", children: _jsx(Plus, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-party text-lg mb-3 text-party-cyan", children: "Equipment Needed" }), _jsx("div", { className: "space-y-2 mb-3", children: currentConfig.equipment.map((item, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, className: "flex items-center gap-2 bg-white/10 rounded-lg p-2", children: [_jsx(Target, { className: "w-4 h-4 text-party-yellow" }), _jsx("span", { className: "flex-1 text-sm", children: item }), _jsx(Button, { onClick: () => removeEquipment(selectedGame, index), variant: "ghost", size: "sm", className: "h-6 w-6 p-0 text-red-400 hover:bg-red-400/20", children: _jsx(Trash2, { className: "w-3 h-3" }) })] }, index))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { value: newEquipment, onChange: (e) => setNewEquipment(e.target.value), onKeyPress: (e) => {
                                                                if (e.key === 'Enter') {
                                                                    addEquipment(selectedGame);
                                                                }
                                                            }, placeholder: "Add equipment...", className: "input-party" }), _jsx(Button, { onClick: () => addEquipment(selectedGame), className: "btn-party", children: _jsx(Plus, { className: "w-4 h-4" }) })] })] })] })] })] }, selectedGame) }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { onClick: handleSave, className: "btn-party", size: "lg", children: [_jsx(Save, { className: "w-5 h-5 mr-2" }), "Save All Configurations"] }) })] }));
}
