import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { trpc } from '../../utils/trpc';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Trophy,
  Edit,
  AlertTriangle,
  Shield,
  Eye
} from 'lucide-react';
import type { Match } from '../../types';

interface MatchOverridesProps {
  tournamentId: string;
  onUpdate: () => void;
}

export function MatchOverrides({ tournamentId, onUpdate }: MatchOverridesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'disputed'>('all');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [overrideData, setOverrideData] = useState({
    winnerId: '',
    scoreA: 0,
    scoreB: 0,
    reason: ''
  });

  // TODO: Replace with actual endpoint when available
  const matches: any[] = [];
  const isLoading = false;

  // Override mutation
  const overrideMatch = trpc.admin.overrideMatch.useMutation({
    onSuccess: () => {
      toast.success('Match result overridden successfully');
      setSelectedMatch(null);
      setOverrideData({ winnerId: '', scoreA: 0, scoreB: 0, reason: '' });
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const filteredMatches = matches?.filter((match: any) => {
    const matchesSearch = 
      match.teamAName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.teamBName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.eventName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !match.isComplete) ||
      (statusFilter === 'completed' && match.isComplete && !match.hasDispute) ||
      (statusFilter === 'disputed' && match.hasDispute);

    return matchesSearch && matchesStatus;
  }) || [];

  const handleOverrideMatch = (match: Match) => {
    setSelectedMatch(match);
    setOverrideData({
      winnerId: match.winner || match.teamA || '',
      scoreA: match.finalScore?.a || 0,
      scoreB: match.finalScore?.b || 0,
      reason: ''
    });
  };

  const handleSubmitOverride = () => {
    if (!selectedMatch) return;

    overrideMatch.mutate({
      tournamentId,
      matchId: selectedMatch.id,
      winnerId: overrideData.winnerId,
      score: {
        a: overrideData.scoreA,
        b: overrideData.scoreB
      },
      reason: overrideData.reason
    });
  };

  const getMatchStatusBadge = (match: Match) => {
    if (match.adminOverride) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">Overridden</Badge>;
    }
    if (match.hasDispute) {
      return <Badge variant="destructive">Disputed</Badge>;
    }
    if (match.isComplete) {
      return <Badge variant="default">Completed</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <Trophy className="w-6 h-6 text-purple-400" />
              Match Overrides
            </CardTitle>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              {filteredMatches.length} Match{filteredMatches.length !== 1 ? 'es' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search matches, teams, or events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="all">All Matches</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Matches List */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading matches...</p>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No matches found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredMatches.map((match: any, index: number) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <h3 className="text-white font-semibold">{match.teamAName}</h3>
                            <div className="text-2xl font-bold text-purple-400">
                              {match.finalScore?.a || 0}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400 text-sm">VS</div>
                            <Trophy className="w-6 h-6 text-gray-400 mx-auto" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-white font-semibold">{match.teamBName}</h3>
                            <div className="text-2xl font-bold text-purple-400">
                              {match.finalScore?.b || 0}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                          <span>{match.eventName}</span>
                          <span>•</span>
                          <span>Round {match.round}</span>
                          {match.scheduledTime && (
                            <>
                              <span>•</span>
                              <span>{new Date(match.scheduledTime).toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getMatchStatusBadge(match)}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                          onClick={() => handleOverrideMatch(match)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Override
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Additional match info */}
                    {(match.adminOverride || match.hasDispute) && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        {match.adminOverride && (
                          <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded mb-2">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-orange-400" />
                              <span className="text-orange-400 font-medium">Admin Override</span>
                            </div>
                            <p className="text-sm text-orange-300 mt-1">
                              {match.adminOverride.reason}
                            </p>
                            <p className="text-xs text-orange-200 mt-1">
                              By admin on {new Date(match.adminOverride.overriddenAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {match.hasDispute && (
                          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 font-medium">Disputed Result</span>
                            </div>
                            <p className="text-sm text-red-300 mt-1">
                              This match result is under dispute and may need review.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Override Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-purple-400" />
              Override Match Result
            </DialogTitle>
          </DialogHeader>

          {selectedMatch && (
            <div className="space-y-4">
              {/* Match Summary */}
              <div className="p-3 bg-white/5 rounded border border-white/10">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-white font-medium">{selectedMatch.teamAName}</p>
                    <div className="text-lg font-bold text-purple-400">
                      {selectedMatch.finalScore?.a || 0}
                    </div>
                  </div>
                  <div className="text-gray-400">VS</div>
                  <div className="text-center">
                    <p className="text-white font-medium">{selectedMatch.teamBName}</p>
                    <div className="text-lg font-bold text-purple-400">
                      {selectedMatch.finalScore?.b || 0}
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-400 mt-2">
                  {selectedMatch.eventName} • Round {selectedMatch.round}
                </div>
              </div>

              {/* Winner Selection */}
              <div>
                <Label className="text-gray-400">Winner</Label>
                <Select value={overrideData.winnerId} onValueChange={(value) => 
                  setOverrideData({ ...overrideData, winnerId: value })
                }>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select winner" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    {selectedMatch.teamA && <SelectItem value={selectedMatch.teamA}>{selectedMatch.teamAName || 'Team A'}</SelectItem>}
                    {selectedMatch.teamB && <SelectItem value={selectedMatch.teamB}>{selectedMatch.teamBName || 'Team B'}</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              {/* Score Override */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">{selectedMatch.teamAName} Score</Label>
                  <Input
                    type="number"
                    min="0"
                    value={overrideData.scoreA}
                    onChange={(e) => setOverrideData({ 
                      ...overrideData, 
                      scoreA: parseInt(e.target.value) || 0 
                    })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">{selectedMatch.teamBName} Score</Label>
                  <Input
                    type="number"
                    min="0"
                    value={overrideData.scoreB}
                    onChange={(e) => setOverrideData({ 
                      ...overrideData, 
                      scoreB: parseInt(e.target.value) || 0 
                    })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <Label className="text-gray-400">Reason for Override (required)</Label>
                <Textarea
                  value={overrideData.reason}
                  onChange={(e) => setOverrideData({ ...overrideData, reason: e.target.value })}
                  placeholder="Explain why this match result is being overridden..."
                  className="bg-white/10 border-white/20 text-white"
                  rows={3}
                />
              </div>

              {/* Warning */}
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-medium">Override Warning</p>
                    <p className="text-sm text-yellow-300 mt-1">
                      This will permanently override the match result and create an audit log entry. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSelectedMatch(null)}
              className="border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOverride}
              disabled={overrideMatch.isPending || !overrideData.reason || !overrideData.winnerId}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {overrideMatch.isPending ? 'Overriding...' : 'Override Match'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}