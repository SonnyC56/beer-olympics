import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Settings, 
  Users, 
  Calendar,
  Gamepad2,
  BarChart3,
  MessageSquare,
  ArrowLeft,
  Plus,
  Edit,
  Pause,
  Share2,
  QrCode,
  Download,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import TournamentWizard from '@/components/TournamentWizard';
import GameConfigPanel from '@/components/GameConfigPanel';
import BracketView from '@/components/BracketView';
import LiveLeaderboard from '@/components/LiveLeaderboard';
import SocialFeed from '@/components/SocialFeed';

type TabType = 'overview' | 'bracket' | 'leaderboard' | 'games' | 'teams' | 'feed' | 'settings';

export default function TournamentManagePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showWizard, setShowWizard] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Fetch tournament data
  const { data: tournament, isLoading: tournamentLoading } = trpc.tournament.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const { data: teams = [] } = (trpc.team as any).list.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const { data: matches = [] } = (trpc.match as any).list.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const { data: leaderboard = [] } = trpc.leaderboard.list.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  // Mock data for demo
  const mockStats = leaderboard.map((team) => ({
    ...team,
    gamesPlayed: Math.floor(Math.random() * 5) + 1,
    wins: Math.floor(Math.random() * 5),
    losses: Math.floor(Math.random() * 3),
    pointsPerGame: team.totalPoints / (Math.floor(Math.random() * 5) + 1),
    recentForm: ['W', 'L', 'W', 'W', 'L'].slice(0, Math.floor(Math.random() * 5) + 1) as ('W' | 'L')[],
    gameBreakdown: [
      { gameId: '1', gameName: 'Beer Pong', points: 100, rank: 1 },
      { gameId: '2', gameName: 'Flip Cup', points: 75, rank: 2 },
      { gameId: '3', gameName: 'Cornhole', points: 50, rank: 3 }
    ]
  }));

  const mockPosts = [
    {
      id: '1',
      type: 'result' as const,
      author: {
        id: '1',
        name: 'Tournament Bot',
        isOrganizer: true
      },
      content: 'Epic match just finished!',
      gameData: {
        gameId: '1',
        gameName: 'Beer Pong',
        team1: { name: 'Team Alpha', score: 10, color: '#FF6B6B' },
        team2: { name: 'Team Beta', score: 8, color: '#4ECDC4' },
        winner: 'Team Alpha'
      },
      timestamp: new Date().toISOString(),
      likes: 15,
      comments: [],
      hasLiked: false
    },
    {
      id: '2',
      type: 'achievement' as const,
      author: {
        id: '2',
        name: 'Team Alpha',
        teamId: '1',
        teamName: 'Team Alpha',
        teamColor: '#FF6B6B'
      },
      content: 'What a comeback! Down 5 cups and came back to win!',
      achievement: {
        type: 'comeback' as const,
        title: 'Comeback Kings',
        description: 'Won after being down by 5+ points',
        icon: '🔥'
      },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      likes: 32,
      comments: [
        {
          id: '1',
          author: { id: '3', name: 'Team Beta', avatar: '🍺' },
          content: 'GG! That was insane!',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ],
      hasLiked: true
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Trophy },
    { id: 'bracket', name: 'Bracket', icon: Gamepad2 },
    { id: 'leaderboard', name: 'Leaderboard', icon: BarChart3 },
    { id: 'games', name: 'Games', icon: Settings },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'feed', name: 'Social Feed', icon: MessageSquare },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const _handleStartTournament = () => {
    toast.success('Tournament started! Let the games begin! 🎉');
  };

  const handlePauseTournament = () => {
    toast.info('Tournament paused');
  };

  const handleShareTournament = () => {
    setShowShareModal(true);
    // Copy link to clipboard
    navigator.clipboard.writeText(window.location.href);
    toast.success('Tournament link copied to clipboard!');
  };

  const handleExportData = () => {
    // Export tournament data as JSON
    const data = {
      tournament,
      teams,
      matches,
      leaderboard,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournament?.name || 'tournament'}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Tournament data exported!');
  };

  if (tournamentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-party-yellow animate-bounce mx-auto mb-4" />
          <p className="text-xl font-party text-white animate-pulse">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="card-party max-w-md">
          <CardContent className="text-center py-8">
            <Trophy className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h2 className="text-2xl font-beer text-white mb-2">Tournament Not Found</h2>
            <p className="text-white/70 mb-6">This tournament doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')} className="btn-party">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={handleShareTournament}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={handleExportData}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => toast.info('Notifications coming soon!')}
              variant="outline"
              size="icon"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-beer text-5xl md:text-6xl text-white mb-2 animate-bounce-in">
            {tournament.name}
          </h1>
          <div className="flex items-center justify-center gap-4 text-white/70">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(tournament.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {teams.length} Teams
            </span>
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              {tournament.format.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-party transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-party text-white shadow-glow'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tournament Status */}
              <Card className="card-party lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-beer text-2xl">Tournament Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                      <div>
                        <p className="font-party text-lg text-white">Status</p>
                        <p className="text-2xl font-bold text-green-400">Active</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handlePauseTournament} variant="outline" size="sm">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                        <Button onClick={() => navigate(`/control/${slug}`)} className="btn-party" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Control Room
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Teams', value: teams.length, max: tournament.maxTeams, icon: Users },
                        { label: 'Matches Played', value: matches.filter((m: any) => m.status === 'completed').length, max: matches.length, icon: Gamepad2 },
                        { label: 'Total Points', value: leaderboard.reduce((sum, t) => sum + t.totalPoints, 0), icon: Trophy },
                        { label: 'Active Players', value: teams.length * 2, icon: Users }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/10 rounded-xl p-4 text-center"
                        >
                          <stat.icon className="w-6 h-6 text-party-cyan mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            {stat.value}
                            {stat.max && <span className="text-sm text-white/50">/{stat.max}</span>}
                          </p>
                          <p className="text-xs text-white/70 font-party">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="card-party">
                <CardHeader>
                  <CardTitle className="font-beer text-2xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => navigate(`/leaderboard/${slug}`)} className="w-full btn-party">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Public Leaderboard
                  </Button>
                  <Button 
                    onClick={() => {
                      const qrUrl = `${window.location.origin}/join/${slug}`;
                      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrUrl}`, '_blank');
                    }}
                    variant="outline" 
                    className="w-full border-white/30 text-white hover:bg-white/10"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                  <Button 
                    onClick={() => toast.info('Team registration link copied!')}
                    variant="outline" 
                    className="w-full border-white/30 text-white hover:bg-white/10"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Invite Teams
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('feed')}
                    variant="outline" 
                    className="w-full border-white/30 text-white hover:bg-white/10"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Make Announcement
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="card-party lg:col-span-3">
                <CardHeader>
                  <CardTitle className="font-beer text-2xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <SocialFeed
                    posts={mockPosts.slice(0, 3)}
                    allowPosting={false}
                    onLike={(id) => console.log('Liked:', id)}
                    onComment={(id, comment) => console.log('Comment:', id, comment)}
                    onShare={(id) => console.log('Shared:', id)}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'bracket' && (
            <BracketView
              tournamentName={tournament.name}
              format={tournament.format as any}
              matches={matches.map((m: any) => ({
                ...m,
                team1: teams.find((t: any) => t.id === m.team1Id),
                team2: teams.find((t: any) => t.id === m.team2Id)
              }))}
              teams={teams}
              onMatchClick={(match) => console.log('Match clicked:', match)}
              onRefresh={() => window.location.reload()}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LiveLeaderboard
              stats={mockStats}
              tournamentName={tournament.name}
              onTeamClick={(teamId) => console.log('Team clicked:', teamId)}
              showAnimations={true}
            />
          )}

          {activeTab === 'games' && (
            <GameConfigPanel
              games={['beer-pong', 'flip-cup', 'cornhole']}
              onSave={(configs) => {
                console.log('Game configs saved:', configs);
                toast.success('Game configurations saved!');
              }}
            />
          )}

          {activeTab === 'teams' && (
            <div className="space-y-6">
              <Card className="card-party">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-beer text-2xl">Teams Management</CardTitle>
                    <Button onClick={() => toast.info('Add team feature coming soon!')} className="btn-party">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team: any, index: number) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: team.colorHex }}
                          />
                          <div>
                            <h3 className="font-party text-lg text-white">{team.name}</h3>
                            <p className="text-sm text-white/70">{team.flagCode}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">Players: 2</span>
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'feed' && (
            <SocialFeed
              posts={mockPosts}
              currentUserId="organizer"
              allowPosting={true}
              onPostCreate={(post) => {
                console.log('New post:', post);
                toast.success('Post created!');
              }}
              onLike={(id) => console.log('Liked:', id)}
              onComment={(id, comment) => console.log('Comment:', id, comment)}
              onShare={(id) => console.log('Shared:', id)}
            />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card className="card-party">
                <CardHeader>
                  <CardTitle className="font-beer text-2xl">Tournament Settings</CardTitle>
                  <CardDescription className="text-white/70">
                    Manage your tournament configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-xl">
                      <h3 className="font-party text-lg text-white mb-2">Edit Tournament</h3>
                      <p className="text-sm text-white/70 mb-4">
                        Update tournament details, format, and rules
                      </p>
                      <Button 
                        onClick={() => setShowWizard(true)}
                        className="btn-party"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Settings
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                      <h3 className="font-party text-lg text-red-400 mb-2">Danger Zone</h3>
                      <p className="text-sm text-white/70 mb-4">
                        These actions cannot be undone
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => toast.error('Tournament reset is not available in demo')}
                        >
                          Reset Tournament
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => toast.error('Tournament deletion is not available in demo')}
                        >
                          Delete Tournament
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tournament Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWizard(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <TournamentWizard
                onComplete={(data) => {
                  console.log('Tournament updated:', data);
                  setShowWizard(false);
                  toast.success('Tournament settings updated!');
                }}
                onCancel={() => setShowWizard(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}