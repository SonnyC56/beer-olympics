import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useTournamentUpdates } from '@/hooks/useRealtime';
import { useCallback } from 'react';
import { Card } from '@/components/ui/material/card';
import { Chip } from '@/components/ui/material/chip';

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
        <h1 className="material-display-large mb-2">
          {tournament.name}
        </h1>
        <p className="material-headline-medium material-on-surface-variant">Leaderboard</p>
      </motion.div>

      <div className="space-y-4">
        {leaderboard.map((team, index) => (
          <motion.div
            key={team.teamId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              variant="elevated" 
              elevation={team.position <= 3 ? 3 : 1}
              className={`
                relative overflow-hidden p-6 material-motion-standard
                ${team.position === 1 ? 'material-gold-container' : ''}
                ${team.position === 2 ? 'material-silver-container' : ''}
                ${team.position === 3 ? 'material-bronze-container' : ''}
                ${team.position > 3 ? 'material-surface-container' : ''}
              `}
            >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="material-display-medium material-on-surface-variant">
                    {team.position}
                  </span>
                  {getMedalIcon(team.position)}
                </div>
                <div>
                  <h3 className="material-headline-medium flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full material-motion-standard"
                      style={{ backgroundColor: team.colorHex }}
                    />
                    {team.teamName}
                    <span className="material-headline-large">{team.flagCode}</span>
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <p className="material-display-small">{team.totalPoints}</p>
                <p className="material-label-medium material-on-surface-variant">points</p>
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
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}