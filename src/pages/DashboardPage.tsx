import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Target, Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

export function DashboardPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: tournament } = trpc.tournament.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const { data: upcomingMatches } = trpc.match.getUpcomingMatches.useQuery(
    { tournamentId: slug! },
    { enabled: !!slug }
  );

  const { data: leaderboard } = trpc.leaderboard.list.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const handleSubmitScore = () => {
    toast.info('Score submission modal coming soon!');
  };

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading tournament...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold tracking-tight">{tournament.name}</h1>
        <p className="text-gray-400 mt-2">
          {new Date(tournament.date).toLocaleDateString()}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Matches
              </CardTitle>
              <CardDescription>
                Your next games to play
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMatches && upcomingMatches.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMatches.slice(0, 3).map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-800/50 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">Round {match.round}</p>
                        <p className="text-sm text-gray-400">
                          Station {match.stationId || 'TBD'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleSubmitScore}
                      >
                        Submit Score
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">
                  No upcoming matches yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20">
                <Camera className="w-5 h-5 mr-2" />
                Upload Media
              </Button>
              <Button variant="outline" className="h-20">
                <Trophy className="w-5 h-5 mr-2" />
                Bonus Challenge
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Leaderboard
              </CardTitle>
              <CardDescription>
                Current standings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((team, index) => (
                    <motion.div
                      key={team.teamId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-600">
                          {team.position}
                        </span>
                        <div>
                          <p className="font-medium">{team.teamName}</p>
                          <p className="text-sm text-gray-400">
                            {team.totalPoints} pts
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl">{team.flagCode}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">
                  No scores yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}