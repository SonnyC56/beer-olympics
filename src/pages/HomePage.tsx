import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Beer, Trophy, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';

export function HomePage() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a tournament code');
      return;
    }
    navigate(`/join/${joinCode.trim()}`);
  };

  const handleCreate = async () => {
    if (!user) {
      try {
        await signIn();
        navigate('/create');
      } catch (error) {
        toast.error('Sign in failed');
      }
    } else {
      navigate('/create');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-8"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-block"
          >
            <Beer className="w-20 h-20 text-amber-500 mx-auto" />
          </motion.div>
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Beer Olympics
          </h1>
          <p className="text-xl text-gray-400">
            Turn your backyard tournament into a pro-grade experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Join Tournament</CardTitle>
              <CardDescription>
                Enter the tournament code to join your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter tournament code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                className="text-center text-lg"
              />
              <Button onClick={handleJoin} className="w-full" size="lg">
                Join Tournament
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Tournament</CardTitle>
              <CardDescription>
                Start your own Beer Olympics event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreate} 
                variant="secondary" 
                className="w-full"
                size="lg"
              >
                {user ? 'Create New Tournament' : 'Sign In to Create'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center space-y-2"
          >
            <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="font-semibold">Real-time Scoring</h3>
            <p className="text-sm text-gray-400">
              Live leaderboards and brackets
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center space-y-2"
          >
            <Users className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="font-semibold">Team Management</h3>
            <p className="text-sm text-gray-400">
              Easy sign-up and team creation
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center space-y-2"
          >
            <Zap className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="font-semibold">Bonus Challenges</h3>
            <p className="text-sm text-gray-400">
              One-tap bonuses and media capture
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}