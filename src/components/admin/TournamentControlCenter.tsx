import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { trpc } from '../../utils/trpc';
import { toast } from 'sonner';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Lock,
  Unlock,
  Save,
  X,
  Zap
} from 'lucide-react';
import type { Tournament } from '../../types';

interface TournamentControlCenterProps {
  tournament: Tournament;
  tournamentId: string;
  onUpdate: () => void;
}

export function TournamentControlCenter({ 
  tournament, 
  tournamentId, 
  onUpdate 
}: TournamentControlCenterProps) {
  const [editMode, setEditMode] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [settings, setSettings] = useState({
    name: tournament.name,
    date: tournament.date,
    isOpen: tournament.isOpen,
    venue: tournament.settings?.venue || '',
    matchDuration: tournament.settings?.matchDuration || 30,
    breakBetweenMatches: tournament.settings?.breakBetweenMatches || 5,
    allowTies: tournament.settings?.allowTies || false,
    autoAdvance: (tournament.settings?.autoAdvance ?? true) as boolean
  });

  const updateSettings = trpc.admin.updateTournamentSettings.useMutation({
    onSuccess: () => {
      toast.success('Tournament settings updated');
      setEditMode(false);
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // TODO: Add these endpoints to tournament router
  const pauseTournament = {
    mutate: (_params: any) => {
      toast.error('Pause tournament not implemented yet');
    }
  };

  const resumeTournament = {
    mutate: (_params: any) => {
      toast.error('Resume tournament not implemented yet');
    }
  };

  const resetTournament = {
    mutate: (_params: any) => {
      toast.error('Reset tournament not implemented yet');
    }
  };

  const exportData = trpc.admin.exportTournamentData.useQuery(
    { 
      tournamentId,
      format: 'json',
      includePlayerData: true
    },
    { enabled: false }
  );

  const handleSaveSettings = () => {
    updateSettings.mutate({
      tournamentId,
      updates: {
        name: settings.name,
        date: settings.date,
        isOpen: settings.isOpen,
        settings: {
          venue: settings.venue,
          matchDuration: settings.matchDuration,
          breakBetweenMatches: settings.breakBetweenMatches,
          allowTies: settings.allowTies,
          autoAdvance: settings.autoAdvance
        }
      }
    });
  };

  const handleExport = async (format: 'json' | 'csv') => {
    const result = await exportData.refetch();
    if (result.data) {
      const content = format === 'json' 
        ? JSON.stringify(result.data.data, null, 2) 
        : String(result.data.data);
      const blob = new Blob(
        [content],
        { type: format === 'json' ? 'application/json' : 'text/csv' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tournament.name.replace(/\s+/g, '_')}_export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    }
  };

  const statusColor = tournament.status ? {
    'SETUP': 'bg-gray-500',
    'READY': 'bg-blue-500',
    'IN_PROGRESS': 'bg-green-500',
    'PAUSED': 'bg-yellow-500',
    'COMPLETED': 'bg-purple-500'
  }[tournament.status] || 'bg-gray-500' : 'bg-gray-500';

  return (
    <div className="space-y-6">
      {/* Status and Quick Actions */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-400" />
              Tournament Control Center
            </CardTitle>
            <Badge className={`${statusColor} text-white border-0`}>
              {tournament.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            {tournament.status === 'IN_PROGRESS' ? (
              <Button
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                onClick={() => pauseTournament.mutate({ tournamentId })}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause Tournament
              </Button>
            ) : tournament.status === 'PAUSED' ? (
              <Button
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                onClick={() => resumeTournament.mutate({ tournamentId })}
              >
                <Play className="w-4 h-4 mr-2" />
                Resume Tournament
              </Button>
            ) : tournament.status === 'READY' ? (
              <Button
                className="bg-green-500 hover:bg-green-600"
                onClick={() => resumeTournament.mutate({ tournamentId })}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Tournament
              </Button>
            ) : null}

            <Button
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              onClick={() => {
                if (confirm('Are you sure you want to reset the tournament? This will clear all match results.')) {
                  resetTournament.mutate({ tournamentId });
                }
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Tournament
            </Button>

            <Button
              variant="outline"
              className="border-white/20"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>

            <Button
              variant="outline"
              className={`border-white/20 ${tournament.isOpen ? 'text-green-400' : 'text-red-400'}`}
              onClick={() => {
                setSettings({ ...settings, isOpen: !tournament.isOpen });
                updateSettings.mutate({
                  tournamentId,
                  updates: { isOpen: !tournament.isOpen }
                });
              }}
            >
              {tournament.isOpen ? (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Registration Open
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Registration Closed
                </>
              )}
            </Button>
          </div>

          {/* Tournament Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-sm text-gray-400">Tournament ID</p>
              <p className="text-white font-mono">{tournamentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Join Code</p>
              <p className="text-white font-mono text-lg">{tournament.slug}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Format</p>
              <p className="text-white capitalize">{tournament.format.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Created</p>
              <p className="text-white">
                {new Date(tournament.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <Settings className="w-6 h-6 text-purple-400" />
              Tournament Settings
            </CardTitle>
            {!editMode ? (
              <Button
                variant="outline"
                size="sm"
                className="border-white/20"
                onClick={() => setEditMode(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={handleSaveSettings}
                  disabled={updateSettings.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20"
                  onClick={() => {
                    setEditMode(false);
                    setSettings({
                      name: tournament.name,
                      date: tournament.date,
                      isOpen: tournament.isOpen,
                      venue: tournament.settings?.venue || '',
                      matchDuration: tournament.settings?.matchDuration || 30,
                      breakBetweenMatches: tournament.settings?.breakBetweenMatches || 5,
                      allowTies: tournament.settings?.allowTies || false,
                      autoAdvance: (tournament.settings?.autoAdvance ?? true) as boolean
                    });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Tournament Name</Label>
              {editMode ? (
                <Input
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              ) : (
                <p className="text-white mt-1">{tournament.name}</p>
              )}
            </div>
            <div>
              <Label className="text-gray-400">Date</Label>
              {editMode ? (
                <Input
                  type="date"
                  value={settings.date}
                  onChange={(e) => setSettings({ ...settings, date: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              ) : (
                <p className="text-white mt-1">
                  {new Date(tournament.date).toLocaleDateString()}
                </p>
              )}
            </div>
            <div>
              <Label className="text-gray-400">Venue</Label>
              {editMode ? (
                <Input
                  value={settings.venue}
                  onChange={(e) => setSettings({ ...settings, venue: e.target.value })}
                  placeholder="Enter venue"
                  className="bg-white/10 border-white/20 text-white"
                />
              ) : (
                <p className="text-white mt-1">{settings.venue || 'Not specified'}</p>
              )}
            </div>
            <div>
              <Label className="text-gray-400">Match Duration (minutes)</Label>
              {editMode ? (
                <Input
                  type="number"
                  value={settings.matchDuration}
                  onChange={(e) => setSettings({ ...settings, matchDuration: parseInt(e.target.value) })}
                  className="bg-white/10 border-white/20 text-white"
                />
              ) : (
                <p className="text-white mt-1">{settings.matchDuration} minutes</p>
              )}
            </div>
            <div>
              <Label className="text-gray-400">Break Between Matches (minutes)</Label>
              {editMode ? (
                <Input
                  type="number"
                  value={settings.breakBetweenMatches}
                  onChange={(e) => setSettings({ ...settings, breakBetweenMatches: parseInt(e.target.value) })}
                  className="bg-white/10 border-white/20 text-white"
                />
              ) : (
                <p className="text-white mt-1">{settings.breakBetweenMatches} minutes</p>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <Label className="text-gray-400">Allow Ties</Label>
              {editMode ? (
                <Switch
                  checked={settings.allowTies}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowTies: checked })}
                />
              ) : (
                <Badge variant={settings.allowTies ? 'default' : 'secondary'}>
                  {settings.allowTies ? 'Yes' : 'No'}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-400">Auto-Advance Winners</Label>
              {editMode ? (
                <Switch
                  checked={settings.autoAdvance}
                  onCheckedChange={(checked: boolean | 'indeterminate') => setSettings({ ...settings, autoAdvance: checked === true })}
                />
              ) : (
                <Badge variant={settings.autoAdvance ? 'default' : 'secondary'}>
                  {settings.autoAdvance ? 'Yes' : 'No'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Export Tournament Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Choose the format for your tournament data export:
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-white/20"
                onClick={() => handleExport('json')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export as JSON (Complete Data)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-white/20"
                onClick={() => handleExport('csv')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export as CSV (Spreadsheet)
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowExportDialog(false)}
              className="border-white/20"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}