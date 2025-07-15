import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Badge = ({ achievement, size = 'md', showTooltip = true, unlocked = true, onClick, className = '' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-base',
        xl: 'w-24 h-24 text-lg'
    };
    const rarityClasses = {
        common: 'border-gray-400 bg-gray-100 text-gray-700',
        rare: 'border-blue-400 bg-blue-100 text-blue-700',
        epic: 'border-purple-400 bg-purple-100 text-purple-700',
        legendary: 'border-yellow-400 bg-yellow-100 text-yellow-700'
    };
    const rarityEffects = {
        common: '',
        rare: 'shadow-md',
        epic: 'shadow-lg shadow-purple-200',
        legendary: 'shadow-xl shadow-yellow-200 animate-pulse'
    };
    const baseClasses = `
    relative inline-flex items-center justify-center
    rounded-full border-2 font-medium
    transition-all duration-200
    ${sizeClasses[size]}
    ${unlocked ? rarityClasses[achievement.rarity] : 'border-gray-300 bg-gray-50 text-gray-400'}
    ${unlocked ? rarityEffects[achievement.rarity] : ''}
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
    ${!unlocked ? 'opacity-50' : ''}
    ${className}
  `;
    const getBadgeIcon = () => {
        if (achievement.iconUrl) {
            return (_jsx("img", { src: achievement.iconUrl, alt: achievement.name, className: "w-full h-full object-cover rounded-full" }));
        }
        // Default icons based on achievement type
        const typeIcons = {
            milestone: '🏆',
            special: '⭐',
            tournament: '🎯',
            social: '🤝'
        };
        return (_jsx("span", { className: "text-current", children: typeIcons[achievement.type] || '🏅' }));
    };
    const getRarityBadge = () => {
        if (!unlocked || size === 'sm')
            return null;
        const raritySymbols = {
            common: '',
            rare: '💎',
            epic: '👑',
            legendary: '🌟'
        };
        if (raritySymbols[achievement.rarity]) {
            return (_jsx("div", { className: "absolute -top-1 -right-1 text-xs", children: raritySymbols[achievement.rarity] }));
        }
        return null;
    };
    const getTooltipContent = () => {
        if (!showTooltip)
            return null;
        return (_jsx("div", { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none", children: _jsxs("div", { className: "bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap max-w-xs", children: [_jsx("div", { className: "font-semibold", children: achievement.name }), _jsx("div", { className: "text-gray-300 text-xs", children: achievement.description }), unlocked && (_jsxs("div", { className: "text-gray-400 text-xs mt-1", children: ["Unlocked: ", new Date(achievement.unlockedAt).toLocaleDateString()] })), _jsx("div", { className: "absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" })] }) }));
    };
    return (_jsxs("div", { className: "group relative inline-block", children: [_jsxs("div", { className: baseClasses, onClick: onClick, role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : undefined, children: [getBadgeIcon(), getRarityBadge(), !unlocked && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-full", children: _jsx("span", { className: "text-gray-500 text-xs", children: "\uD83D\uDD12" }) }))] }), getTooltipContent()] }));
};
export default Badge;
