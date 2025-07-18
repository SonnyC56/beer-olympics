import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Flag, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TextField } from '@mui/material';
import { useAuth } from '@/context/auth';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

const TEAM_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Teal', hex: '#14b8a6' },
];

const FLAGS = ['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇮🇹', '🇪🇸', '🇲🇽', '🇧🇷', '🏴‍☠️', '🏁'];

export function JoinPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, signIn, signOut } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0]);
  const [selectedFlag, setSelectedFlag] = useState(FLAGS[0]);
  const [userName, setUserName] = useState('');

  const [isJoining, setIsJoining] = useState(false);

  const { data: tournament, isLoading } = trpc.tournament.getBySlug.useQuery(
    { slug: slug! },
    { 
      enabled: !!slug,
      retry: 1
    }
  );
  
  // Log the current slug
  console.log('Current slug:', slug);
  
  // Log tournament data when loaded
  if (tournament) {
    console.log('Tournament loaded:', tournament);
  }

  const joinTeamMutation = trpc.legacyTeam.joinPublic.useMutation({
    onSuccess: () => {
      toast.success('Team created successfully!');
      navigate(`/dashboard/${slug}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create team: ${error.message}`);
      console.error('Join team error:', error);
    },
    onSettled: () => {
      setIsJoining(false);
    },
  });

  const handleJoin = async () => {
    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    if (!user && !userName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    let userId = user?.id;
    const userDisplayName = user?.name || userName;

    if (!user) {
      // Create a temporary user
      userId = 'temp-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('tempUser', JSON.stringify({
        id: userId,
        name: userName,
      }));
    }

    setIsJoining(true);
    joinTeamMutation.mutate({
      slug: slug!,
      teamName: teamName,
      colorHex: selectedColor.hex,
      flagCode: selectedFlag,
      userId: userId!,
      userName: userDisplayName,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading tournament...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xl text-center">Tournament not found</p>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full mt-4"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tournament.isOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xl text-center">Registration is closed</p>
            <Button 
              onClick={() => navigate(`/leaderboard/${slug}`)} 
              className="w-full mt-4"
            >
              View Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center"
            >
              <span className="text-2xl">🏆</span>
            </motion.div>
            <div>
              <CardTitle className="text-3xl text-white mb-2">Join {tournament.name}</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Create your team and start competing in the ultimate backyard championship
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <label className="text-sm font-medium text-gray-300">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Team Name
              </label>
              <TextField
                label="Team Name"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                fullWidth
                variant="outlined"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                Team Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {TEAM_COLORS.map((color) => (
                  <motion.button
                    key={color.hex}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedColor(color)}
                    className={`h-14 rounded-xl material-motion-standard shadow-lg ${
                      selectedColor.hex === color.hex
                        ? 'ring-3 ring-primary ring-offset-2 ring-offset-surface'
                        : 'hover:scale-105'
                    }`}
                    style={{ 
                      backgroundColor: color.hex,
                      boxShadow: selectedColor.hex === color.hex 
                        ? `var(--md-sys-elevation-level3)` 
                        : `var(--md-sys-elevation-level1)`
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-400" />
                Team Flag
              </label>
              <div className="grid grid-cols-6 gap-2">
                {FLAGS.map((flag) => (
                  <motion.button
                    key={flag}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFlag(flag)}
                    className={`text-2xl p-3 rounded-xl material-motion-standard ${
                      selectedFlag === flag
                        ? 'material-primary-container ring-2 ring-primary shadow-lg'
                        : 'material-surface-variant hover:material-surface-container'
                    }`}
                  >
                    {flag}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-4"
            >
              {user && (
                <Card variant="outlined" className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="material-label-medium material-on-surface-variant">Signed in as:</p>
                      <p className="material-title-medium truncate">{user.name}</p>
                    </div>
                    <Button
                      variant="text"
                      onClick={signOut}
                      size="small"
                      leadingIcon="logout"
                    >
                      Sign Out
                    </Button>
                  </div>
                </Card>
              )}
              
              <div className="flex gap-3">
                {!user && (
                  <Button
                    variant="outlined"
                    onClick={() => signIn()}
                    size="large"
                    className="flex-1"
                    leadingIcon="login"
                  >
                    Sign In
                  </Button>
                )}
                <Button
                  onClick={handleJoin}
                  disabled={isJoining}
                  variant="filled"
                  size="large"
                  className={`material-motion-standard ${!user ? 'flex-1' : 'w-full'}`}
                  leadingIcon={isJoining ? "" : "group_add"}
                >
                  {isJoining ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Team'
                  )}
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}