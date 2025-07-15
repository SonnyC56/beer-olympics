import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, Target, Users, ChevronRight, Bell, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSwipeNavigation } from '../../hooks/useSwipeGesture';
import { format } from 'date-fns';

interface NextMatch {
  id: string;
  opponent: string;
  game: string;
  time: Date;
  location?: string;
}

interface PlayerStats {
  wins: number;
  losses: number;
  totalGames: number;
  rank: number;
  totalPlayers: number;
  winStreak: number;
}

interface MobilePlayerDashboardProps {
  playerName: string;
  teamName: string;
  teamColor?: string;
  nextMatch?: NextMatch;
  stats: PlayerStats;
  recentMatches: Array<{
    id: string;
    opponent: string;
    game: string;
    result: 'win' | 'loss';
    score: { player: number; opponent: number };
    time: Date;
  }>;
  notifications?: number;
}

export function MobilePlayerDashboard({
  playerName,
  teamName,
  teamColor = '#3b82f6',
  nextMatch,
  stats,
  recentMatches,
  notifications = 0,
}: MobilePlayerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'matches'>('overview');
  const containerRef = useRef<any>(null);

  // Swipe between tabs
  useEffect(() => {
    useSwipeNavigation(containerRef, {
      onNext: () => {
        const tabs = ['overview', 'stats', 'matches'] as const;
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex < tabs.length - 1) {
          setActiveTab(tabs[currentIndex + 1]);
        }
      },
      onPrevious: () => {
        const tabs = ['overview', 'stats', 'matches'] as const;
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex > 0) {
          setActiveTab(tabs[currentIndex - 1]);
        }
      },
    });
  }, [activeTab, containerRef]);

  return (
    <div ref={containerRef} className="mobile-player-dashboard min-h-screen bg-background">
      {/* Header */}
      <div 
        className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-white p-6 pb-20"
        style={{ 
          background: `linear-gradient(135deg, ${teamColor} 0%, ${teamColor}dd 100%)` 
        }}
      >
        {/* Notification Badge */}
        {notifications > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-6 right-6"
          >
            <button className="relative p-2 rounded-full bg-white/20 backdrop-blur">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {notifications}
              </span>
            </button>
          </motion.div>
        )}

        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">{playerName}</h1>
          <p className="text-white/80 flex items-center gap-2">
            <Users size={16} />
            {teamName}
          </p>
        </div>

        {/* Background decoration */}
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full -mb-24 -mr-24" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -mt-16 -ml-16" />
      </div>

      {/* Next Match Card */}
      {nextMatch && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-4 -mt-14 relative z-20"
        >
          <div className="bg-card rounded-2xl shadow-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="text-primary" size={18} />
                Your Next Match
              </h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {format(nextMatch.time, 'h:mm a')}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Opponent</span>
                <span className="font-medium">{nextMatch.opponent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Game</span>
                <span className="font-medium">{nextMatch.game}</span>
              </div>
              {nextMatch.location && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="font-medium">{nextMatch.location}</span>
                </div>
              )}
            </div>

            <button className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <Target size={18} />
              I'm Ready!
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex justify-around border-b mt-6 px-4">
        {(['overview', 'stats', 'matches'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-sm font-medium capitalize transition-colors relative",
              activeTab === tab 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="p-4"
        >
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={Trophy}
                  label="Win Rate"
                  value={`${Math.round((stats.wins / stats.totalGames) * 100)}%`}
                  color="text-green-500"
                />
                <StatCard
                  icon={Zap}
                  label="Win Streak"
                  value={stats.winStreak.toString()}
                  color="text-yellow-500"
                />
              </div>

              {/* Recent Performance */}
              <div className="bg-card rounded-xl p-4 border">
                <h3 className="font-semibold mb-3">Recent Performance</h3>
                <div className="flex gap-1">
                  {recentMatches.slice(0, 10).map((match) => (
                    <div
                      key={match.id}
                      className={cn(
                        "flex-1 h-12 rounded",
                        match.result === 'win' 
                          ? "bg-green-500/20 border-2 border-green-500" 
                          : "bg-red-500/20 border-2 border-red-500"
                      )}
                      title={`${match.result === 'win' ? 'Won' : 'Lost'} vs ${match.opponent}`}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <ActionButton
                  icon={Target}
                  label="Submit Score"
                  sublabel="Record your latest match"
                  onClick={() => {}}
                />
                <ActionButton
                  icon={Trophy}
                  label="View Full Leaderboard"
                  sublabel={`You're ranked #${stats.rank} of ${stats.totalPlayers}`}
                  onClick={() => {}}
                />
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded-xl p-4 border">
                  <div className="text-2xl font-bold text-green-500">{stats.wins}</div>
                  <div className="text-sm text-muted-foreground">Wins</div>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                  <div className="text-2xl font-bold text-red-500">{stats.losses}</div>
                  <div className="text-sm text-muted-foreground">Losses</div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border">
                <h3 className="font-semibold mb-3">Tournament Rank</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">#{stats.rank}</div>
                    <div className="text-sm text-muted-foreground">
                      out of {stats.totalPlayers} players
                    </div>
                  </div>
                  <Trophy className="text-yellow-500" size={48} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "bg-card rounded-xl p-4 border-2",
                    match.result === 'win' 
                      ? "border-green-500/30" 
                      : "border-red-500/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{match.game}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      match.result === 'win' ? "text-green-500" : "text-red-500"
                    )}>
                      {match.result === 'win' ? 'WIN' : 'LOSS'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>vs {match.opponent}</span>
                    <span>
                      {match.score.player} - {match.score.opponent}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(match.time, 'MMM d, h:mm a')}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Helper Components
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl p-4 border">
      <Icon className={color} size={24} />
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  sublabel,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  sublabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-xl p-4 border flex items-center gap-3 active:scale-[0.98] transition-transform"
    >
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="text-primary" size={20} />
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium">{label}</div>
        {sublabel && (
          <div className="text-sm text-muted-foreground">{sublabel}</div>
        )}
      </div>
      <ChevronRight className="text-muted-foreground" size={20} />
    </button>
  );
}