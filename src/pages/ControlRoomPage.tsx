import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Users, Calendar, Trophy, Lock, Unlock, Copy, ExternalLink, ArrowLeft, Beer, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';

export function ControlRoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isClosing, setIsClosing] = useState(false);

  const { data: tournament } = trpc.tournament.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const { data: teams } = trpc.tournament.listTeams.useQuery(
    { tournamentId: slug! },
    { enabled: !!slug }
  );

  const setOpen = trpc.tournament.setOpen.useMutation({
    onSuccess: () => {
      toast.success(tournament?.isOpen ? 'Registration closed' : 'Registration opened');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleToggleRegistration = async () => {
    if (!tournament) return;
    
    setIsClosing(true);
    try {
      await setOpen.mutateAsync({
        slug: slug!,
        isOpen: !tournament.isOpen,
      });
    } finally {
      setIsClosing(false);
    }
  };

  const handleGenerateSchedule = () => {
    toast.info('Schedule generation coming soon!');
  };

  const handleGenerateHighlight = () => {
    toast.info('Highlight reel generation coming soon!');
  };

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading control room...</div>
      </div>
    );
  }

  // Check if user is owner
  if (user?.id !== tournament.ownerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xl text-center">Access denied</p>
            <p className="text-gray-400 text-center mt-2">
              Only the tournament owner can access this page
            </p>
            <Button 
              onClick={() => navigate(`/dashboard/${slug}`)} 
              className="w-full mt-4"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20">
      {/* Header */}
      <header className="px-6 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div className="flex items-center gap-2">
              <Beer className="w-6 h-6 text-amber-500" />
              <span className="text-lg font-bold text-white">Beer Olympics</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-3">Control Room</h1>
          <p className="text-2xl text-amber-400 font-medium">{tournament.name}</p>
          <p className="text-gray-400 mt-2">
            Tournament Date: {new Date(tournament.date).toLocaleDateString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-white text-2xl">
                  <Users className="w-6 h-6 text-amber-400" />
                  Registered Teams
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  {teams?.length || 0} teams ready to compete
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teams && teams.length > 0 ? (
                  <div className="space-y-4">
                    {teams.map((team, index) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-6 h-6 rounded-full ring-2 ring-white/20 shadow-lg"
                            style={{ 
                              backgroundColor: team.colorHex,
                              boxShadow: `0 0 20px ${team.colorHex}40`
                            }}
                          />
                          <div>
                            <span className="font-semibold text-white text-lg">{team.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-2xl">{team.flagCode}</span>
                              <span className="text-sm text-gray-400">
                                {team.memberIds.length} member{team.memberIds.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Team #{index + 1}</div>
                          <div className="text-xs text-gray-500">
                            Created {new Date(team.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-xl text-gray-400 mb-2">No teams registered yet</p>
                    <p className="text-gray-500">Share the join link to get teams signed up!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <Settings className="w-5 h-5 text-amber-400" />
                  Registration Control
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Control who can join the tournament
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleToggleRegistration}
                  disabled={isClosing}
                  variant={tournament.isOpen ? 'destructive' : 'default'}
                  className={`w-full h-12 font-semibold transition-all duration-200 ${
                    tournament.isOpen 
                      ? 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-500/25' 
                      : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/25'
                  }`}
                >
                  {tournament.isOpen ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Close Registration
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Open Registration
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Tournament Actions
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Generate schedules and highlights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleGenerateSchedule}
                  variant="outline"
                  className="w-full h-12 border-white/30 text-white hover:bg-white/10 hover:border-amber-400/50 transition-all duration-200"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Generate Schedule
                </Button>
                <Button
                  onClick={handleGenerateHighlight}
                  variant="outline"
                  className="w-full h-12 border-white/30 text-white hover:bg-white/10 hover:border-amber-400/50 transition-all duration-200"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Generate Highlight Reel
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <ExternalLink className="w-5 h-5 text-amber-400" />
                  Quick Navigation
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Access tournament pages and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-11 text-white hover:bg-white/10 hover:text-amber-400 transition-all duration-200"
                  onClick={() => navigate(`/leaderboard/${slug}`)}
                >
                  <Trophy className="w-4 h-4 mr-3" />
                  View Leaderboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-11 text-white hover:bg-white/10 hover:text-amber-400 transition-all duration-200"
                  onClick={() => navigate(`/display/${slug}`)}
                >
                  <ExternalLink className="w-4 h-4 mr-3" />
                  TV Display Mode
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-11 text-white hover:bg-white/10 hover:text-amber-400 transition-all duration-200"
                  onClick={() => {
                    const url = `${window.location.origin}/join/${slug}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Join link copied!');
                  }}
                >
                  <Copy className="w-4 h-4 mr-3" />
                  Copy Join Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}