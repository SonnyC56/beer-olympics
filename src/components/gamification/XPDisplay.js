import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const XPDisplay = ({ playerXP, showAnimations = true, size = 'md', className = '' }) => {
    const [animatingXP, setAnimatingXP] = useState(false);
    const [recentGain, setRecentGain] = useState(null);
    // Animate recent XP gains
    useEffect(() => {
        if (playerXP.lastXPGain && showAnimations) {
            setRecentGain(playerXP.lastXPGain);
            setAnimatingXP(true);
            const timer = setTimeout(() => {
                setAnimatingXP(false);
                setRecentGain(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [playerXP.lastXPGain, showAnimations]);
    const sizeStyles = {
        sm: {
            container: 'px-3 py-2',
            text: 'text-sm',
            level: 'text-lg',
            bar: 'h-2'
        },
        md: {
            container: 'px-4 py-3',
            text: 'text-base',
            level: 'text-xl',
            bar: 'h-3'
        },
        lg: {
            container: 'px-6 py-4',
            text: 'text-lg',
            level: 'text-2xl',
            bar: 'h-4'
        }
    };
    const styles = sizeStyles[size];
    const getLevelBadgeColor = () => {
        const level = playerXP.level;
        if (level >= 9)
            return 'from-purple-500 to-pink-500'; // Grandmaster+
        if (level >= 7)
            return 'from-yellow-400 to-orange-500'; // Master+
        if (level >= 5)
            return 'from-blue-400 to-purple-500'; // All-Star+
        if (level >= 3)
            return 'from-green-400 to-blue-500'; // Pro+
        return 'from-gray-400 to-gray-500'; // Rookie/Amateur
    };
    const getXPColor = () => {
        const progress = playerXP.levelProgress;
        if (progress >= 80)
            return 'from-green-400 to-green-600';
        if (progress >= 60)
            return 'from-yellow-400 to-yellow-600';
        if (progress >= 40)
            return 'from-orange-400 to-orange-600';
        return 'from-blue-400 to-blue-600';
    };
    const formatXP = (xp) => {
        if (xp >= 1000000)
            return `${(xp / 1000000).toFixed(1)}M`;
        if (xp >= 1000)
            return `${(xp / 1000).toFixed(1)}K`;
        return xp.toString();
    };
    const getReasonEmoji = (reason) => {
        const emojiMap = {
            game_participation: '🎮',
            game_win: '🏆',
            tournament_win: '👑',
            achievement_unlock: '🏅',
            social_action: '🤝',
            daily_bonus: '📅',
            streak_bonus: '🔥',
            special_event: '⭐'
        };
        return emojiMap[reason] || '🎯';
    };
    return (_jsxs("div", { className: `relative bg-white rounded-lg shadow-md overflow-hidden ${styles.container} ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `
            inline-flex items-center justify-center w-12 h-12 rounded-full
            bg-gradient-to-r ${getLevelBadgeColor()}
            text-white font-bold ${styles.level}
            shadow-lg
          `, children: playerXP.level }), _jsxs("div", { children: [_jsx("div", { className: `font-semibold text-gray-900 ${styles.text}`, children: playerXP.levelName }), _jsxs("div", { className: "text-gray-500 text-sm", children: ["Level ", playerXP.level] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: `font-bold text-gray-900 ${styles.text}`, children: [formatXP(playerXP.currentXP), " XP"] }), _jsxs("div", { className: "text-gray-500 text-sm", children: ["Total: ", formatXP(playerXP.totalXP)] })] })] }), _jsxs("div", { className: "mb-2", children: [_jsxs("div", { className: "flex justify-between text-sm text-gray-600 mb-1", children: [_jsxs("span", { children: ["Progress to Level ", playerXP.level + 1] }), _jsx("span", { children: playerXP.xpToNextLevel ? `${playerXP.xpToNextLevel} XP to go` : 'Max Level!' })] }), _jsx("div", { className: `bg-gray-200 rounded-full overflow-hidden ${styles.bar}`, children: _jsx("div", { className: `
              bg-gradient-to-r ${getXPColor()} 
              ${styles.bar} rounded-full transition-all duration-1000 ease-out
              ${animatingXP ? 'animate-pulse' : ''}
            `, style: { width: `${playerXP.levelProgress}%` } }) })] }), size !== 'sm' && (_jsxs("div", { className: "flex justify-between text-xs text-gray-500", children: [_jsxs("span", { children: ["Season: ", formatXP(playerXP.seasonXP)] }), _jsxs("span", { children: ["Monthly: ", formatXP(playerXP.monthlyXP)] })] })), recentGain && animatingXP && (_jsx("div", { className: "absolute top-2 right-2 pointer-events-none", children: _jsxs("div", { className: "\n            bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold\n            animate-bounce transform transition-all duration-500\n          ", children: [_jsx("span", { className: "mr-1", children: getReasonEmoji(recentGain.reason) }), "+", recentGain.amount, " XP", recentGain.multipliers && recentGain.multipliers.length > 0 && (_jsx("div", { className: "text-xs opacity-75", children: recentGain.multipliers.map(m => `${m.description}`).join(', ') }))] }) }))] }));
};
export const LevelUpModal = ({ isOpen, onClose, oldLevel, newLevel, newLevelName, rewards }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center transform animate-scale-in", children: [_jsx("div", { className: "text-6xl mb-4 animate-bounce", children: "\uD83C\uDF89" }), _jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Level Up!" }), _jsxs("div", { className: "text-lg text-gray-600 mb-6", children: [_jsxs("span", { className: "text-2xl font-bold text-blue-600", children: ["Level ", oldLevel, " \u2192 Level ", newLevel] }), _jsx("div", { className: "mt-2 text-xl font-semibold text-purple-600", children: newLevelName })] }), rewards.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "\uD83C\uDF81 New Rewards Unlocked" }), _jsx("div", { className: "space-y-2", children: rewards.map((reward, index) => (_jsxs("div", { className: "flex items-center justify-center space-x-2 text-sm", children: [_jsx("span", { children: "\uD83C\uDFC6" }), _jsx("span", { className: "font-medium", children: reward.name })] }, index))) })] })), _jsx("button", { onClick: onClose, className: "\n            w-full bg-gradient-to-r from-blue-500 to-purple-600 \n            text-white font-bold py-3 px-6 rounded-lg\n            hover:from-blue-600 hover:to-purple-700\n            transition-all duration-200\n          ", children: "Awesome! \uD83D\uDE80" })] }) }));
};
export const XPGainToast = ({ gain, isVisible, onHide }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onHide, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onHide]);
    if (!isVisible)
        return null;
    const getReasonEmoji = (reason) => {
        const emojiMap = {
            game_participation: '🎮',
            game_win: '🏆',
            tournament_win: '👑',
            achievement_unlock: '🏅',
            social_action: '🤝',
            daily_bonus: '📅',
            streak_bonus: '🔥',
            special_event: '⭐'
        };
        return emojiMap[reason] || '🎯';
    };
    return (_jsx("div", { className: "fixed top-4 right-4 z-50 transform transition-all duration-500 animate-slide-in-right", children: _jsxs("div", { className: "bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2", children: [_jsx("span", { className: "text-xl", children: getReasonEmoji(gain.reason) }), _jsxs("div", { children: [_jsxs("div", { className: "font-bold", children: ["+", gain.amount, " XP"] }), gain.multipliers && gain.multipliers.length > 0 && (_jsx("div", { className: "text-xs opacity-90", children: gain.multipliers.map(m => m.description).join(', ') }))] })] }) }));
};
export default XPDisplay;
