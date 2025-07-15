import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Camera, Trophy, Target, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
export function QuickActions({ tournamentSlug, isPlayer = false, className }) {
    const actions = [
        {
            icon: Target,
            label: 'Submit Score',
            color: 'bg-primary',
            onClick: () => {
                if (tournamentSlug) {
                    // Navigate to score submission
                    window.location.href = `/dashboard/${tournamentSlug}#submit-score`;
                }
                else {
                    toast.error('No active tournament');
                }
            },
        },
        {
            icon: Trophy,
            label: 'Leaderboard',
            color: 'bg-yellow-500',
            onClick: () => {
                if (tournamentSlug) {
                    window.location.href = `/leaderboard/${tournamentSlug}`;
                }
                else {
                    toast.error('No active tournament');
                }
            },
        },
        {
            icon: Clock,
            label: 'My Next Match',
            color: 'bg-green-500',
            onClick: () => {
                if (tournamentSlug) {
                    window.location.href = `/dashboard/${tournamentSlug}#upcoming-matches`;
                }
                else {
                    toast.error('No active tournament');
                }
            },
        },
        {
            icon: Camera,
            label: 'Upload Photo',
            color: 'bg-purple-500',
            onClick: () => {
                if (tournamentSlug) {
                    // Trigger file input for photo upload
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            // Handle file upload
                            toast.success('Photo selected for upload');
                            // TODO: Implement actual upload
                        }
                    };
                    input.click();
                }
                else {
                    toast.error('No active tournament');
                }
            },
        },
    ];
    // Add admin/host actions
    const adminActions = [
        {
            icon: Plus,
            label: 'Create Match',
            color: 'bg-red-500',
            onClick: () => {
                if (tournamentSlug) {
                    window.location.href = `/control/${tournamentSlug}#create-match`;
                }
            },
        },
    ];
    const displayActions = isPlayer ? actions : [...actions, ...adminActions];
    return (_jsxs("div", { className: cn("mobile-quick-actions", className), children: [_jsx("h3", { className: "text-sm font-semibold text-muted-foreground mb-3 px-2", children: "Quick Actions" }), _jsx("div", { className: "flex gap-3 overflow-x-auto pb-2 px-2 scrollbar-hide", children: displayActions.map((action, index) => (_jsxs(motion.button, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, onClick: action.onClick, className: "flex-shrink-0 group", children: [_jsx("div", { className: cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-2", "transform transition-all duration-200", "group-active:scale-95 group-hover:scale-105", action.color), children: _jsx(action.icon, { className: "w-7 h-7 text-white" }) }), _jsx("p", { className: "text-xs font-medium text-center", children: action.label })] }, action.label))) }), _jsx("style", { children: `
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      ` })] }));
}
// Floating Action Button for primary action
export function MobileFAB({ onClick, icon: Icon = Plus, label = "New Action", className }) {
    return (_jsx(motion.button, { initial: { scale: 0 }, animate: { scale: 1 }, whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 }, onClick: onClick, className: cn("fixed bottom-20 right-4 z-40", "w-14 h-14 bg-primary text-white rounded-full", "shadow-lg flex items-center justify-center", "active:shadow-xl transition-shadow", className), "aria-label": label, children: _jsx(Icon, { className: "w-6 h-6" }) }));
}
