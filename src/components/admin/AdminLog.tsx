import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { trpc } from '../../utils/trpc';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Eye,
  Download,
  RefreshCw,
  Shield,
  Users,
  Trophy,
  Settings,
  Flag,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  FileText
} from 'lucide-react';

interface AdminLogProps {
  tournamentId: string;
}

export function AdminLog({ tournamentId }: AdminLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [limit, setLimit] = useState(50);

  // Fetch admin log
  const { data: adminLog, isPending: isLoading, refetch } = trpc.admin.getAdminLog.useQuery(
    { tournamentId, limit },
    { enabled: !!tournamentId }
  );

  const filteredLog = adminLog?.filter(entry => {
    const matchesSearch = 
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.adminName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = actionFilter === 'all' || entry.action === actionFilter;

    return matchesSearch && matchesFilter;
  }) || [];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'override_match':
        return <Trophy className="w-4 h-4 text-purple-400" />;
      case 'remove':
      case 'edit':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'warn':
        return <Flag className="w-4 h-4 text-yellow-400" />;
      case 'update_settings':
        return <Settings className="w-4 h-4 text-green-400" />;
      case 'broadcast':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'override_match':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'remove':
        return 'border-red-500/30 bg-red-500/10';
      case 'edit':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'warn':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'update_settings':
        return 'border-green-500/30 bg-green-500/10';
      case 'broadcast':
        return 'border-orange-500/30 bg-orange-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const formatActionText = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const exportLog = () => {
    if (!adminLog || adminLog.length === 0) {
      return;
    }

    const csvContent = [
      ['Timestamp', 'Admin', 'Action', 'Target Type', 'Target ID', 'Reason'],
      ...adminLog.map(entry => [
        new Date(entry.timestamp).toISOString(),
        entry.adminName || entry.adminId,
        entry.action,
        entry.targetType || '',
        entry.targetId || '',
        entry.reason || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_log_${tournamentId}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uniqueActions = Array.from(new Set(adminLog?.map(entry => entry.action) || []));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <Eye className="w-6 h-6 text-purple-400" />
              Admin Activity Log
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                {filteredLog.length} Entries
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="border-white/20"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportLog}
                className="border-white/20"
                disabled={!adminLog || adminLog.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search logs by action, reason, or admin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {formatActionText(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="25">25 entries</SelectItem>
                <SelectItem value="50">50 entries</SelectItem>
                <SelectItem value="100">100 entries</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-0">
          <ScrollArea className="h-[700px]">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading admin log...</p>
              </div>
            ) : filteredLog.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No admin actions found</p>
                <p className="text-sm text-gray-500">
                  {searchTerm || actionFilter !== 'all' 
                    ? 'Try adjusting your search criteria'
                    : 'Admin actions will appear here'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredLog.map((entry, index) => (
                  <motion.div
                    key={`${entry.timestamp}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Action Icon */}
                      <div className={`p-2 rounded-lg border ${getActionColor(entry.action)}`}>
                        {getActionIcon(entry.action)}
                      </div>

                      {/* Action Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">
                            {formatActionText(entry.action)}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {entry.targetType || 'system'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Admin:</span>
                            <span className="text-white">{entry.adminName || entry.adminId}</span>
                          </div>
                          
                          {entry.targetId && (
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">Target:</span>
                              <span className="text-white font-mono text-xs">
                                {entry.targetId.slice(0, 8)}...
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Time:</span>
                            <span className="text-white">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {entry.reason && (
                          <div className="mt-3 p-2 bg-white/5 rounded border border-white/10">
                            <p className="text-sm text-gray-300">{entry.reason}</p>
                          </div>
                        )}

                        {entry.data && (
                          <details className="mt-3">
                            <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
                              View Technical Details
                            </summary>
                            <div className="mt-2 p-2 bg-black/20 rounded border border-white/10">
                              <pre className="text-xs text-gray-300 overflow-x-auto">
                                {JSON.stringify(entry.data, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </div>

                      {/* Status Indicator */}
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Actions</p>
                <p className="text-2xl font-bold text-white">{adminLog?.length || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Match Overrides</p>
                <p className="text-2xl font-bold text-white">
                  {adminLog?.filter(e => e.action === 'override_match').length || 0}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Team Actions</p>
                <p className="text-2xl font-bold text-white">
                  {adminLog?.filter(e => e.targetType === 'team').length || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Today's Actions</p>
                <p className="text-2xl font-bold text-white">
                  {adminLog?.filter(e => 
                    new Date(e.timestamp).toDateString() === new Date().toDateString()
                  ).length || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}