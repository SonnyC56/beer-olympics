import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Beer, Calendar, Users, Trophy, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/material/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/material/card';
import { TextField } from '@/components/ui/material/text-field';
import { FAB } from '@/components/ui/material/fab';
import { Select } from '@/components/ui/material/select';
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
          <Card variant="elevated" elevation={3} className="material-surface-container-highest material-motion-standard">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 material-primary-container rounded-full flex items-center justify-center material-motion-standard-decelerate">
                <Trophy className="w-8 h-8 material-on-primary-container" />
              </div>
              <div>
                <CardTitle className="material-headline-medium">Sign In Required</CardTitle>
                <CardDescription className="material-body-large">
                  You need to sign in to create a tournament
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={() => signIn()}
                variant="filled"
                size="large"
                fullWidth
                leadingIcon="login"
              >
                Sign In with Google
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                size="large"
                fullWidth
                leadingIcon="arrow_back"
              >
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
            variant="text"
            onClick={() => navigate('/')}
            leadingIcon="arrow_back"
            className="material-on-surface"
          >
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
          <Card variant="elevated" elevation={4} className="material-surface-container-highest material-motion-emphasized">
            <CardHeader className="text-center space-y-6 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="mx-auto w-20 h-20 material-primary-container rounded-full flex items-center justify-center"
              >
                <Trophy className="w-10 h-10 material-on-primary-container" />
              </motion.div>
              <div>
                <CardTitle className="material-display-small">Create Tournament</CardTitle>
                <CardDescription className="material-title-large max-w-md mx-auto">
                  Set up your Beer Olympics event and get ready for epic competition
                </CardDescription>
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant={!isMegaTournament ? "filled" : "outlined"}
                    onClick={() => setIsMegaTournament(false)}
                    leadingIcon="emoji_events"
                  >
                    Single Tournament
                  </Button>
                  <Button
                    variant={isMegaTournament ? "filled" : "outlined"}
                    onClick={() => setIsMegaTournament(true)}
                    leadingIcon="auto_awesome"
                  >
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
                <TextField
                  label="Tournament Name"
                  placeholder="e.g., Summer Beer Olympics 2024"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  leadingIcon="local_activity"
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
                <TextField
                  type="date"
                  label="Tournament Date"
                  value={tournamentDate}
                  onChange={(e) => setTournamentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  fullWidth
                  variant="outlined"
                  leadingIcon="event"
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
                <Select
                  label="Tournament Format"
                  value={tournamentFormat}
                  onValueChange={(value) => setTournamentFormat(value as any)}
                  fullWidth
                  variant="outlined"
                  options={[
                    { value: 'single_elimination', label: 'Single Elimination' },
                    { value: 'double_elimination', label: 'Double Elimination' },
                    { value: 'round_robin', label: 'Round Robin' },
                    { value: 'group_stage', label: 'Group Stage' },
                    { value: 'free_for_all', label: 'Free For All' },
                    { value: 'masters', label: 'Masters' }
                  ]}
                />
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
                <TextField
                  type="number"
                  label="Maximum Teams"
                  min="2"
                  max="128"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(parseInt(e.target.value) || 8)}
                  fullWidth
                  variant="outlined"
                  leadingIcon="groups"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="material-surface-container p-6 rounded-xl border material-outline-variant"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 material-primary" />
                  <span className="material-title-medium">Signed in as: {user.name}</span>
                </div>
                <p className="material-body-medium material-on-surface-variant">
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
                  variant="filled"
                  size="large"
                  fullWidth
                  leadingIcon={isCreating ? "" : "emoji_events"}
                  className="material-motion-standard"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Tournament...
                    </div>
                  ) : (
                    "Create Tournament"
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