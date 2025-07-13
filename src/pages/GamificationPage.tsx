import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import TrophyCase from '../components/gamification/TrophyCase';
import XPDisplay from '../components/gamification/XPDisplay';
import VotingPanel from '../components/gamification/VotingPanel';
import Badge from '../components/gamification/Badge';

interface GamificationPageProps {
  userId: string;
  tournamentId?: string;
}

const GamificationPage: React.FC<GamificationPageProps> = ({
  userId,
  tournamentId
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'voting' | 'leaderboard'>('overview');

  // Fetch gamification data
  const { data: playerXP } = trpc.gamification.getPlayerXP.useQuery({ userId });
  const { data: playerAchievements } = trpc.gamification.getPlayerAchievements.useQuery({ userId });
  const { data: allAchievements } = trpc.gamification.getAllAchievements.useQuery();
  const { data: xpLeaderboard } = trpc.gamification.getXPLeaderboard.useQuery({ type: 'all_time' });
  const { data: votingSession } = trpc.gamification.getVotingSession.useQuery(
    { tournamentId: tournamentId || '' },
    { enabled: !!tournamentId }
  );

  // Mutations
  const submitVoteMutation = trpc.gamification.submitVote.useMutation();

  const handleVoteSubmit = async (categoryId: string, nomineeId: string, nomineeType: 'player' | 'team') => {
    if (!tournamentId) return;
    
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* XP Display */}
      {playerXP && (
        <div className="col-span-full">
          <XPDisplay playerXP={playerXP} size="lg" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🎉 Recent Achievements
          </h3>
          
          {playerAchievements?.achievements && playerAchievements.achievements.length > 0 ? (
            <div className="space-y-3">
              {playerAchievements.achievements
                .filter((a: any) => a.unlockedAt)
                .sort((a: any, b: any) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
                .slice(0, 5)
                .map((achievement: any) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Badge achievement={achievement} size="md" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏅</div>
              <p className="text-gray-600">No achievements yet</p>
              <p className="text-sm text-gray-500">Start playing to earn your first achievement!</p>
            </div>
          )}
        </div>

        {/* Progress Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📈 Progress Summary
          </h3>
          
          <div className="space-y-4">
            {/* Achievement Progress */}
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>Achievements</span>
                <span>
                  {playerAchievements?.achievements?.length || 0} / {allAchievements?.achievements?.length || 0}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${allAchievements?.achievements?.length 
                      ? ((playerAchievements?.achievements?.length || 0) / allAchievements.achievements.length) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* Level Progress */}
            {playerXP && (
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                  <span>Level Progress</span>
                  <span>{playerXP.levelProgress}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${playerXP.levelProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {playerXP?.level || 1}
                </div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {playerAchievements?.achievements?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Level Preview */}
      {playerXP && playerXP.level < 10 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🎯 Next Level Rewards
          </h3>
          <div className="text-sm text-gray-600 mb-2">
            Reach Level {playerXP.level + 1} to unlock:
          </div>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <span>🎨</span>
              <span className="text-sm">New Theme</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🏆</span>
              <span className="text-sm">Special Badge</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎵</span>
              <span className="text-sm">Sound Pack</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAchievements = () => (
    <TrophyCase
      achievements={playerAchievements?.achievements || []}
      allAchievements={(allAchievements?.achievements || []) as any}
      showLocked={true}
      groupByCategory={true}
    />
  );

  const renderVoting = () => {
    if (!tournamentId) {
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🗳️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Tournament Selected
          </h3>
          <p className="text-gray-600">
            Voting is available during tournaments
          </p>
        </div>
      );
    }

    return (
      <VotingPanel
        tournamentId={tournamentId}
        votingSession={votingSession || null}
        currentUserId={userId}
        onVoteSubmit={handleVoteSubmit}
      />
    );
  };

  const renderLeaderboard = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        🏆 XP Leaderboard
      </h3>
      
      {xpLeaderboard && xpLeaderboard.length > 0 ? (
        <div className="space-y-3">
          {xpLeaderboard.map((entry, index) => (
            <div 
              key={entry.userId}
              className={`
                flex items-center justify-between p-4 rounded-lg
                ${entry.userId === userId ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}
              `}
            >
              <div className="flex items-center space-x-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-800' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-200 text-gray-700'}
                `}>
                  {entry.rank}
                </div>
                
                <div>
                  <div className="font-semibold text-gray-900">
                    {entry.displayName}
                    {entry.userId === userId && (
                      <span className="ml-2 text-blue-600 text-sm">(You)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Level {entry.level} {entry.levelName}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {entry.totalXP.toLocaleString()} XP
                </div>
                <div className={`text-sm ${entry.change > 0 ? 'text-green-600' : entry.change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {entry.change > 0 ? '↗' : entry.change < 0 ? '↘' : '→'} {Math.abs(entry.change)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600">No leaderboard data available</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🎮 Gamification</h1>
        <p className="mt-2 text-gray-600">
          Track your progress, earn achievements, and compete with friends
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'voting' && renderVoting()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
      </div>
    </div>
  );
};

export default GamificationPage;