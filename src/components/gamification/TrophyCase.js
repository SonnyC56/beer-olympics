import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Badge from './Badge';
const TrophyCase = ({ achievements, allAchievements = [], showLocked = false, groupByCategory = true, className = '' }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    // Combine unlocked and locked achievements
    const unlockedIds = new Set(achievements.map(a => a.id));
    const lockedAchievements = showLocked
        ? allAchievements.filter(a => !unlockedIds.has(a.id))
        : [];
    const allDisplayAchievements = [
        ...achievements.map(a => ({ ...a, unlocked: true })),
        ...lockedAchievements.map(a => ({ ...a, unlocked: false }))
    ];
    // Group achievements by category
    const groupedAchievements = groupByCategory
        ? allDisplayAchievements.reduce((groups, achievement) => {
            const category = achievement.type;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(achievement);
            return groups;
        }, {})
        : { all: allDisplayAchievements };
    // Filter by selected category
    const filteredAchievements = selectedCategory === 'all'
        ? allDisplayAchievements
        : groupedAchievements[selectedCategory] || [];
    // Sort achievements
    const sortedAchievements = [...filteredAchievements].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                if (!a.unlocked && !b.unlocked)
                    return 0;
                if (!a.unlocked)
                    return 1;
                if (!b.unlocked)
                    return -1;
                return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
            case 'rarity':
                const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
                return rarityOrder[b.rarity] - rarityOrder[a.rarity];
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
    const categories = [
        { key: 'all', name: 'All', icon: '🏆' },
        { key: 'milestone', name: 'Milestones', icon: '🎯' },
        { key: 'special', name: 'Special', icon: '⭐' },
        { key: 'tournament', name: 'Tournament', icon: '🏟️' },
        { key: 'social', name: 'Social', icon: '🤝' }
    ];
    const getCompletionStats = () => {
        const total = allDisplayAchievements.length;
        const unlocked = achievements.length;
        const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
        return { total, unlocked, percentage };
    };
    const { total, unlocked, percentage } = getCompletionStats();
    return (_jsxs("div", { className: `bg-white rounded-lg shadow-lg p-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Trophy Case" }), _jsxs("p", { className: "text-gray-600 mt-1", children: [unlocked, " of ", total, " achievements unlocked (", percentage, "%)"] })] }), _jsx("div", { className: "w-32 h-3 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500", style: { width: `${percentage}%` } }) })] }), _jsxs("div", { className: "flex flex-wrap gap-4 mb-6", children: [_jsx("div", { className: "flex gap-2", children: categories.map(category => (_jsxs("button", { onClick: () => setSelectedCategory(category.key), className: `
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedCategory === category.key
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `, children: [_jsx("span", { className: "mr-1", children: category.icon }), category.name] }, category.key))) }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "date", children: "Sort by Date" }), _jsx("option", { value: "rarity", children: "Sort by Rarity" }), _jsx("option", { value: "name", children: "Sort by Name" })] })] }), sortedAchievements.length > 0 ? (_jsx("div", { className: "grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4", children: sortedAchievements.map((achievement) => (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx(Badge, { achievement: achievement, size: "lg", unlocked: achievement.unlocked, showTooltip: true }), _jsx("span", { className: "text-xs text-gray-600 mt-1 text-center line-clamp-2", children: achievement.name })] }, achievement.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83C\uDFC6" }), _jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No achievements yet" }), _jsx("p", { className: "text-gray-600", children: "Start playing to earn your first achievement!" })] })), achievements.length > 0 && (_jsxs("div", { className: "mt-8 pt-6 border-t border-gray-200", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "\uD83C\uDF89 Recent Achievements" }), _jsx("div", { className: "flex gap-4 overflow-x-auto pb-2", children: achievements
                            .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
                            .slice(0, 5)
                            .map((achievement) => (_jsxs("div", { className: "flex-shrink-0 text-center", children: [_jsx(Badge, { achievement: achievement, size: "md", showTooltip: true }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: new Date(achievement.unlockedAt).toLocaleDateString() })] }, achievement.id))) })] })), _jsxs("div", { className: "mt-8 pt-6 border-t border-gray-200", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "\uD83D\uDCCA Collection Stats" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: ['common', 'rare', 'epic', 'legendary'].map(rarity => {
                            const rarityAchievements = achievements.filter(a => a.rarity === rarity);
                            const totalRarity = allDisplayAchievements.filter(a => a.rarity === rarity).length;
                            const rarityColors = {
                                common: 'text-gray-600 bg-gray-100',
                                rare: 'text-blue-600 bg-blue-100',
                                epic: 'text-purple-600 bg-purple-100',
                                legendary: 'text-yellow-600 bg-yellow-100'
                            };
                            return (_jsxs("div", { className: `p-3 rounded-lg ${rarityColors[rarity]}`, children: [_jsxs("div", { className: "text-lg font-bold", children: [rarityAchievements.length, "/", totalRarity] }), _jsx("div", { className: "text-sm capitalize", children: rarity })] }, rarity));
                        }) })] })] }));
};
export default TrophyCase;
