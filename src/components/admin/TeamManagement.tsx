import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { trpc } from '../../utils/trpc';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Users,
  Edit,
  Trash2,
  AlertTriangle,
  Flag,
  Filter
} from 'lucide-react';
import type { Team } from '../../types';

interface TeamManagementProps {
  tournamentId: string;
  onUpdate: () => void;
}

export function TeamManagement({ tournamentId, onUpdate }: TeamManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [actionType, setActionType] = useState<'edit' | 'warn' | 'remove' | null>(null);
  const [editData, setEditData] = useState({
    name: '',
    colorHex: '',
    flagCode: ''
  });
  const [reason, setReason] = useState('');

  // TODO: Replace with actual endpoint when available
  const teams: any[] = [];
  const isLoading = false;

  // Mutations
  const manageTeam = trpc.admin.manageTeam.useMutation({
    onSuccess: () => {
      toast.success('Team action completed successfully');
      setSelectedTeam(null);
      setActionType(null);
      setReason('');
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const filteredTeams = teams?.filter((team: any) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.memberIds.some((id: string) => id.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleAction = (team: Team, action: 'edit' | 'warn' | 'remove') => {
    setSelectedTeam(team);
    setActionType(action);
    if (action === 'edit') {
      setEditData({
        name: team.name,
        colorHex: team.colorHex,
        flagCode: team.flagCode || ''
      });
    }
  };

  const handleSubmitAction = () => {
    if (!selectedTeam || !actionType) return;

    const payload: any = {
      tournamentId,
      teamId: selectedTeam.id,
      action: actionType,
      reason: reason || undefined
    };

    if (actionType === 'edit') {
      payload.updates = editData;
    }

    manageTeam.mutate(payload);
  };

  const getTeamStatusBadge = (team: Team) => {
    if (team.isRemoved) {
      return <Badge variant="destructive">Removed</Badge>;
    }
    if (team.warnings && team.warnings.length > 0) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-400">
        {team.warnings.length} Warning{team.warnings.length > 1 ? 's' : ''}
      </Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-400" />
              Team Management
            </CardTitle>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              {filteredTeams.length} Team{filteredTeams.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search teams or members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <Button variant="outline" className="border-white/20">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teams List */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading teams...</p>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No teams found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredTeams.map((team: any, index: number) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: team.colorHex }}
                        >
                          {team.flagCode || team.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{team.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-400">
                              {team.memberIds.length} member{team.memberIds.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-sm text-gray-400">
                              Created {new Date(team.createdAt).toLocaleDateString()}
                            </span>
                            {getTeamStatusBadge(team)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                          onClick={() => handleAction(team, 'edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                          onClick={() => handleAction(team, 'warn')}
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                          onClick={() => handleAction(team, 'remove')}
                          disabled={team.isRemoved}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Team Details */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Captain:</span>
                          <span className="text-white ml-2">{team.captainId || 'Not assigned'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Matches Played:</span>
                          <span className="text-white ml-2">0</span> {/* TODO: Add actual match count */}
                        </div>
                        <div>
                          <span className="text-gray-400">Win Rate:</span>
                          <span className="text-white ml-2">0%</span> {/* TODO: Add actual win rate */}
                        </div>
                      </div>

                      {team.warnings && team.warnings.length > 0 && (
                        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                          <h4 className="text-yellow-400 text-sm font-semibold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Warnings ({team.warnings.length})
                          </h4>
                          <div className="mt-1 space-y-1">
                            {team.warnings.slice(0, 2).map((warning: any, idx: number) => (
                              <p key={idx} className="text-xs text-yellow-300">
                                {warning.reason} - {new Date(warning.issuedAt).toLocaleDateString()}
                              </p>
                            ))}
                            {team.warnings.length > 2 && (
                              <p className="text-xs text-yellow-400">
                                +{team.warnings.length - 2} more warning{team.warnings.length > 3 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedTeam && !!actionType} onOpenChange={() => {
        setSelectedTeam(null);
        setActionType(null);
        setReason('');
      }}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {actionType === 'edit' && <Edit className="w-5 h-5 text-blue-400" />}
              {actionType === 'warn' && <Flag className="w-5 h-5 text-yellow-400" />}
              {actionType === 'remove' && <Trash2 className="w-5 h-5 text-red-400" />}
              {actionType === 'edit' && 'Edit Team'}
              {actionType === 'warn' && 'Warn Team'}
              {actionType === 'remove' && 'Remove Team'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedTeam && (
              <div className="p-3 bg-white/5 rounded border border-white/10">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: selectedTeam.colorHex }}
                  >
                    {selectedTeam.flagCode || selectedTeam.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedTeam.name}</p>
                    <p className="text-sm text-gray-400">
                      {selectedTeam.memberIds.length} members
                    </p>
                  </div>
                </div>
              </div>
            )}

            {actionType === 'edit' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-400">Team Name</Label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Color</Label>
                  <Input
                    type="color"
                    value={editData.colorHex}
                    onChange={(e) => setEditData({ ...editData, colorHex: e.target.value })}
                    className="bg-white/10 border-white/20 text-white h-12"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Flag Code (optional)</Label>
                  <Input
                    value={editData.flagCode}
                    onChange={(e) => setEditData({ ...editData, flagCode: e.target.value })}
                    placeholder="e.g., 🇺🇸"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            )}

            {(actionType === 'warn' || actionType === 'remove') && (
              <div>
                <Label className="text-gray-400">
                  Reason {actionType === 'remove' ? '(required)' : '(optional)'}
                </Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Enter reason for ${actionType}...`}
                  className="bg-white/10 border-white/20 text-white"
                  rows={3}
                />
              </div>
            )}

            {actionType === 'remove' && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Warning</p>
                    <p className="text-sm text-red-300 mt-1">
                      This action will soft-delete the team. Teams that have played matches cannot be removed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedTeam(null);
                setActionType(null);
                setReason('');
              }}
              className="border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAction}
              disabled={manageTeam.isPending || (actionType === 'remove' && !reason)}
              className={
                actionType === 'edit' ? 'bg-blue-500 hover:bg-blue-600' :
                actionType === 'warn' ? 'bg-yellow-500 hover:bg-yellow-600' :
                'bg-red-500 hover:bg-red-600'
              }
            >
              {manageTeam.isPending ? 'Processing...' : 
               actionType === 'edit' ? 'Save Changes' :
               actionType === 'warn' ? 'Issue Warning' :
               'Remove Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}