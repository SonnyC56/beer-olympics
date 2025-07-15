import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
export function MobileScoreEntry({ matchId, teams, gameType = 'cups', onSubmit, onCancel, }) {
    const [scores, setScores] = useState(teams.reduce((acc, team) => ({ ...acc, [team.id]: 0 }), {}));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const containerRef = useRef(null);
    // Swipe to cancel
    useEffect(() => {
        useSwipeGesture(containerRef, {
            onSwipeDown: onCancel,
        });
    }, [onCancel, containerRef]);
    const handleScoreChange = (teamId, delta) => {
        setScores(prev => ({
            ...prev,
            [teamId]: Math.max(0, prev[teamId] + delta),
        }));
        // Haptic feedback on mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };
    const handleSubmit = async () => {
        // Validate scores
        const hasScores = Object.values(scores).some(score => score > 0);
        if (!hasScores) {
            toast.error('Please enter at least one score');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit(scores);
            toast.success('Score submitted!');
            // Haptic feedback for success
            if ('vibrate' in navigator) {
                navigator.vibrate([50, 50, 50]);
            }
        }
        catch (error) {
            toast.error('Failed to submit score');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const getScoreLabel = () => {
        switch (gameType) {
            case 'cups': return 'Cups';
            case 'points': return 'Points';
            case 'time': return 'Seconds';
            default: return 'Score';
        }
    };
    return (_jsx(AnimatePresence, { children: _jsxs(motion.div, { ref: containerRef, initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { type: 'spring', damping: 25 }, className: "fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl shadow-2xl", style: { maxHeight: '90vh' }, children: [_jsx("div", { className: "flex justify-center pt-3 pb-2", children: _jsx("div", { className: "w-12 h-1 bg-muted-foreground/30 rounded-full" }) }), _jsxs("div", { className: "px-6 pb-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "Enter Scores" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Swipe down to cancel" })] }), _jsx("div", { className: "px-6 pb-6 space-y-4 overflow-y-auto", style: { maxHeight: '60vh' }, children: teams.map((team) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, className: "bg-muted/50 rounded-2xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold text-lg", style: { color: team.color }, children: team.name }), _jsx("span", { className: "text-3xl font-bold tabular-nums", children: scores[team.id] })] }), _jsxs("div", { className: "flex items-center justify-center gap-4", children: [_jsx("button", { onClick: () => handleScoreChange(team.id, -1), disabled: scores[team.id] === 0, className: cn("w-16 h-16 rounded-full flex items-center justify-center", "bg-background border-2 transition-all", "active:scale-90 disabled:opacity-50", scores[team.id] === 0
                                            ? "border-muted"
                                            : "border-red-500 text-red-500"), "aria-label": `Decrease ${team.name} score`, children: _jsx(Minus, { size: 24, strokeWidth: 3 }) }), _jsxs("div", { className: "flex-1 text-center", children: [_jsx("div", { className: "text-sm text-muted-foreground mb-1", children: getScoreLabel() }), _jsx("input", { type: "number", value: scores[team.id], onChange: (e) => {
                                                    const value = parseInt(e.target.value) || 0;
                                                    setScores(prev => ({ ...prev, [team.id]: Math.max(0, value) }));
                                                }, className: "w-full text-center text-4xl font-bold bg-transparent outline-none", inputMode: "numeric", pattern: "[0-9]*" })] }), _jsx("button", { onClick: () => handleScoreChange(team.id, 1), className: cn("w-16 h-16 rounded-full flex items-center justify-center", "bg-green-500 text-white transition-all", "active:scale-90"), "aria-label": `Increase ${team.name} score`, children: _jsx(Plus, { size: 24, strokeWidth: 3 }) })] }), _jsx("div", { className: "flex gap-2 mt-3 justify-center", children: [5, 10, 15, 20].map((value) => (_jsx("button", { onClick: () => setScores(prev => ({ ...prev, [team.id]: value })), className: cn("px-3 py-1 rounded-full text-sm font-medium", "bg-background border transition-all", "active:scale-95", scores[team.id] === value
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted-foreground/30"), children: value }, value))) })] }, team.id))) }), _jsxs("div", { className: "flex gap-3 p-6 pt-4 border-t bg-background", children: [_jsx("button", { onClick: onCancel, className: cn("flex-1 py-4 rounded-2xl font-semibold", "bg-muted hover:bg-muted/80 transition-colors", "active:scale-95"), children: "Cancel" }), _jsx("button", { onClick: handleSubmit, disabled: isSubmitting || Object.values(scores).every(s => s === 0), className: cn("flex-1 py-4 rounded-2xl font-semibold", "bg-primary text-primary-foreground transition-all", "active:scale-95 disabled:opacity-50", "flex items-center justify-center gap-2"), children: isSubmitting ? (_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" }, children: _jsx(X, { size: 20 }) })) : (_jsxs(_Fragment, { children: [_jsx(Check, { size: 20 }), "Submit Score"] })) })] }), _jsx("div", { className: "h-safe-area-inset-bottom" })] }) }));
}
// Compact score display for match history
export function MobileScoreDisplay({ scores, teams, winner, }) {
    return (_jsx("div", { className: "flex items-center justify-around py-3", children: teams.map((team, index) => (_jsxs(React.Fragment, { children: [index > 0 && _jsx("span", { className: "text-muted-foreground mx-2", children: "vs" }), _jsxs("div", { className: cn("text-center", winner === team.id && "font-bold"), children: [_jsx("div", { className: "text-sm", style: { color: team.color }, children: team.name }), _jsx("div", { className: "text-2xl font-bold tabular-nums", children: scores[team.id] || 0 })] })] }, team.id))) }));
}
