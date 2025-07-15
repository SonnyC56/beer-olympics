import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  MdTrendingUp, 
  MdSportsScore, 
  MdGroup, 
  MdTimer,
  MdEmojiEvents,
  MdSpeed,
  MdLocalFireDepartment,
  MdShowChart
} from 'react-icons/md';
import { trpc } from '../utils/trpc';

interface TournamentStatsProps {
  tournamentId: string;
  compact?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
  };
  color?: string;
  compact?: boolean;
}

function StatCard({ icon, label, value, trend, color = 'primary', compact = false }: StatCardProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
        <div className="flex items-center gap-2">
          <div className={`text-${color}`}>{icon}</div>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="text-right">
          <p className="font-semibold">{value}</p>
          {trend && (
            <p className={`text-xs ${trend.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}/10`}>
          <div className={`text-xl text-${color}`}>{icon}</div>
        </div>
        {trend && (
          <Badge variant={trend.value > 0 ? 'default' : 'secondary'} className="text-xs">
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </Badge>
        )}
      </div>
      
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-muted-foreground">{label}</p>
      
      {trend && (
        <p className="text-xs text-muted-foreground mt-1">
          {trend.label}
        </p>
      )}
    </Card>
  );
}

export function TournamentStats({ tournamentId, compact = false }: TournamentStatsProps) {
  const { data: stats } = trpc.tournament.getStats.useQuery(
    { tournamentId },
    { 
      refetchInterval: 30000 // Update every 30 seconds
    }
  );

  const { data: leaderboard } = trpc.tournament.getLeaderboard.useQuery(
    { tournamentId },
    { 
      refetchInterval: 30000
    }
  );

  if (!stats) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
      </Card>
    );
  }

  // Calculate additional stats
  const completionRate = stats.totalMatches > 0 
    ? Math.round((stats.completedMatches / stats.totalMatches) * 100)
    : 0;

  const avgMatchDuration = stats.avgMatchDuration || 15; // minutes
  const remainingTime = (stats.totalMatches - stats.completedMatches) * avgMatchDuration;
  const hoursRemaining = Math.floor(remainingTime / 60);
  const minutesRemaining = remainingTime % 60;

  // Find hot streaks
  const hotTeam = leaderboard?.[0];

  if (compact) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <MdShowChart className="text-primary" />
          Tournament Stats
        </h3>
        
        <StatCard
          icon={<MdSportsScore />}
          label="Matches"
          value={`${stats.completedMatches}/${stats.totalMatches}`}
          compact
        />
        
        <StatCard
          icon={<MdGroup />}
          label="Teams"
          value={stats.activeTeams}
          compact
        />
        
        <StatCard
          icon={<MdTimer />}
          label="Time Left"
          value={`${hoursRemaining}h ${minutesRemaining}m`}
          compact
        />
        
        {hotTeam && (
          <StatCard
            icon={<MdLocalFireDepartment />}
            label="Leading"
            value={hotTeam.name}
            color="orange"
            compact
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MdShowChart className="text-primary" />
          Tournament Statistics
        </h2>
        <Badge variant="outline">
          Live Updates
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<MdSportsScore />}
          label="Matches Completed"
          value={`${stats.completedMatches}/${stats.totalMatches}`}
          trend={{
            value: completionRate,
            label: "completion"
          }}
        />
        
        <StatCard
          icon={<MdGroup />}
          label="Active Teams"
          value={stats.activeTeams}
          color="blue"
        />
        
        <StatCard
          icon={<MdTimer />}
          label="Avg Match Time"
          value={`${avgMatchDuration}m`}
          trend={stats.matchDurationTrend ? {
            value: stats.matchDurationTrend,
            label: "vs last hour"
          } : undefined}
          color="purple"
        />
        
        <StatCard
          icon={<MdEmojiEvents />}
          label="Games Played"
          value={stats.uniqueGamesPlayed || 0}
          color="orange"
        />
      </div>

      {/* Performance Insights */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MdTrendingUp className="text-green-500" />
          Performance Insights
        </h3>
        
        <div className="space-y-3">
          {/* Leading Team */}
          {hotTeam && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 rounded-lg bg-primary/10"
            >
              <div className="flex items-center gap-3">
                <MdLocalFireDepartment className="text-orange-500 text-xl" />
                <div>
                  <p className="font-medium">{hotTeam.name} is on fire!</p>
                  <p className="text-sm text-muted-foreground">
                    {hotTeam.wins} wins • {hotTeam.points} points
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-orange-500">
                #1
              </Badge>
            </motion.div>
          )}
          
          
          
          {/* Time Estimate */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-card">
            <div className="flex items-center gap-3">
              <MdTimer className="text-blue-500 text-xl" />
              <div>
                <p className="font-medium">Estimated time remaining</p>
                <p className="text-sm text-muted-foreground">
                  Based on current pace
                </p>
              </div>
            </div>
            <span className="font-semibold">
              {hoursRemaining}h {minutesRemaining}m
            </span>
          </div>
        </div>
      </Card>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Tournament Progress</span>
          <span className="text-sm text-muted-foreground">{completionRate}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </Card>
    </div>
  );
}