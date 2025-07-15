import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  MdSchedule, 
  MdLocationOn, 
  MdStar, 
  MdStarBorder,
  MdNotificationsActive,
  MdSportsScore,
  MdGroup
} from 'react-icons/md';
import { format, formatDistanceToNow, addMinutes } from 'date-fns';

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
  estimatedDuration?: number; // in minutes
}

interface UpcomingMatch {
  id: string;
  scheduledFor: Date;
  station: Station;
  game: Game;
  teams: Team[];
  round?: string;
  bracketPosition?: string;
}

interface UpcomingMatchesProps {
  matches: UpcomingMatch[];
  favoriteTeams?: string[];
  onToggleFavorite?: (teamId: string) => void;
  tickerMode?: boolean;
  compact?: boolean;
}

export function UpcomingMatches({
  matches,
  favoriteTeams = [],
  onToggleFavorite,
  tickerMode = false,
  compact = false
}: UpcomingMatchesProps) {
  // Ticker mode for TV display
  if (tickerMode) {
    return (
      <div className="flex items-center gap-4 overflow-x-hidden">
        <Badge variant="destructive" className="shrink-0">
          UPCOMING
        </Badge>
        <motion.div
          className="flex gap-6"
          animate={{ x: [0, -100 + '%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: matches.length * 10,
              ease: "linear",
            },
          }}
        >
          {[...matches, ...matches].map((match, index) => (
            <div key={`${match.id}-${index}`} className="flex items-center gap-2 whitespace-nowrap">
              <MdSchedule className="text-muted-foreground" />
              <span className="font-medium">
                {format(new Date(match.scheduledFor), 'h:mm a')}
              </span>
              <span className="text-muted-foreground">•</span>
              <span>{match.game.name}</span>
              <span className="text-muted-foreground">@</span>
              <span>{match.station.name}</span>
              <span className="text-muted-foreground">•</span>
              <span className="font-medium">
                {match.teams.map(t => t.name).join(' vs ')}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  const renderMatch = (match: UpcomingMatch, index: number) => {
    const hasFavorite = match.teams.some(team => favoriteTeams.includes(team.id));
    const timeUntil = formatDistanceToNow(new Date(match.scheduledFor), { addSuffix: true });
    const estimatedEnd = match.game.estimatedDuration 
      ? addMinutes(new Date(match.scheduledFor), match.game.estimatedDuration)
      : null;

    if (compact) {
      return (
        <motion.div
          key={match.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-3 rounded-lg bg-card/50 hover:bg-card transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {format(new Date(match.scheduledFor), 'h:mm a')}
                </Badge>
                {hasFavorite && <MdStar className="text-primary text-sm" />}
              </div>
              <p className="text-sm font-medium truncate">
                {match.teams.map(t => t.name).join(' vs ')}
              </p>
              <p className="text-xs text-muted-foreground">
                {match.game.name} • {match.station.name}
              </p>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={match.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className={`p-4 ${hasFavorite ? 'ring-2 ring-primary/50' : ''}`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-lg">
                <MdSchedule className="text-lg" />
              </div>
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  {match.game.name}
                  {match.round && (
                    <Badge variant="secondary" className="text-xs">
                      {match.round}
                    </Badge>
                  )}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MdLocationOn className="text-sm" />
                  <span>{match.station.name}</span>
                  {match.station.location && (
                    <span className="opacity-60">• {match.station.location}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="font-medium">{format(new Date(match.scheduledFor), 'h:mm a')}</p>
              <p className="text-xs text-muted-foreground">{timeUntil}</p>
            </div>
          </div>

          {/* Teams */}
          <div className="space-y-2 mb-3">
            {match.teams.map((team) => {
              const isFavorite = favoriteTeams.includes(team.id);
              
              return (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-background/50"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.avatar || team.name[0]}
                    </div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  
                  {onToggleFavorite && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onToggleFavorite(team.id)}
                    >
                      {isFavorite ? (
                        <MdStar className="text-primary" />
                      ) : (
                        <MdStarBorder className="text-muted-foreground" />
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
            <div className="flex items-center gap-3">
              {match.game.estimatedDuration && (
                <span>~{match.game.estimatedDuration} min</span>
              )}
              {estimatedEnd && (
                <span>Ends ~{format(estimatedEnd, 'h:mm a')}</span>
              )}
            </div>
            
            {hasFavorite && (
              <div className="flex items-center gap-1 text-primary">
                <MdNotificationsActive className="text-sm" />
                <span>Notifications on</span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  if (matches.length === 0) {
    return (
      <Card className="p-6 text-center">
        <MdSchedule className="text-3xl text-muted-foreground mx-auto mb-2" />
        <h3 className="font-medium mb-1">No Upcoming Matches</h3>
        <p className="text-sm text-muted-foreground">
          All matches have been scheduled or completed.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <MdSchedule className="text-primary" />
            Upcoming Matches
          </h3>
          <Badge variant="secondary">
            {matches.length} scheduled
          </Badge>
        </div>
      )}
      
      <AnimatePresence mode="popLayout">
        {matches.map((match, index) => renderMatch(match, index))}
      </AnimatePresence>
    </div>
  );
}