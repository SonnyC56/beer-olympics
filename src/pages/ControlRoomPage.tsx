import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Users, Calendar, Trophy, Lock, Unlock } from 'lucide-react';
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
    <div className="min-h-screen p-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-amber-500" />
          <h1 className="text-4xl font-bold tracking-tight">Control Room</h1>
        </div>
        <p className="text-gray-400">{tournament.name}</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Teams
            </CardTitle>
            <CardDescription>
              {teams?.length || 0} teams registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teams && teams.length > 0 ? (
              <div className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: team.colorHex }}
                      />
                      <span className="font-medium">{team.name}</span>
                      <span className="text-xl">{team.flagCode}</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {team.memberIds.length} members
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">
                No teams registered yet
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
              <CardDescription>
                Control who can join the tournament
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleToggleRegistration}
                disabled={isClosing}
                variant={tournament.isOpen ? 'destructive' : 'default'}
                className="w-full"
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

          <Card>
            <CardHeader>
              <CardTitle>Tournament Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleGenerateSchedule}
                variant="outline"
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Generate Schedule
              </Button>
              <Button
                onClick={handleGenerateHighlight}
                variant="outline"
                className="w-full"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Generate Highlight Reel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate(`/leaderboard/${slug}`)}
              >
                View Leaderboard
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate(`/display/${slug}`)}
              >
                TV Display Mode
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  const url = `${window.location.origin}/join/${slug}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Join link copied!');
                }}
              >
                Copy Join Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}