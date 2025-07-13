import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { trpc } from '../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Users,
  Trophy,
  AlertTriangle,
  Settings,
  Shield,
  BarChart3,
  Timer,
  AlertCircle,
  CheckCircle,
  Eye,
  RefreshCw,
  Zap,
  Gauge
} from 'lucide-react';

// Components for different admin sections
import { TournamentControlCenter } from '../components/admin/TournamentControlCenter';
import { ActivityMonitor } from '../components/admin/ActivityMonitor';
import { TeamManagement } from '../components/admin/TeamManagement';
import { MatchOverrides } from '../components/admin/MatchOverrides';
import { AnalyticsPanel } from '../components/admin/AnalyticsPanel';
import { ModerationTools } from '../components/admin/ModerationTools';
import { HostTools } from '../components/admin/HostTools';
import { AdminLog } from '../components/admin/AdminLog';
import { AnnouncementSystem } from '../components/admin/AnnouncementSystem';

export function AdminDashboard() {
  const { slug } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'today' | 'week' | 'month'>('today');

  // Fetch tournament dashboard data
  const { data: dashboard, isLoading, refetch } = trpc.admin.getTournamentDashboard.useQuery(
    { tournamentId: slug! },
    { 
      enabled: !!slug && !!user,
      refetchInterval: 5000 // Auto-refresh every 5 seconds
    }
  );

  // Fetch analytics data
  const { data: analytics } = trpc.admin.getTournamentAnalytics.useQuery(
    { tournamentId: slug!, timeframe: selectedTimeframe },
    { enabled: !!slug && !!user }
  );

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || !dashboard) {
    return <Navigate to="/" replace />;
  }

  const { tournament, stats, recentActivity, subTournamentStats } = dashboard;

  // Calculate real-time metrics
  const completionRate = stats.totalMatches > 0 
    ? Math.round((stats.completedMatches / stats.totalMatches) * 100) 
    : 0;
  
  const isLive = tournament.status === 'IN_PROGRESS';
  const hasIssues = stats.pendingScores > 0 || stats.openDisputes > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">{tournament.name}</p>
              </div>
              {isLive && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  <Activity className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-white/20"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Badge variant={hasIssues ? 'destructive' : 'secondary'}>
                {hasIssues ? (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {stats.pendingScores + stats.openDisputes} Issues
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    All Clear
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Progress</p>
                  <p className="text-3xl font-bold text-white">{completionRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.completedMatches}/{stats.totalMatches} matches
                  </p>
                </div>
                <div className="relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-white/20"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${completionRate * 1.76} 176`}
                      className="text-purple-400"
                    />
                  </svg>
                  <Gauge className="absolute inset-0 w-8 h-8 m-auto text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Teams</p>
                  <p className="text-3xl font-bold text-white">{stats.totalTeams}</p>
                  <p className="text-xs text-gray-500 mt-1">Active teams</p>
                </div>
                <Users className="w-12 h-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Duration</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.round(stats.avgMatchDuration || 0)}m
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Per match</p>
                </div>
                <Timer className="w-12 h-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 border-orange-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {stats.pendingScores + stats.openDisputes}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.pendingScores} scores, {stats.openDisputes} disputes
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/10 backdrop-blur-lg border border-white/20 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="control" className="data-[state=active]:bg-purple-500">
              <Settings className="w-4 h-4 mr-2" />
              Control Center
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-purple-500">
              <Users className="w-4 h-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-purple-500">
              <Trophy className="w-4 h-4 mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-purple-500">
              <Shield className="w-4 h-4 mr-2" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="host" className="data-[state=active]:bg-purple-500">
              <Zap className="w-4 h-4 mr-2" />
              Host Tools
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-purple-500">
              <Eye className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ActivityMonitor 
                    recentActivity={recentActivity}
                    tournamentId={slug!}
                  />
                  {tournament.isMegaTournament && subTournamentStats && (
                    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white">Sub-Tournament Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {subTournamentStats.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{sub.name}</p>
                              <div className="mt-1 bg-white/10 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${(sub.completedMatches / sub.totalMatches) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                            <Badge 
                              variant={sub.isComplete ? 'default' : 'secondary'}
                              className="ml-3"
                            >
                              {sub.completedMatches}/{sub.totalMatches}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
                <AnnouncementSystem tournamentId={slug!} />
              </TabsContent>

              <TabsContent value="control">
                <TournamentControlCenter 
                  tournament={tournament}
                  tournamentId={slug!}
                  onUpdate={() => refetch()}
                />
              </TabsContent>

              <TabsContent value="teams">
                <TeamManagement 
                  tournamentId={slug!}
                  onUpdate={() => refetch()}
                />
              </TabsContent>

              <TabsContent value="matches">
                <MatchOverrides 
                  tournamentId={slug!}
                  onUpdate={() => refetch()}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsPanel 
                  analytics={analytics || undefined}
                  selectedTimeframe={selectedTimeframe}
                  onTimeframeChange={setSelectedTimeframe}
                />
              </TabsContent>

              <TabsContent value="moderation">
                <ModerationTools 
                  tournamentId={slug!}
                  onUpdate={() => refetch()}
                />
              </TabsContent>

              <TabsContent value="host">
                <HostTools 
                  tournamentId={slug!}
                  tournament={tournament}
                  onUpdate={() => refetch()}
                />
              </TabsContent>

              <TabsContent value="logs">
                <AdminLog tournamentId={slug!} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}