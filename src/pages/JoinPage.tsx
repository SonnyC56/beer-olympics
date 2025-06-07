import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Flag, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth';
import { api } from '@/utils/api';
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
  const { user, signIn } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0]);
  const [selectedFlag, setSelectedFlag] = useState(FLAGS[0]);
  const [userName, setUserName] = useState('');

  const [tournament, setTournament] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (slug) {
      loadTournament();
    }
  }, [slug]);

  const loadTournament = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTournament(slug!);
      setTournament(data);
    } catch (error) {
      console.error('Failed to load tournament:', error);
      setTournament(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    if (!user && !userName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      let userId = user?.id;
      let userDisplayName = user?.name || userName;

      if (!user) {
        // Create a temporary user
        userId = 'temp-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('tempUser', JSON.stringify({
          id: userId,
          name: userName,
        }));
      }

      setIsJoining(true);
      try {
        await api.joinTeam({
          slug: slug!,
          teamName: teamName,
          colorHex: selectedColor.hex,
          flagCode: selectedFlag,
          userId: userId!,
          userName: userDisplayName,
        });
        
        toast.success('Team created successfully!');
        navigate(`/dashboard/${slug}`);
      } catch (error) {
        toast.error('Failed to create team');
        console.error('Join team error:', error);
      } finally {
        setIsJoining(false);
      }
    } catch (error) {
      toast.error('Failed to join tournament');
    }
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Join {tournament.name}</CardTitle>
            <CardDescription>
              Create your team and start competing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!user && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Name
              </label>
              <Input
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Team Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TEAM_COLORS.map((color) => (
                  <motion.button
                    key={color.hex}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedColor(color)}
                    className={`h-12 rounded-xl transition-all ${
                      selectedColor.hex === color.hex
                        ? 'ring-2 ring-offset-2 ring-offset-gray-900'
                        : ''
                    }`}
                    style={{ 
                      backgroundColor: color.hex
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Team Flag
              </label>
              <div className="grid grid-cols-6 gap-2">
                {FLAGS.map((flag) => (
                  <motion.button
                    key={flag}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFlag(flag)}
                    className={`text-2xl p-2 rounded-xl transition-all ${
                      selectedFlag === flag
                        ? 'bg-gray-800 ring-2 ring-amber-500'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    {flag}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              {!user && (
                <Button
                  variant="outline"
                  onClick={signIn}
                  className="flex-1"
                >
                  Sign In
                </Button>
              )}
              <Button
                onClick={handleJoin}
                disabled={isJoining}
                className="flex-1"
                size="lg"
              >
                {isJoining ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}