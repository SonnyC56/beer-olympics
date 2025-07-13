import React, { useState, useEffect } from 'react';
import type { VotingSession } from '../../services/voting-system';
import { VOTE_CATEGORIES } from '../../services/voting-system';

interface VotingPanelProps {
  tournamentId?: string;
  votingSession: VotingSession | null;
  currentUserId?: string;
  onVoteSubmit: (categoryId: string, nomineeId: string, nomineeType: 'player' | 'team') => Promise<void>;
  onVotingClose?: () => void;
  className?: string;
}

const VotingPanel: React.FC<VotingPanelProps> = ({
  votingSession,
  onVoteSubmit,
  onVotingClose,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [nominees, setNominees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Update countdown timer
  useEffect(() => {
    if (!votingSession) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(votingSession.endsAt).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeRemaining('Voting Closed');
        if (onVotingClose) onVotingClose();
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

  const loadNominees = async (categoryId: string) => {
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
    } catch (error) {
      console.error('Failed to load nominees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (nomineeId: string, nomineeType: 'player' | 'team') => {
    if (!selectedCategory) return;
    
    try {
      await onVoteSubmit(selectedCategory, nomineeId, nomineeType);
      // Reset selection after successful vote
      setSelectedCategory(null);
      setNominees([]);
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  if (!votingSession) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="text-4xl mb-4">🗳️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Active Voting
        </h3>
        <p className="text-gray-600">
          Voting will open at the end of the tournament
        </p>
      </div>
    );
  }

  const activeCategories = votingSession.activeCategories
    .map(id => ({ ...VOTE_CATEGORIES[id], id }))
    .filter(cat => cat.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const getTimeRemainingColor = () => {
    const [minutes] = timeRemaining.split(':').map(Number);
    if (minutes <= 2) return 'text-red-500';
    if (minutes <= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🗳️ Tournament Awards</h2>
            <p className="text-purple-100 mt-1">
              Vote for your fellow competitors!
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-purple-100">Time Remaining</div>
            <div className={`text-2xl font-bold ${getTimeRemainingColor()}`}>
              {timeRemaining}
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      {!selectedCategory && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Choose an Award Category
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCategories.map((category) => {
              const status = votingSession.votingStatus[category.id];
              const hasVoted = false; // This would check if user already voted
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  disabled={hasVoted || !status?.isActive}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all duration-200
                    ${hasVoted 
                      ? 'border-green-300 bg-green-50 cursor-not-allowed'
                      : status?.isActive
                        ? 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{category.emoji}</span>
                    {hasVoted && <span className="text-green-600 text-sm">✓ Voted</span>}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {category.description}
                  </p>
                  
                  {status && (
                    <div className="text-xs text-gray-500">
                      {status.totalVotes} votes • {status.eligibleVoters} eligible voters
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Nominee Selection */}
      {selectedCategory && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {VOTE_CATEGORIES[selectedCategory]?.name}
            </h3>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setNominees([]);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Categories
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading nominees...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nominees.map((nominee) => (
                <button
                  key={nominee.id}
                  onClick={() => handleVote(nominee.id, nominee.type)}
                  className="
                    p-4 rounded-lg border-2 border-gray-200 
                    hover:border-purple-400 hover:bg-purple-50
                    transition-all duration-200 text-left
                  "
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">
                      {nominee.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {nominee.name}
                      </h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {nominee.type}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">ℹ️</span>
              <div className="text-sm text-blue-700">
                <strong>Note:</strong> {VOTE_CATEGORIES[selectedCategory]?.description}
                <br />
                You can only vote once per category.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Results Preview (if enabled) */}
      {votingSession && Object.keys(votingSession.votingStatus).length > 0 && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Live Results
          </h3>
          
          <div className="space-y-3">
            {Object.values(votingSession.votingStatus).map((status) => {
              const category = VOTE_CATEGORIES[status.categoryId];
              if (!category) return null;
              
              return (
                <div key={status.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>{category.emoji}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {status.totalVotes} votes
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPanel;