import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Target, Camera, Tv } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/material/card';
import { Button } from '@/components/ui/material/button';
import { FAB } from '@/components/ui/material/fab';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { isMobileDevice } from '@/utils/responsive';
import { MobileLayout, MobilePlayerDashboard, QuickActions } from '@/components/mobile';
import { useEffect, useState } from 'react';

export function DashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(isMobileDevice());
    
    const handleResize = () => setIsMobile(isMobileDevice());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const { data: tournament, isLoading: tournamentLoading } = trpc.tournament.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );
  
  const { data: upcomingMatches = [] } = trpc.match.getUpcomingMatches.useQuery(
    { tournamentId: slug! },
    { enabled: !!slug }
  );
  
  const { data: leaderboard = [] } = trpc.leaderboard.list.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const handleSubmitScore = () => {
    toast.info('Score submission modal coming soon!');
  };

  const handleSpectatorMode = () => {
    navigate(`/spectator/${slug}`);
  };

  if (tournamentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading tournament...</div>
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

  // Mobile view
  if (isMobile) {
    const playerStats = {
      wins: 0, // TODO: Calculate from match data
      losses: 0, // TODO: Calculate from match data
      totalGames: 0, // TODO: Calculate from match data
      rank: 1,
      totalPlayers: leaderboard.length,
      winStreak: 0,
    };

    const recentMatches: any[] = []; // TODO: Get from API
    const nextMatch = upcomingMatches[0] ? {
      id: upcomingMatches[0].id,
      opponent: 'Opponent Team', // TODO: Get actual opponent
      game: 'Beer Pong',
      time: new Date(),
      location: `Station ${upcomingMatches[0].stationId}`,
    } : undefined;

    return (
      <MobileLayout tournamentSlug={slug}>
        <MobilePlayerDashboard
          playerName="Player Name" // TODO: Get from auth
          teamName="Team Name" // TODO: Get from tournament data
          teamColor="#3b82f6"
          nextMatch={nextMatch}
          stats={playerStats}
          recentMatches={recentMatches}
        />
      </MobileLayout>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen p-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="material-display-medium">{tournament.name}</h1>
        <p className="material-body-large material-on-surface-variant mt-2">
          {new Date(tournament.date).toLocaleDateString()}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" elevation={2} className="material-motion-standard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 material-primary" />
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
                      className="p-4 material-surface-container rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="material-title-medium">Round {match.round}</p>
                        <p className="material-body-small material-on-surface-variant">
                          Station {match.stationId || 'TBD'}
                        </p>
                      </div>
                      <Button
                        variant="tonal"
                        size="small"
                        onClick={handleSubmitScore}
                        leadingIcon="scoreboard"
                      >
                        Submit Score
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center material-body-large material-on-surface-variant py-8">
                  No upcoming matches yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card variant="elevated" elevation={2} className="material-motion-standard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 material-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button 
                variant="elevated" 
                className="h-20 flex-col gap-2" 
                fullWidth
                onClick={handleSpectatorMode}
              >
                <Tv className="w-6 h-6" />
                Spectator Mode
              </Button>
              <Button variant="elevated" className="h-20 flex-col gap-2" fullWidth>
                <Camera className="w-6 h-6" />
                Upload Media
              </Button>
              <Button variant="elevated" className="h-20 flex-col gap-2" fullWidth>
                <Trophy className="w-6 h-6" />
                Bonus Challenge
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card variant="elevated" elevation={3} className="material-motion-emphasized">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 material-primary" />
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
                      className="flex items-center justify-between p-3 material-surface-container rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-display-small material-on-surface-variant">
                          {team.position}
                        </span>
                        <div>
                          <p className="material-title-medium">{team.teamName}</p>
                          <p className="material-body-small material-on-surface-variant">
                            {team.totalPoints} pts
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl">{team.flagCode}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center material-body-large material-on-surface-variant py-8">
                  No scores yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Floating Action Button for quick score submission */}
      <FAB
        icon="edit_square"
        label="Submit Score"
        onClick={handleSubmitScore}
        variant="primary"
        size="large"
        position="bottom-right"
      />
    </div>
  );
}