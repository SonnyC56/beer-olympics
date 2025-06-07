import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useTournamentUpdates } from '@/hooks/usePusher';
import { useCallback } from 'react';

export function LeaderboardPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: tournament, isLoading: tournamentLoading } = trpc.tournament.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );
  
  const { data: leaderboard = [], isLoading: leaderboardLoading, refetch: refetchLeaderboard } = trpc.leaderboard.list.useQuery(
    { slug: slug! },
    { enabled: !!slug, refetchInterval: 30000 } // Refetch every 30 seconds as fallback
  );

  // Real-time updates
  const handleScoreUpdate = useCallback(() => {
    refetchLeaderboard();
  }, [refetchLeaderboard]);

  const handleMatchComplete = useCallback(() => {
    refetchLeaderboard();
  }, [refetchLeaderboard]);

  useTournamentUpdates(slug, {
    onScoreUpdate: handleScoreUpdate,
    onMatchComplete: handleMatchComplete,
  });

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-700" />;
      default:
        return null;
    }
  };

  if (tournamentLoading || leaderboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Tournament not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold tracking-tight mb-2">
          {tournament.name}
        </h1>
        <p className="text-xl text-gray-400">Leaderboard</p>
      </motion.div>

      <div className="space-y-4">
        {leaderboard.map((team, index) => (
          <motion.div
            key={team.teamId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              relative overflow-hidden rounded-2xl p-6
              ${team.position === 1 ? 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-700' : ''}
              ${team.position === 2 ? 'bg-gradient-to-r from-gray-800/20 to-gray-700/20 border border-gray-700' : ''}
              ${team.position === 3 ? 'bg-gradient-to-r from-amber-900/20 to-amber-800/20 border border-amber-700' : ''}
              ${team.position > 3 ? 'bg-gray-900/50 border border-gray-800' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-gray-600">
                    {team.position}
                  </span>
                  {getMedalIcon(team.position)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.colorHex }}
                    />
                    {team.teamName}
                    <span className="text-3xl">{team.flagCode}</span>
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{team.totalPoints}</p>
                <p className="text-sm text-gray-400">points</p>
              </div>
            </div>

            {team.position <= 3 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{
                  x: [-1000, 1000],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 5,
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}