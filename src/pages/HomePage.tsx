import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Beer, Trophy, Users, Zap, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';

export function HomePage() {
  const navigate = useNavigate();
  const { user, signIn, signOut } = useAuth();
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
      } catch {
        toast.error('Sign in failed');
      }
    } else {
      navigate('/create');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Beer className="w-8 h-8 text-amber-500" />
            <span className="text-xl font-bold text-white">Beer Olympics</span>
          </motion.div>
          
          {user ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                <User className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="ghost"
                onClick={signIn}
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl w-full mx-auto space-y-16"
        >
          {/* Hero Section */}
          <div className="text-center space-y-8 px-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="inline-block"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-amber-500/30 blur-3xl rounded-full transform scale-150"></div>
                <Beer className="relative w-28 h-28 text-amber-500 mx-auto drop-shadow-2xl" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                Beer Olympics
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
                Transform your backyard games into a professional tournament experience with real-time scoring, epic highlights, and unforgettable competition
              </p>
            </motion.div>
          </div>

          {/* Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4"
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-white mb-2">Join Tournament</CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Enter your tournament code to join the competition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-8 pb-8">
                <Input
                  placeholder="Enter tournament code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  className="text-center text-lg h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-amber-400/50 transition-all duration-200"
                />
                <Button 
                  onClick={handleJoin} 
                  className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  Join Tournament
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-white mb-2">Create Tournament</CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Host your own Beer Olympics event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-8 pb-8">
                <div className="h-14 flex items-center justify-center text-gray-300 bg-white/5 rounded-lg border border-white/10">
                  {user ? 'Ready to create your tournament' : 'Sign in to get started'}
                </div>
                <Button 
                  onClick={handleCreate} 
                  variant="outline"
                  className="w-full h-14 border-white/30 text-white hover:bg-white/10 font-semibold text-lg hover:border-amber-400/50 transition-all duration-200"
                  size="lg"
                >
                  {user ? 'Create New Tournament' : 'Sign In to Create'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-3 gap-8 pt-16"
          >
            {[
              {
                icon: Trophy,
                title: "Real-time Scoring",
                description: "Live leaderboards update instantly as teams compete"
              },
              {
                icon: Users,
                title: "Easy Team Management",
                description: "Quick sign-up flow and beautiful team customization"
              },
              {
                icon: Zap,
                title: "Epic Highlights",
                description: "Auto-generated video reels with bonus challenges"
              }
            ].map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center space-y-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-xl"></div>
                  <feature.icon className="relative w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}