import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  MdSportsScore, 
  MdTimer, 
  MdLocationOn, 
  MdStar, 
  MdStarBorder,
  MdNotifications,
  MdCameraAlt,
  MdVideocam
} from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';

interface Team {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

interface Station {
  id: string;
  name: string;
  location?: string;
}

interface Game {
  id: string;
  name: string;
  icon?: string;
  rules?: string;
}

interface Score {
  teamId: string;
  score: number;
  position: number;
}

interface Match {
  id: string;
  status: 'in_progress' | 'completed' | 'upcoming';
  startedAt?: Date;
  completedAt?: Date;
  station: Station;
  game: Game;
  teams: Team[];
  scores: Score[];
  highlights?: {
    id: string;
    type: 'photo' | 'video';
    url: string;
    timestamp: Date;
  }[];
}

interface LiveMatchTrackerProps {
  matches: Match[];
  onFocusMatch?: (stationId: string) => void;
  favoriteTeams?: string[];
  displayMode?: 'desktop' | 'mobile' | 'tv';
  focused?: boolean;
  gridView?: boolean;
  tvMode?: boolean;
}

export function LiveMatchTracker({
  matches,
  onFocusMatch,
  favoriteTeams = [],
  displayMode = 'desktop',
  focused = false,
  gridView = false,
  tvMode = false
}: LiveMatchTrackerProps) {
  const [pulsingMatches, setPulsingMatches] = useState<Set<string>>(new Set());
  const [recentScores, setRecentScores] = useState<Map<string, number>>(new Map());

  // Track score changes for animations
  useEffect(() => {
    const newScores = new Map<string, number>();
    const newPulsing = new Set<string>();

    matches.forEach(match => {
      match.scores.forEach(score => {
        const key = `${match.id}-${score.teamId}`;
        const prevScore = recentScores.get(key);
        
        if (prevScore !== undefined && prevScore !== score.score) {
          newPulsing.add(key);
          setTimeout(() => {
            setPulsingMatches(prev => {
              const next = new Set(prev);
              next.delete(key);
              return next;
            });
          }, 3000);
        }
        
        newScores.set(key, score.score);
      });
    });

    setRecentScores(newScores);
    setPulsingMatches(prev => new Set([...prev, ...newPulsing]));
  }, [matches]);

  const getMatchCardSize = () => {
    if (tvMode) return 'h-64';
    if (focused) return 'h-96';
    if (gridView) return 'h-48';
    if (displayMode === 'mobile') return 'h-40';
    return 'h-56';
  };

  const renderMatch = (match: Match) => {
    const hasFavorite = match.teams.some(team => favoriteTeams.includes(team.id));
    const matchDuration = match.startedAt 
      ? formatDistanceToNow(new Date(match.startedAt), { includeSeconds: true })
      : 'Starting soon';

    return (
      <motion.div
        key={match.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        className={`relative ${gridView ? '' : 'col-span-1'}`}
      >
        <Card 
          className={`${getMatchCardSize()} p-4 cursor-pointer transition-all ${
            hasFavorite ? 'ring-2 ring-primary ring-offset-2' : ''
          }`}
          onClick={() => onFocusMatch?.(match.station.id)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <MdSportsScore className="text-lg text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{match.game.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MdLocationOn className="text-sm" />
                  <span>{match.station.name}</span>
                  {match.station.location && (
                    <span className="opacity-60">• {match.station.location}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {hasFavorite && (
                <Badge variant="default" className="bg-primary/20 text-primary gap-1">
                  <MdStar className="text-xs" />
                  Favorite
                </Badge>
              )}
              <Badge 
                variant={match.status === 'in_progress' ? 'destructive' : 'secondary'}
                className="gap-1"
              >
                {match.status === 'in_progress' && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-current rounded-full"
                  />
                )}
                <MdTimer className="text-xs" />
                {matchDuration}
              </Badge>
            </div>
          </div>

          {/* Teams and Scores */}
          <div className="space-y-2 flex-1">
            {match.teams.map((team, index) => {
              const teamScore = match.scores.find(s => s.teamId === team.id);
              const scoreKey = `${match.id}-${team.id}`;
              const isPulsing = pulsingMatches.has(scoreKey);

              return (
                <motion.div
                  key={team.id}
                  className={`flex items-center justify-between p-2 rounded-lg bg-card ${
                    teamScore?.position === 1 ? 'ring-2 ring-primary/50' : ''
                  }`}
                  animate={isPulsing ? {
                    backgroundColor: ['rgba(var(--primary), 0.2)', 'rgba(var(--primary), 0)', 'rgba(var(--primary), 0.2)']
                  } : {}}
                  transition={{ duration: 0.5, repeat: isPulsing ? 3 : 0 }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.avatar || team.name[0]}
                    </div>
                    <span className="font-medium">{team.name}</span>
                    {favoriteTeams.includes(team.id) && (
                      <MdStar className="text-primary text-sm" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {teamScore?.position === 1 && (
                      <span className="text-xs font-medium text-primary">LEADING</span>
                    )}
                    <motion.span
                      key={`${scoreKey}-${teamScore?.score}`}
                      initial={{ scale: 1.5, color: 'var(--primary)' }}
                      animate={{ scale: 1, color: 'var(--foreground)' }}
                      className="text-2xl font-bold tabular-nums"
                    >
                      {teamScore?.score || 0}
                    </motion.span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Media Highlights */}
          {match.highlights && match.highlights.length > 0 && (
            <div className="mt-3 pt-3 border-t flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MdCameraAlt />
                <span>{match.highlights.filter(h => h.type === 'photo').length}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MdVideocam />
                <span>{match.highlights.filter(h => h.type === 'video').length}</span>
              </div>
              <span className="text-xs text-muted-foreground ml-auto">
                View highlights →
              </span>
            </div>
          )}
        </Card>

        {/* Live indicator for TV mode */}
        {tvMode && match.status === 'in_progress' && (
          <motion.div
            className="absolute top-2 right-2"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge variant="destructive" className="text-xs">
              LIVE
            </Badge>
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (matches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MdSportsScore className="text-4xl text-muted-foreground mx-auto mb-2" />
        <h3 className="text-lg font-medium mb-1">No Active Matches</h3>
        <p className="text-muted-foreground">
          Check back soon for live match updates!
        </p>
      </Card>
    );
  }

  // TV Mode Layout
  if (tvMode) {
    return (
      <div className="h-full">
        <AnimatePresence mode="popLayout">
          {matches.slice(0, 4).map(renderMatch)}
        </AnimatePresence>
      </div>
    );
  }

  // Focused Mode
  if (focused && matches.length === 1) {
    return (
      <div className="max-w-4xl mx-auto">
        {renderMatch(matches[0])}
        {/* Additional focused view details could go here */}
      </div>
    );
  }

  // Grid/Split View
  return (
    <div className={`grid gap-4 ${
      gridView 
        ? `grid-cols-${displayMode === 'mobile' ? '1' : '2'} lg:grid-cols-3`
        : 'grid-cols-1'
    }`}>
      <AnimatePresence mode="popLayout">
        {matches.map(renderMatch)}
      </AnimatePresence>
    </div>
  );
}