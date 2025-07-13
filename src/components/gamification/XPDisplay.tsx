import React, { useEffect, useState } from 'react';
import type { PlayerXP, XPGain } from '../../services/xp-system';

interface XPDisplayProps {
  playerXP: PlayerXP;
  showAnimations?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const XPDisplay: React.FC<XPDisplayProps> = ({
  playerXP,
  showAnimations = true,
  size = 'md',
  className = ''
}) => {
  const [animatingXP, setAnimatingXP] = useState(false);
  const [recentGain, setRecentGain] = useState<XPGain | null>(null);

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
    if (level >= 9) return 'from-purple-500 to-pink-500'; // Grandmaster+
    if (level >= 7) return 'from-yellow-400 to-orange-500'; // Master+
    if (level >= 5) return 'from-blue-400 to-purple-500'; // All-Star+
    if (level >= 3) return 'from-green-400 to-blue-500'; // Pro+
    return 'from-gray-400 to-gray-500'; // Rookie/Amateur
  };

  const getXPColor = () => {
    const progress = playerXP.levelProgress;
    if (progress >= 80) return 'from-green-400 to-green-600';
    if (progress >= 60) return 'from-yellow-400 to-yellow-600';
    if (progress >= 40) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  const formatXP = (xp: number) => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  };

  const getReasonEmoji = (reason: string) => {
    const emojiMap: Record<string, string> = {
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

  return (
    <div className={`relative bg-white rounded-lg shadow-md overflow-hidden ${styles.container} ${className}`}>
      {/* Level Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`
            inline-flex items-center justify-center w-12 h-12 rounded-full
            bg-gradient-to-r ${getLevelBadgeColor()}
            text-white font-bold ${styles.level}
            shadow-lg
          `}>
            {playerXP.level}
          </div>
          <div>
            <div className={`font-semibold text-gray-900 ${styles.text}`}>
              {playerXP.levelName}
            </div>
            <div className="text-gray-500 text-sm">
              Level {playerXP.level}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`font-bold text-gray-900 ${styles.text}`}>
            {formatXP(playerXP.currentXP)} XP
          </div>
          <div className="text-gray-500 text-sm">
            Total: {formatXP(playerXP.totalXP)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress to Level {playerXP.level + 1}</span>
          <span>
            {playerXP.xpToNextLevel ? `${playerXP.xpToNextLevel} XP to go` : 'Max Level!'}
          </span>
        </div>
        
        <div className={`bg-gray-200 rounded-full overflow-hidden ${styles.bar}`}>
          <div 
            className={`
              bg-gradient-to-r ${getXPColor()} 
              ${styles.bar} rounded-full transition-all duration-1000 ease-out
              ${animatingXP ? 'animate-pulse' : ''}
            `}
            style={{ width: `${playerXP.levelProgress}%` }}
          />
        </div>
      </div>

      {/* XP Breakdown */}
      {size !== 'sm' && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>Season: {formatXP(playerXP.seasonXP)}</span>
          <span>Monthly: {formatXP(playerXP.monthlyXP)}</span>
        </div>
      )}

      {/* Recent XP Gain Animation */}
      {recentGain && animatingXP && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <div className="
            bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold
            animate-bounce transform transition-all duration-500
          ">
            <span className="mr-1">{getReasonEmoji(recentGain.reason)}</span>
            +{recentGain.amount} XP
            {recentGain.multipliers && recentGain.multipliers.length > 0 && (
              <div className="text-xs opacity-75">
                {recentGain.multipliers.map(m => `${m.description}`).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Level Up Modal Component
interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  newLevelName: string;
  rewards: any[];
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  oldLevel,
  newLevel,
  newLevelName,
  rewards
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center transform animate-scale-in">
        {/* Celebration Animation */}
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Level Up!
        </h2>
        
        <div className="text-lg text-gray-600 mb-6">
          <span className="text-2xl font-bold text-blue-600">
            Level {oldLevel} → Level {newLevel}
          </span>
          <div className="mt-2 text-xl font-semibold text-purple-600">
            {newLevelName}
          </div>
        </div>

        {/* Rewards */}
        {rewards.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🎁 New Rewards Unlocked
            </h3>
            <div className="space-y-2">
              {rewards.map((reward, index) => (
                <div key={index} className="flex items-center justify-center space-x-2 text-sm">
                  <span>🏆</span>
                  <span className="font-medium">{reward.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="
            w-full bg-gradient-to-r from-blue-500 to-purple-600 
            text-white font-bold py-3 px-6 rounded-lg
            hover:from-blue-600 hover:to-purple-700
            transition-all duration-200
          "
        >
          Awesome! 🚀
        </button>
      </div>
    </div>
  );
};

// XP Gain Toast Component
interface XPGainToastProps {
  gain: XPGain;
  isVisible: boolean;
  onHide: () => void;
}

export const XPGainToast: React.FC<XPGainToastProps> = ({
  gain,
  isVisible,
  onHide
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) return null;

  const getReasonEmoji = (reason: string) => {
    const emojiMap: Record<string, string> = {
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

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-500 animate-slide-in-right">
      <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
        <span className="text-xl">{getReasonEmoji(gain.reason)}</span>
        <div>
          <div className="font-bold">+{gain.amount} XP</div>
          {gain.multipliers && gain.multipliers.length > 0 && (
            <div className="text-xs opacity-90">
              {gain.multipliers.map(m => m.description).join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default XPDisplay;