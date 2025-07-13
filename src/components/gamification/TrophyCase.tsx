import React, { useState } from 'react';
import type { Achievement } from '../../types';
import Badge from './Badge';

interface TrophyCaseProps {
  achievements: Achievement[];
  allAchievements?: Achievement[]; // To show locked achievements
  showLocked?: boolean;
  groupByCategory?: boolean;
  className?: string;
}

const TrophyCase: React.FC<TrophyCaseProps> = ({
  achievements,
  allAchievements = [],
  showLocked = false,
  groupByCategory = true,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rarity' | 'name'>('date');

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
      }, {} as Record<string, (Achievement & { unlocked: boolean })[]>)
    : { all: allDisplayAchievements };

  // Filter by selected category
  const filteredAchievements = selectedCategory === 'all'
    ? allDisplayAchievements
    : groupedAchievements[selectedCategory] || [];

  // Sort achievements
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        if (!a.unlocked && !b.unlocked) return 0;
        if (!a.unlocked) return 1;
        if (!b.unlocked) return -1;
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

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trophy Case</h2>
          <p className="text-gray-600 mt-1">
            {unlocked} of {total} achievements unlocked ({percentage}%)
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Category Filter */}
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedCategory === category.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Sort Filter */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">Sort by Date</option>
          <option value="rarity">Sort by Rarity</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Achievement Grid */}
      {sortedAchievements.length > 0 ? (
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
          {sortedAchievements.map((achievement) => (
            <div key={achievement.id} className="flex flex-col items-center">
              <Badge
                achievement={achievement}
                size="lg"
                unlocked={achievement.unlocked}
                showTooltip={true}
              />
              <span className="text-xs text-gray-600 mt-1 text-center line-clamp-2">
                {achievement.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No achievements yet
          </h3>
          <p className="text-gray-600">
            Start playing to earn your first achievement!
          </p>
        </div>
      )}

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎉 Recent Achievements
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {achievements
              .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
              .slice(0, 5)
              .map((achievement) => (
                <div key={achievement.id} className="flex-shrink-0 text-center">
                  <Badge
                    achievement={achievement}
                    size="md"
                    showTooltip={true}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Rarity Breakdown */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Collection Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['common', 'rare', 'epic', 'legendary'] as const).map(rarity => {
            const rarityAchievements = achievements.filter(a => a.rarity === rarity);
            const totalRarity = allDisplayAchievements.filter(a => a.rarity === rarity).length;
            const rarityColors = {
              common: 'text-gray-600 bg-gray-100',
              rare: 'text-blue-600 bg-blue-100',
              epic: 'text-purple-600 bg-purple-100',
              legendary: 'text-yellow-600 bg-yellow-100'
            };
            
            return (
              <div key={rarity} className={`p-3 rounded-lg ${rarityColors[rarity]}`}>
                <div className="text-lg font-bold">
                  {rarityAchievements.length}/{totalRarity}
                </div>
                <div className="text-sm capitalize">{rarity}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrophyCase;