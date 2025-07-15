import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { VOTE_CATEGORIES } from '../../services/voting-system';
const VotingPanel = ({ votingSession, onVoteSubmit, onVotingClose, className = '' }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [nominees, setNominees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('');
    // Update countdown timer
    useEffect(() => {
        if (!votingSession)
            return;
        const updateTimer = () => {
            const now = new Date().getTime();
            const endTime = new Date(votingSession.endsAt).getTime();
            const difference = endTime - now;
            if (difference > 0) {
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
            else {
                setTimeRemaining('Voting Closed');
                if (onVotingClose)
                    onVotingClose();
            }
        };
        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [votingSession, onVotingClose]);
    // Load nominees for selected category
    useEffect(() => {
        if (selectedCategory) {
            loadNominees(selectedCategory);
        }
    }, [selectedCategory]);
    const loadNominees = async (categoryId) => {
        setLoading(true);
        try {
            // This would fetch eligible nominees from the API
            // For now, using mock data
            const category = VOTE_CATEGORIES[categoryId];
            const mockNominees = category.eligibleNominees.type === 'all_teams'
                ? [
                    { id: 'team1', name: 'The Beer Crusaders', type: 'team', avatar: '🍺' },
                    { id: 'team2', name: 'Hops & Dreams', type: 'team', avatar: '🌿' },
                    { id: 'team3', name: 'Brew Crew', type: 'team', avatar: '⚡' }
                ]
                : [
                    { id: 'user1', name: 'John Smith', type: 'player', avatar: '👨' },
                    { id: 'user2', name: 'Sarah Johnson', type: 'player', avatar: '👩' },
                    { id: 'user3', name: 'Mike Wilson', type: 'player', avatar: '👨‍🦲' }
                ];
            setNominees(mockNominees);
        }
        catch (error) {
            console.error('Failed to load nominees:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleVote = async (nomineeId, nomineeType) => {
        if (!selectedCategory)
            return;
        try {
            await onVoteSubmit(selectedCategory, nomineeId, nomineeType);
            // Reset selection after successful vote
            setSelectedCategory(null);
            setNominees([]);
        }
        catch (error) {
            console.error('Failed to submit vote:', error);
        }
    };
    if (!votingSession) {
        return (_jsxs("div", { className: `bg-gray-100 rounded-lg p-8 text-center ${className}`, children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDDF3\uFE0F" }), _jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No Active Voting" }), _jsx("p", { className: "text-gray-600", children: "Voting will open at the end of the tournament" })] }));
    }
    const activeCategories = votingSession.activeCategories
        .map(id => ({ ...VOTE_CATEGORIES[id], id }))
        .filter(cat => cat.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    const getTimeRemainingColor = () => {
        const [minutes] = timeRemaining.split(':').map(Number);
        if (minutes <= 2)
            return 'text-red-500';
        if (minutes <= 5)
            return 'text-yellow-500';
        return 'text-green-500';
    };
    return (_jsxs("div", { className: `bg-white rounded-lg shadow-lg overflow-hidden ${className}`, children: [_jsx("div", { className: "bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "\uD83D\uDDF3\uFE0F Tournament Awards" }), _jsx("p", { className: "text-purple-100 mt-1", children: "Vote for your fellow competitors!" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm text-purple-100", children: "Time Remaining" }), _jsx("div", { className: `text-2xl font-bold ${getTimeRemainingColor()}`, children: timeRemaining })] })] }) }), !selectedCategory && (_jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Choose an Award Category" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: activeCategories.map((category) => {
                            const status = votingSession.votingStatus[category.id];
                            const hasVoted = false; // This would check if user already voted
                            return (_jsxs("button", { onClick: () => setSelectedCategory(category.id), disabled: hasVoted || !status?.isActive, className: `
                    p-4 rounded-lg border-2 text-left transition-all duration-200
                    ${hasVoted
                                    ? 'border-green-300 bg-green-50 cursor-not-allowed'
                                    : status?.isActive
                                        ? 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'}
                  `, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-2xl", children: category.emoji }), hasVoted && _jsx("span", { className: "text-green-600 text-sm", children: "\u2713 Voted" })] }), _jsx("h4", { className: "font-semibold text-gray-900 mb-1", children: category.name }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: category.description }), status && (_jsxs("div", { className: "text-xs text-gray-500", children: [status.totalVotes, " votes \u2022 ", status.eligibleVoters, " eligible voters"] }))] }, category.id));
                        }) })] })), selectedCategory && (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: VOTE_CATEGORIES[selectedCategory]?.name }), _jsx("button", { onClick: () => {
                                    setSelectedCategory(null);
                                    setNominees([]);
                                }, className: "text-gray-500 hover:text-gray-700", children: "\u2190 Back to Categories" })] }), loading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading nominees..." })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: nominees.map((nominee) => (_jsx("button", { onClick: () => handleVote(nominee.id, nominee.type), className: "\n                    p-4 rounded-lg border-2 border-gray-200 \n                    hover:border-purple-400 hover:bg-purple-50\n                    transition-all duration-200 text-left\n                  ", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "text-3xl", children: nominee.avatar }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900", children: nominee.name }), _jsx("p", { className: "text-sm text-gray-600 capitalize", children: nominee.type })] })] }) }, nominee.id))) })), _jsx("div", { className: "mt-6 p-4 bg-blue-50 rounded-lg", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx("span", { className: "text-blue-500", children: "\u2139\uFE0F" }), _jsxs("div", { className: "text-sm text-blue-700", children: [_jsx("strong", { children: "Note:" }), " ", VOTE_CATEGORIES[selectedCategory]?.description, _jsx("br", {}), "You can only vote once per category."] })] }) })] })), votingSession && Object.keys(votingSession.votingStatus).length > 0 && (_jsxs("div", { className: "border-t border-gray-200 p-6 bg-gray-50", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "\uD83D\uDCCA Live Results" }), _jsx("div", { className: "space-y-3", children: Object.values(votingSession.votingStatus).map((status) => {
                            const category = VOTE_CATEGORIES[status.categoryId];
                            if (!category)
                                return null;
                            return (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { children: category.emoji }), _jsx("span", { className: "font-medium", children: category.name })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [status.totalVotes, " votes"] })] }, status.categoryId));
                        }) })] }))] }));
};
export default VotingPanel;
