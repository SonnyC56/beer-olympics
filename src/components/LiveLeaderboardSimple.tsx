import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { trpc } from '../utils/trpc';
import { MdLeaderboard, MdTrendingUp, MdTrendingDown, MdRemove } from 'react-icons/md';

interface LiveLeaderboardProps {
  tournamentId: string;
  compact?: boolean;
  highlightTeams?: string[];
  maxTeams?: number;
}

interface LeaderboardTeam {
  id: string;
  name: string;
  rank: number;
  points: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  color?: string;
}

export function LiveLeaderboard({ 
  tournamentId, 
  compact = false, 
  highlightTeams = [],
  maxTeams
}: LiveLeaderboardProps) {
  const { data: leaderboard, isLoading } = trpc.tournament.getLeaderboard.useQuery(
    { tournamentId },
    { 
      refetchInterval: 10000 // Update every 10 seconds
    }
  );

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
      </Card>
    );
  }

  const teams = maxTeams ? leaderboard?.slice(0, maxTeams) : leaderboard;

  // Simplified getRankChange as previousRank is not available from API
  const getRankChange = (team: LeaderboardTeam) => {
    return { icon: <MdRemove className="text-muted-foreground" />, change: 0 };
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">🥇 1st</Badge>;
      case 2:
        return <Badge className="bg-gray-400/20 text-gray-400 border-gray-400/50">🥈 2nd</Badge>;
      case 3:
        return <Badge className="bg-amber-600/20 text-amber-600 border-amber-600/50">🥉 3rd</Badge>;
      default:
        return <Badge variant="outline">{rank}th</Badge>;
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <MdLeaderboard className="text-primary" />
            Standings
          </h3>
          {teams && teams.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {teams[0].gamesPlayed} games
            </Badge>
          )}
        </div>
        
        <AnimatePresence mode="popLayout">
          {teams?.map((team, index) => {
            const rankChange = getRankChange(team);
            const isHighlighted = highlightTeams.includes(team.id);
            
            return (
              <motion.div
                key={team.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-2 rounded-lg ${
                  isHighlighted ? 'bg-primary/20 ring-1 ring-primary' : 'bg-card/50'
                } hover:bg-card transition-colors`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-bold w-6 text-center">{team.rank}</span>
                    {rankChange.icon}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {team.color && (
                        <div 
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                      )}
                      <span className="font-medium truncate">{team.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{team.wins}-{team.losses}</span>
                    <span className="font-bold tabular-nums">{team.points}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {(!teams || teams.length === 0) && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No teams yet
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MdLeaderboard className="text-primary" />
          Live Standings
        </h2>
        <Badge variant="outline">
          Updated every 10s
        </Badge>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {teams?.map((team, index) => {
            const rankChange = getRankChange(team);
            const isHighlighted = highlightTeams.includes(team.id);
            
            return (
              <motion.div
                key={team.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg ${
                  isHighlighted ? 'bg-primary/10 ring-2 ring-primary' : 'bg-card'
                } ${team.rank <= 3 ? 'shadow-lg' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRankBadge(team.rank)}
                    <div className="flex items-center gap-1">
                      {rankChange.icon}
                      
                    </div>
                    <div className="flex items-center gap-2">
                      {team.color && (
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                      )}
                      <span className="font-semibold text-lg">{team.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{team.points}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{team.wins}-{team.losses}</p>
                      <p className="text-xs text-muted-foreground">W-L</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {team.gamesPlayed > 0 
                          ? (team.points / team.gamesPlayed).toFixed(1)
                          : '0.0'}
                      </p>
                      <p className="text-xs text-muted-foreground">PPG</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {(!teams || teams.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          <MdLeaderboard className="text-4xl mx-auto mb-2 opacity-50" />
          <p>No teams in the tournament yet</p>
        </div>
      )}
    </Card>
  );
}