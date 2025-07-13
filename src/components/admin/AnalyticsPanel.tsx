import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Trophy,
  Target,
  Award,
  Activity,
  Zap,
  Calendar
} from 'lucide-react';

interface AnalyticsPanelProps {
  analytics: any; // TODO: Add proper type
  selectedTimeframe: 'all' | 'today' | 'week' | 'month';
  onTimeframeChange: (timeframe: any) => void; // TODO: Fix type to match Select component
}

export function AnalyticsPanel({ 
  analytics, 
  selectedTimeframe, 
  onTimeframeChange 
}: AnalyticsPanelProps) {
  if (!analytics) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading analytics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { teamPerformance, matchTrends, playerStats, eventPopularity, engagement } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Tournament Analytics
            </CardTitle>
            <Select value={selectedTimeframe} onValueChange={onTimeframeChange}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Players</p>
                  <p className="text-3xl font-bold text-white">{playerStats.totalPlayers || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Active participants</p>
                </div>
                <Users className="w-12 h-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Win Rate</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.round((playerStats.avgWinRate || 0) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Player average</p>
                </div>
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Engagement Rate</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.round((1 - (engagement.disputeRate || 0) / 100) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Score agreement</p>
                </div>
                <Activity className="w-12 h-12 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Score Reports</p>
                  <p className="text-3xl font-bold text-white">{engagement.totalScoreSubmissions || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Total submissions</p>
                </div>
                <Target className="w-12 h-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Team Performance */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Team Performance Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamPerformance && teamPerformance.length > 0 ? (
              teamPerformance.slice(0, 10).map((team: any, index: number) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: team.colorHex }}
                    />
                    <div>
                      <p className="text-white font-medium">{team.name}</p>
                      <p className="text-sm text-gray-400">
                        {team.matchesPlayed} matches played
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-green-400 font-bold">{team.wins}</p>
                      <p className="text-xs text-gray-400">Wins</p>
                    </div>
                    <div>
                      <p className="text-purple-400 font-bold">{Math.round(team.avgPoints || 0)}</p>
                      <p className="text-xs text-gray-400">Avg Score</p>
                    </div>
                    <div>
                      <p className="text-blue-400 font-bold">
                        {team.matchesPlayed > 0 ? Math.round((team.wins / team.matchesPlayed) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-400">Win Rate</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No team performance data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Award className="w-6 h-6 text-purple-400" />
              Event Popularity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventPopularity && eventPopularity.length > 0 ? (
                eventPopularity.map((event: any, index: number) => (
                  <motion.div
                    key={`${event.name}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">{event.name}</p>
                      <p className="text-sm text-gray-400 capitalize">{event.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-400 font-bold">{event.timesPlayed}</p>
                      <p className="text-xs text-gray-400">Matches</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No event data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-green-400" />
              Match Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matchTrends && matchTrends.length > 0 ? (
                matchTrends.slice(-7).map((trend: any, index: number) => (
                  <motion.div
                    key={trend.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {new Date(trend.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        {Math.round(trend.avgDuration || 0)}m avg duration
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-bold">{trend.matchesCompleted}</p>
                      <p className="text-xs text-gray-400">Completed</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No trend data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-purple-400" />
            Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {engagement.uniqueScoreReporters || 0}
              </div>
              <p className="text-gray-400">Unique Reporters</p>
              <p className="text-xs text-gray-500 mt-1">Players submitting scores</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {Math.round((1 - (engagement.disputeRate || 0) / 100) * 100)}%
              </div>
              <p className="text-gray-400">Agreement Rate</p>
              <p className="text-xs text-gray-500 mt-1">Non-disputed scores</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {engagement.matchesWithMedia || 0}
              </div>
              <p className="text-gray-400">Matches w/ Media</p>
              <p className="text-xs text-gray-500 mt-1">Photos/videos attached</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}