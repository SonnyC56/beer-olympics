import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { trpc } from '../utils/trpc';
import TrophyCase from '../components/gamification/TrophyCase';
import XPDisplay from '../components/gamification/XPDisplay';
import VotingPanel from '../components/gamification/VotingPanel';
import Badge from '../components/gamification/Badge';
const GamificationPage = ({ userId, tournamentId }) => {
    const [activeTab, setActiveTab] = useState('overview');
    // Fetch gamification data
    const { data: playerXP } = trpc.gamification.getPlayerXP.useQuery({ userId });
    const { data: playerAchievements } = trpc.gamification.getPlayerAchievements.useQuery({ userId });
    const { data: allAchievements } = trpc.gamification.getAllAchievements.useQuery();
    const { data: xpLeaderboard } = trpc.gamification.getXPLeaderboard.useQuery({ type: 'all_time' });
    const { data: votingSession } = trpc.gamification.getVotingSession.useQuery({ tournamentId: tournamentId || '' }, { enabled: !!tournamentId });
    // Mutations
    const submitVoteMutation = trpc.gamification.submitVote.useMutation();
    const handleVoteSubmit = async (categoryId, nomineeId, nomineeType) => {
        if (!tournamentId)
            return;
        await submitVoteMutation.mutateAsync({
            tournamentId,
            categoryId,
            voterId: userId,
            nomineeId,
            nomineeType
        });
    };
    const tabs = [
        { id: 'overview', name: 'Overview', icon: '🏠' },
        { id: 'achievements', name: 'Achievements', icon: '🏆' },
        ...(tournamentId ? [{ id: 'voting', name: 'Voting', icon: '🗳️' }] : []),
        { id: 'leaderboard', name: 'Leaderboard', icon: '📊' }
    ];
    const renderOverview = () => (_jsxs("div", { className: "space-y-6", children: [playerXP && (_jsx("div", { className: "col-span-full", children: _jsx(XPDisplay, { playerXP: playerXP, size: "lg" }) })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 mb-4", children: "\uD83C\uDF89 Recent Achievements" }), playerAchievements?.achievements && playerAchievements.achievements.length > 0 ? (_jsx("div", { className: "space-y-3", children: playerAchievements.achievements
                                    .filter((a) => a.unlockedAt)
                                    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
                                    .slice(0, 5)
                                    .map((achievement) => (_jsxs("div", { className: "flex items-center space-x-3 p-3 bg-gray-50 rounded-lg", children: [_jsx(Badge, { achievement: achievement, size: "md" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900", children: achievement.name }), _jsx("p", { className: "text-sm text-gray-600", children: achievement.description }), _jsx("p", { className: "text-xs text-gray-500", children: new Date(achievement.unlockedAt).toLocaleDateString() })] })] }, achievement.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83C\uDFC5" }), _jsx("p", { className: "text-gray-600", children: "No achievements yet" }), _jsx("p", { className: "text-sm text-gray-500", children: "Start playing to earn your first achievement!" })] }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 mb-4", children: "\uD83D\uDCC8 Progress Summary" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm font-medium text-gray-700 mb-1", children: [_jsx("span", { children: "Achievements" }), _jsxs("span", { children: [playerAchievements?.achievements?.length || 0, " / ", allAchievements?.achievements?.length || 0] })] }), _jsx("div", { className: "bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full transition-all duration-500", style: {
                                                        width: `${allAchievements?.achievements?.length
                                                            ? ((playerAchievements?.achievements?.length || 0) / allAchievements.achievements.length) * 100
                                                            : 0}%`
                                                    } }) })] }), playerXP && (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm font-medium text-gray-700 mb-1", children: [_jsx("span", { children: "Level Progress" }), _jsxs("span", { children: [playerXP.levelProgress, "%"] })] }), _jsx("div", { className: "bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-500 h-2 rounded-full transition-all duration-500", style: { width: `${playerXP.levelProgress}%` } }) })] })), _jsxs("div", { className: "grid grid-cols-2 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: playerXP?.level || 1 }), _jsx("div", { className: "text-sm text-gray-600", children: "Level" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: playerAchievements?.achievements?.length || 0 }), _jsx("div", { className: "text-sm text-gray-600", children: "Achievements" })] })] })] })] })] }), playerXP && playerXP.level < 10 && (_jsxs("div", { className: "bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "\uD83C\uDFAF Next Level Rewards" }), _jsxs("div", { className: "text-sm text-gray-600 mb-2", children: ["Reach Level ", playerXP.level + 1, " to unlock:"] }), _jsxs("div", { className: "flex space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { children: "\uD83C\uDFA8" }), _jsx("span", { className: "text-sm", children: "New Theme" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { children: "\uD83C\uDFC6" }), _jsx("span", { className: "text-sm", children: "Special Badge" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { children: "\uD83C\uDFB5" }), _jsx("span", { className: "text-sm", children: "Sound Pack" })] })] })] }))] }));
    const renderAchievements = () => (_jsx(TrophyCase, { achievements: playerAchievements?.achievements || [], allAchievements: (allAchievements?.achievements || []), showLocked: true, groupByCategory: true }));
    const renderVoting = () => {
        if (!tournamentId) {
            return (_jsxs("div", { className: "bg-gray-100 rounded-lg p-8 text-center", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDDF3\uFE0F" }), _jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No Tournament Selected" }), _jsx("p", { className: "text-gray-600", children: "Voting is available during tournaments" })] }));
        }
        return (_jsx(VotingPanel, { tournamentId: tournamentId, votingSession: votingSession || null, currentUserId: userId, onVoteSubmit: handleVoteSubmit }));
    };
    const renderLeaderboard = () => (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 mb-6", children: "\uD83C\uDFC6 XP Leaderboard" }), xpLeaderboard && xpLeaderboard.length > 0 ? (_jsx("div", { className: "space-y-3", children: xpLeaderboard.map((entry, index) => (_jsxs("div", { className: `
                flex items-center justify-between p-4 rounded-lg
                ${entry.userId === userId ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}
              `, children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: `
                  w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                        index === 1 ? 'bg-gray-300 text-gray-800' :
                                            index === 2 ? 'bg-orange-400 text-orange-900' :
                                                'bg-gray-200 text-gray-700'}
                `, children: entry.rank }), _jsxs("div", { children: [_jsxs("div", { className: "font-semibold text-gray-900", children: [entry.displayName, entry.userId === userId && (_jsx("span", { className: "ml-2 text-blue-600 text-sm", children: "(You)" }))] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Level ", entry.level, " ", entry.levelName] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-bold text-gray-900", children: [entry.totalXP.toLocaleString(), " XP"] }), _jsxs("div", { className: `text-sm ${entry.change > 0 ? 'text-green-600' : entry.change < 0 ? 'text-red-600' : 'text-gray-500'}`, children: [entry.change > 0 ? '↗' : entry.change < 0 ? '↘' : '→', " ", Math.abs(entry.change)] })] })] }, entry.userId))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDCCA" }), _jsx("p", { className: "text-gray-600", children: "No leaderboard data available" })] }))] }));
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\uD83C\uDFAE Gamification" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Track your progress, earn achievements, and compete with friends" })] }), _jsx("div", { className: "mb-8", children: _jsx("nav", { className: "flex space-x-8 border-b border-gray-200", children: tabs.map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `
                flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `, children: [_jsx("span", { children: tab.icon }), _jsx("span", { children: tab.name })] }, tab.id))) }) }), _jsxs("div", { children: [activeTab === 'overview' && renderOverview(), activeTab === 'achievements' && renderAchievements(), activeTab === 'voting' && renderVoting(), activeTab === 'leaderboard' && renderLeaderboard()] })] }));
};
export default GamificationPage;
