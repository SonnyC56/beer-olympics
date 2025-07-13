import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy,
  Medal,
  Star,
  Zap,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  Users,
  Target,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TeamStats {
  teamId: string;
  teamName: string;
  colorHex: string;
  flagCode: string;
  position: number;
  previousPosition?: number;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  pointsPerGame: number;
  streak?: { type: 'win' | 'loss'; count: number };
  recentForm: ('W' | 'L')[];
  gameBreakdown: {
    gameId: string;
    gameName: string;
    points: number;
    rank: number;
  }[];
}

interface LiveLeaderboardProps {
  stats: TeamStats[];
  tournamentName: string;
  onTeamClick?: (teamId: string) => void;
  updateInterval?: number;
  showAnimations?: boolean;
  compactMode?: boolean;
}

type SortField = 'position' | 'points' | 'wins' | 'ppg' | 'name';
type ViewMode = 'standard' | 'detailed' | 'compact';

const POSITION_COLORS = {
  1: 'from-yellow-500 to-amber-500',
  2: 'from-gray-400 to-gray-500',
  3: 'from-amber-600 to-amber-700',
};

export default function LiveLeaderboard({
  stats: initialStats,
  onTeamClick,
  updateInterval = 5000,
  showAnimations = true,
  compactMode = false
}: LiveLeaderboardProps) {
  const [stats, setStats] = useState<TeamStats[]>(initialStats);
  const [sortField, setSortField] = useState<SortField>('position');
  const [sortAscending, setSortAscending] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(compactMode ? 'compact' : 'standard');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null);
  const previousStatsRef = useRef<TeamStats[]>(initialStats);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  // Simulate real-time updates for demo
  useEffect(() => {
    if (!showAnimations) return;

    const interval = setInterval(() => {
      setStats(prev => {
        // Store previous positions
        previousStatsRef.current = prev;
        
        // Simulate some random changes
        const updated = prev.map(team => ({
          ...team,
          previousPosition: team.position,
          totalPoints: team.totalPoints + (Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0)
        }));
        
        // Recalculate positions
        updated.sort((a, b) => b.totalPoints - a.totalPoints);
        updated.forEach((team, index) => {
          team.position = index + 1;
        });
        
        return updated;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval, showAnimations]);

  const sortedStats = [...stats]
    .filter(team => 
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.flagCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'position':
          comparison = a.position - b.position;
          break;
        case 'points':
          comparison = b.totalPoints - a.totalPoints;
          break;
        case 'wins':
          comparison = b.wins - a.wins;
          break;
        case 'ppg':
          comparison = b.pointsPerGame - a.pointsPerGame;
          break;
        case 'name':
          comparison = a.teamName.localeCompare(b.teamName);
          break;
      }
      
      return sortAscending ? comparison : -comparison;
    });

  const getPositionChange = (team: TeamStats) => {
    if (!team.previousPosition || team.previousPosition === team.position) {
      return { icon: Minus, color: 'text-gray-400', change: 0 };
    } else if (team.previousPosition > team.position) {
      return { 
        icon: ArrowUp, 
        color: 'text-green-500', 
        change: team.previousPosition - team.position 
      };
    } else {
      return { 
        icon: ArrowDown, 
        color: 'text-red-500', 
        change: team.position - team.previousPosition 
      };
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  const renderTeamRow = (team: TeamStats, index: number) => {
    const positionChange = getPositionChange(team);
    const isExpanded = expandedTeams.has(team.teamId);
    const isHighlighted = highlightedTeam === team.teamId;

    return (
      <motion.div
        key={team.teamId}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: isHighlighted ? 1.02 : 1
        }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.3,
          delay: index * 0.05,
          layout: { duration: 0.5, type: 'spring' }
        }}
        className={`group ${isHighlighted ? 'z-10' : ''}`}
        onMouseEnter={() => setHighlightedTeam(team.teamId)}
        onMouseLeave={() => setHighlightedTeam(null)}
      >
        <div
          className={`relative overflow-hidden rounded-2xl transition-all cursor-pointer
            ${team.position <= 3 ? `bg-gradient-to-r ${POSITION_COLORS[team.position as keyof typeof POSITION_COLORS]} bg-opacity-20` : 'bg-white/10'}
            ${isHighlighted ? 'shadow-glow ring-2 ring-party-pink' : 'hover:bg-white/15'}
          `}
          onClick={() => onTeamClick?.(team.teamId)}
        >
          {/* Animated background for top 3 */}
          {team.position <= 3 && showAnimations && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: [-200, 200],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          )}

          <div className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              {/* Position & Team Info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-white/20">
                    {team.position}
                  </div>
                  {getPositionIcon(team.position)}
                  {positionChange.change > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1"
                    >
                      <positionChange.icon className={`w-4 h-4 ${positionChange.color}`} />
                      <span className={`text-xs font-bold ${positionChange.color}`}>
                        {positionChange.change}
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{ backgroundColor: team.colorHex }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-party text-xl text-white">
                        {team.teamName}
                      </h3>
                      <span className="text-2xl">{team.flagCode}</span>
                    </div>
                    {viewMode === 'detailed' && (
                      <div className="flex items-center gap-3 mt-1 text-sm text-white/70">
                        <span>{team.gamesPlayed} games</span>
                        <span>•</span>
                        <span>{team.wins}W - {team.losses}L</span>
                        {team.streak && (
                          <>
                            <span>•</span>
                            <span className={team.streak.type === 'win' ? 'text-green-400' : 'text-red-400'}>
                              {team.streak.count}{team.streak.type === 'win' ? 'W' : 'L'} streak
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                {viewMode !== 'compact' && (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{team.totalPoints}</p>
                      <p className="text-xs text-white/50 font-party">Points</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">{team.pointsPerGame.toFixed(1)}</p>
                      <p className="text-xs text-white/50 font-party">PPG</p>
                    </div>
                  </>
                )}
                
                {viewMode === 'standard' && team.recentForm.length > 0 && (
                  <div className="flex gap-1">
                    {team.recentForm.slice(-5).map((result, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                          ${result === 'W' ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'}
                        `}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'compact' && (
                  <div className="text-xl font-bold text-white">
                    {team.totalPoints}
                  </div>
                )}

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTeamExpansion(team.teamId);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Expanded Game Breakdown */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-white/20"
                >
                  <h4 className="font-party text-sm text-white/70 mb-3">Game Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {team.gameBreakdown.map((game) => (
                      <div
                        key={game.gameId}
                        className="bg-white/10 rounded-lg p-2 text-center"
                      >
                        <p className="text-xs text-white/70 font-party">{game.gameName}</p>
                        <p className="text-lg font-bold text-white">{game.points}</p>
                        <p className="text-xs text-white/50">Rank #{game.rank}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="card-party">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-beer text-3xl flex items-center gap-3">
            <Trophy className="w-8 h-8 text-party-yellow animate-bounce-in" />
            Live Leaderboard
            {showAnimations && (
              <div className="flex items-center gap-1">
                <Activity className="w-5 h-5 text-green-500 animate-pulse" />
                <span className="text-sm font-party text-green-500">LIVE</span>
              </div>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex bg-white/10 rounded-lg p-1">
              {(['compact', 'standard', 'detailed'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded text-sm font-party capitalize transition-all ${
                    viewMode === mode
                      ? 'bg-gradient-party text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search teams..."
              className="input-party pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="input-party"
            >
              <option value="position">Position</option>
              <option value="points">Total Points</option>
              <option value="wins">Wins</option>
              <option value="ppg">Points Per Game</option>
              <option value="name">Team Name</option>
            </select>
            
            <Button
              onClick={() => setSortAscending(!sortAscending)}
              variant="outline"
              size="icon"
              className="border-white/30 text-white hover:bg-white/10"
            >
              {sortAscending ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Tournament Stats Summary */}
        {viewMode !== 'compact' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Teams', value: stats.length, icon: Users },
              { label: 'Games Played', value: stats.reduce((sum, t) => sum + t.gamesPlayed, 0), icon: Target },
              { label: 'Total Points', value: stats.reduce((sum, t) => sum + t.totalPoints, 0), icon: Star },
              { label: 'Avg PPG', value: (stats.reduce((sum, t) => sum + t.pointsPerGame, 0) / stats.length).toFixed(1), icon: Zap }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 rounded-xl p-3 text-center"
              >
                <stat.icon className="w-6 h-6 text-party-cyan mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/70 font-party">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-2">
          <AnimatePresence>
            {sortedStats.map((team, index) => renderTeamRow(team, index))}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {sortedStats.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/50 font-party">No teams found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}