import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Beer, Calendar, Users, Trophy, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { MegaTournamentCreator } from '@/components/MegaTournamentCreator';

export function CreateTournamentPage() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentDate, setTournamentDate] = useState('');
  const [tournamentFormat, setTournamentFormat] = useState<'single_elimination' | 'double_elimination' | 'round_robin' | 'group_stage' | 'free_for_all' | 'masters'>('single_elimination');
  const [maxTeams, setMaxTeams] = useState(8);
  const [isCreating, setIsCreating] = useState(false);
  const [isMegaTournament, setIsMegaTournament] = useState(false);

  const createTournamentMutation = trpc.tournament.create.useMutation({
    onSuccess: (data) => {
      toast.success('Tournament created successfully!');
      navigate(`/control/${data.slug}`);
    },
    onError: (error) => {
      toast.error(`Failed to create tournament: ${error.message}`);
    },
    onSettled: () => {
      setIsCreating(false);
    },
  });

  const handleCreate = async () => {
    if (!user) {
      try {
        await signIn();
      } catch {
        toast.error('Please sign in to create a tournament');
        return;
      }
    }

    if (!tournamentName.trim()) {
      toast.error('Please enter a tournament name');
      return;
    }

    if (!tournamentDate) {
      toast.error('Please select a tournament date');
      return;
    }

    setIsCreating(true);
    createTournamentMutation.mutate({
      name: tournamentName.trim(),
      date: tournamentDate,
      format: tournamentFormat,
      maxTeams: maxTeams,
      settings: {
        allowTies: false,
        pointsPerWin: 3,
        pointsPerLoss: 0,
        tiebreakMethod: 'head2head',
        autoAdvance: true,
        bronzeMatch: false,
        seedingMethod: 'random'
      }
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white mb-2">Sign In Required</CardTitle>
                <CardDescription className="text-gray-300">
                  You need to sign in to create a tournament
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={() => signIn()}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
              >
                Sign In with Google
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full h-12 border-white/30 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20">
      {/* Header */}
      <header className="px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10 border border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Beer className="w-6 h-6 text-amber-500" />
            <span className="text-lg font-bold text-white">Beer Olympics</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-6 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-4xl text-white mb-3">Create Tournament</CardTitle>
                <CardDescription className="text-gray-300 text-lg max-w-md mx-auto">
                  Set up your Beer Olympics event and get ready for epic competition
                </CardDescription>
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant={!isMegaTournament ? "default" : "outline"}
                    onClick={() => setIsMegaTournament(false)}
                    className={!isMegaTournament ? "bg-amber-500 hover:bg-amber-600" : "border-white/30 text-white hover:bg-white/10"}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Single Tournament
                  </Button>
                  <Button
                    variant={isMegaTournament ? "default" : "outline"}
                    onClick={() => setIsMegaTournament(true)}
                    className={isMegaTournament ? "bg-amber-500 hover:bg-amber-600" : "border-white/30 text-white hover:bg-white/10"}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Mega Tournament
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-8">
              {isMegaTournament ? (
                <div className="bg-transparent">
                  <MegaTournamentCreator />
                </div>
              ) : (
                <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Beer className="w-4 h-4 text-amber-400" />
                  Tournament Name
                </label>
                <Input
                  placeholder="e.g., Summer Beer Olympics 2024"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-amber-400/50 transition-all duration-200"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Tournament Date
                </label>
                <Input
                  type="date"
                  value={tournamentDate}
                  onChange={(e) => setTournamentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-14 text-lg bg-white/10 border-white/20 text-white focus:bg-white/20 focus:border-amber-400/50 transition-all duration-200"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="space-y-3"
              >
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Tournament Format
                </label>
                <select
                  value={tournamentFormat}
                  onChange={(e) => setTournamentFormat(e.target.value as any)}
                  className="h-14 w-full text-lg bg-white/10 border border-white/20 text-white focus:bg-white/20 focus:border-amber-400/50 transition-all duration-200 rounded-md px-3"
                >
                  <option value="single_elimination" className="bg-gray-800 text-white">Single Elimination</option>
                  <option value="double_elimination" className="bg-gray-800 text-white">Double Elimination</option>
                  <option value="round_robin" className="bg-gray-800 text-white">Round Robin</option>
                  <option value="group_stage" className="bg-gray-800 text-white">Group Stage</option>
                  <option value="free_for_all" className="bg-gray-800 text-white">Free For All</option>
                  <option value="masters" className="bg-gray-800 text-white">Masters</option>
                </select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.47 }}
                className="space-y-3"
              >
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Maximum Teams
                </label>
                <Input
                  type="number"
                  min="2"
                  max="128"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(parseInt(e.target.value) || 8)}
                  className="h-14 text-lg bg-white/10 border-white/20 text-white focus:bg-white/20 focus:border-amber-400/50 transition-all duration-200"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-white">Signed in as: {user.name}</span>
                </div>
                <p className="text-sm text-green-400">
                  You'll be the tournament organizer and can manage teams, scoring, and settings.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4"
              >
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Tournament...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5" />
                      Create Tournament
                    </div>
                  )}
                </Button>
              </motion.div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}