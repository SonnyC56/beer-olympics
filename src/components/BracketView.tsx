import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy,
  Crown,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface Team {
  id: string;
  name: string;
  seed: number;
  color: string;
  flag?: string;
}

interface Match {
  id: string;
  round: number;
  position: number;
  team1?: Team;
  team2?: Team;
  score1?: number;
  score2?: number;
  winner?: string;
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: string;
  gameType?: string;
}

interface BracketViewProps {
  tournamentName: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'group_stage';
  matches: Match[];
  teams: Team[];
  currentRound?: number;
  onMatchClick?: (match: Match) => void;
  onRefresh?: () => void;
  compact?: boolean;
}

const ROUND_NAMES: Record<number, string> = {
  1: 'Round of 16',
  2: 'Quarterfinals',
  3: 'Semifinals',
  4: 'Finals',
  5: 'Grand Finals'
};

export default function BracketView({
  tournamentName,
  format,
  matches,
  teams,
  onMatchClick,
  onRefresh,
  compact = false
}: BracketViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [hoveredMatch, setHoveredMatch] = useState<string | null>(null);

  // Group matches by round
  const roundMatches = matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(roundMatches)
    .map(Number)
    .sort((a, b) => a - b);

  const getMatchHeight = () => compact ? 60 : 80;
  const getMatchSpacing = () => compact ? 20 : 30;

  const getMatchStatus = (match: Match) => {
    if (match.status === 'completed') {
      return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20' };
    } else if (match.status === 'in_progress') {
      return { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    } else {
      return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-400/20' };
    }
  };

  const renderTeam = (team: Team | undefined, score?: number, isWinner?: boolean) => {
    if (!team) {
      return (
        <div className="flex items-center justify-between px-3 py-2 bg-white/5 text-white/40">
          <span className="text-sm">TBD</span>
        </div>
      );
    }

    return (
      <motion.div
        className={`flex items-center justify-between px-3 py-2 transition-all ${
          isWinner ? 'bg-gradient-party text-white font-bold' : 'bg-white/10 text-white'
        }`}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: team.color }}
          />
          <span className="text-sm font-party">
            {team.flag && <span className="mr-1">{team.flag}</span>}
            {team.name}
          </span>
          {isWinner && <Crown className="w-4 h-4 text-yellow-300 ml-1" />}
        </div>
        {score !== undefined && (
          <span className={`text-sm font-bold ${isWinner ? 'text-yellow-300' : ''}`}>
            {score}
          </span>
        )}
      </motion.div>
    );
  };

  const renderMatch = (match: Match, roundIndex: number) => {
    const status = getMatchStatus(match);
    const isSelected = selectedMatch === match.id;
    const isHovered = hoveredMatch === match.id;

    return (
      <motion.div
        key={match.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: roundIndex * 0.1 + match.position * 0.05 }}
        className={`relative ${compact ? 'mb-4' : 'mb-6'}`}
        style={{ height: getMatchHeight() }}
        onMouseEnter={() => setHoveredMatch(match.id)}
        onMouseLeave={() => setHoveredMatch(null)}
      >
        <Card
          className={`h-full cursor-pointer transition-all ${
            isSelected ? 'ring-2 ring-party-pink shadow-glow' : ''
          } ${isHovered ? 'scale-105 shadow-lg' : ''}`}
          onClick={() => {
            setSelectedMatch(match.id);
            onMatchClick?.(match);
          }}
        >
          <div className="h-full flex flex-col justify-center p-2">
            {/* Match Status */}
            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${status.bg} flex items-center justify-center`}>
              <status.icon className={`w-4 h-4 ${status.color}`} />
            </div>

            {/* Match Number & Game Type */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white/10 rounded-full px-2 py-1">
              <span className="text-xs font-party text-white/70">M{match.id}</span>
            </div>

            {/* Teams */}
            <div className="space-y-1">
              {renderTeam(match.team1, match.score1, match.winner === match.team1?.id)}
              <div className="h-px bg-white/20 mx-2" />
              {renderTeam(match.team2, match.score2, match.winner === match.team2?.id)}
            </div>

            {/* Game Type Badge */}
            {match.gameType && !compact && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-beer-amber text-beer-dark px-2 py-0.5 rounded-full text-xs font-party whitespace-nowrap">
                {match.gameType}
              </div>
            )}
          </div>
        </Card>

        {/* Connector Line */}
        {roundIndex < rounds.length - 1 && (
          <svg
            className="absolute top-1/2 -right-6 w-6 h-1"
            style={{ transform: 'translateY(-50%)' }}
          >
            <line
              x1="0"
              y1="0"
              x2="24"
              y2="0"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
            />
          </svg>
        )}
      </motion.div>
    );
  };

  const renderRoundRobin = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`cursor-pointer transition-all ${
                selectedMatch === match.id ? 'ring-2 ring-party-pink shadow-glow' : ''
              }`}
              onClick={() => {
                setSelectedMatch(match.id);
                onMatchClick?.(match);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-party text-white/70">Match {match.id}</span>
                  {getMatchStatus(match).icon ? (
                    <div className={`w-6 h-6 rounded-full ${getMatchStatus(match).bg} flex items-center justify-center`}>
                      {React.createElement(getMatchStatus(match).icon, {
                        className: `w-4 h-4 ${getMatchStatus(match).color}`
                      })}
                    </div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  {renderTeam(match.team1, match.score1, match.winner === match.team1?.id)}
                  <div className="text-center text-xs text-white/50 font-party">VS</div>
                  {renderTeam(match.team2, match.score2, match.winner === match.team2?.id)}
                </div>
                {match.gameType && (
                  <div className="mt-3 text-center">
                    <span className="bg-beer-amber/20 text-beer-amber px-2 py-1 rounded-full text-xs font-party">
                      {match.gameType}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderElimination = () => {
    return (
      <div className="flex gap-8 overflow-x-auto pb-4">
        {rounds.map((round, roundIndex) => (
          <div key={round} className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: roundIndex * 0.1 }}
              className="text-center mb-4"
            >
              <h3 className="font-beer text-xl text-white">
                {ROUND_NAMES[round] || `Round ${round}`}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-party-yellow animate-pulse" />
                <span className="text-sm text-white/70 font-party">
                  {roundMatches[round].length} {roundMatches[round].length === 1 ? 'match' : 'matches'}
                </span>
              </div>
            </motion.div>

            <div 
              className="space-y-4"
              style={{
                marginTop: roundIndex * getMatchSpacing(),
                minHeight: `${(Math.pow(2, rounds.length - roundIndex - 1) * (getMatchHeight() + getMatchSpacing()))}px`
              }}
            >
              {roundMatches[round].map((match) => renderMatch(match, roundIndex))}
            </div>
          </div>
        ))}

        {/* Winner's Podium */}
        {format === 'single_elimination' && rounds.length > 0 && (
          <div className="flex-shrink-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: rounds.length * 0.1, type: 'spring' }}
              className="text-center"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-victory flex items-center justify-center shadow-victory mb-4">
                <Trophy className="w-16 h-16 text-white animate-bounce-in" />
              </div>
              <h3 className="font-beer text-2xl text-white mb-2">Champion</h3>
              {(() => {
                const finalMatch = roundMatches[rounds[rounds.length - 1]]?.[0];
                const winner = finalMatch?.winner ? 
                  teams.find(t => t.id === finalMatch.winner) : null;
                return winner ? (
                  <div className="bg-gradient-party rounded-xl px-4 py-2">
                    <span className="text-white font-party text-lg">
                      {winner.flag} {winner.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-white/50 font-party">TBD</span>
                );
              })()}
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-neutral-900 p-8 overflow-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-beer text-3xl text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-party-yellow" />
            {tournamentName}
          </h2>
          <p className="text-white/70 font-party mt-1">
            {format.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Format
          </p>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
          <Button
            onClick={() => setFullscreen(!fullscreen)}
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10"
          >
            {fullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 mr-2" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tournament Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-party text-white/70">Tournament Progress</span>
          <span className="text-sm font-party text-white">
            {matches.filter(m => m.status === 'completed').length} / {matches.length} matches completed
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <motion.div
            className="bg-gradient-party h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(matches.filter(m => m.status === 'completed').length / matches.length) * 100}%` 
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Bracket Content */}
      <div className={`${fullscreen ? 'h-[calc(100vh-200px)]' : ''} overflow-auto`}>
        {format === 'round_robin' ? renderRoundRobin() : renderElimination()}
      </div>

      {/* Legend */}
      {!compact && (
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-white/70">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-white/70">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-white/70">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-300" />
            <span className="text-white/70">Winner</span>
          </div>
        </div>
      )}
    </div>
  );

  return fullscreen ? content : <Card className="card-party">{content}</Card>;
}