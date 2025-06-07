import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Users } from 'lucide-react';
import { trpc } from '@/utils/trpc';

export function DisplayPage() {
  const { slug } = useParams<{ slug: string }>();
  const [currentView, setCurrentView] = useState<'leaderboard' | 'matches'>('leaderboard');

  const { data: leaderboard } = trpc.leaderboard.list.useQuery(
    { slug: slug! },
    { 
      enabled: !!slug,
      refetchInterval: 10000, // Refresh every 10 seconds
    }
  );

  const { data: upcomingMatches } = trpc.match.getUpcomingMatches.useQuery(
    { tournamentId: slug! },
    { 
      enabled: !!slug,
      refetchInterval: 10000,
    }
  );

  const { data: tournament } = trpc.tournament.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  // Auto-rotate views every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => prev === 'leaderboard' ? 'matches' : 'leaderboard');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-3xl">Loading display...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-950 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            {tournament.name}
          </h1>
          <p className="text-2xl text-gray-400 mt-2">
            {new Date(tournament.date).toLocaleDateString()}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentView === 'leaderboard' ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-3 mb-8">
                <Trophy className="w-10 h-10 text-amber-500" />
                <h2 className="text-4xl font-bold">Leaderboard</h2>
              </div>

              {leaderboard && leaderboard.length > 0 ? (
                <div className="grid gap-4">
                  {leaderboard.slice(0, 8).map((team, index) => (
                    <motion.div
                      key={team.teamId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        flex items-center justify-between p-6 rounded-2xl
                        ${index === 0 ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-2 border-yellow-700' : ''}
                        ${index === 1 ? 'bg-gradient-to-r from-gray-800/30 to-gray-700/30 border-2 border-gray-600' : ''}
                        ${index === 2 ? 'bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-2 border-amber-700' : ''}
                        ${index > 2 ? 'bg-gray-900/50 border border-gray-800' : ''}
                      `}
                    >
                      <div className="flex items-center gap-6">
                        <span className="text-5xl font-bold text-gray-500">
                          {team.position}
                        </span>
                        <div className="flex items-center gap-4">
                          <span
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: team.colorHex }}
                          />
                          <h3 className="text-3xl font-bold">{team.teamName}</h3>
                          <span className="text-4xl">{team.flagCode}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold">{team.totalPoints}</p>
                        <p className="text-xl text-gray-400">points</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-3xl text-gray-400 py-16">
                  Tournament starting soon...
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="matches"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-3 mb-8">
                <Clock className="w-10 h-10 text-amber-500" />
                <h2 className="text-4xl font-bold">Upcoming Matches</h2>
              </div>

              {upcomingMatches && upcomingMatches.length > 0 ? (
                <div className="grid gap-4">
                  {upcomingMatches.slice(0, 6).map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-semibold text-gray-400">
                            Round {match.round}
                          </p>
                          <p className="text-3xl font-bold mt-2">
                            Station {match.stationId || 'TBD'}
                          </p>
                        </div>
                        <Users className="w-12 h-12 text-gray-600" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-3xl text-gray-400 py-16">
                  Matches will appear here once scheduled
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}