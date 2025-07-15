import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { Play, Pause, RotateCcw, Download, Settings, Lock, Unlock, Save, X, Zap } from 'lucide-react';
export function TournamentControlCenter({ tournament, tournamentId, onUpdate }) {
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
        autoAdvance: (tournament.settings?.autoAdvance ?? true)
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
        mutate: (_params) => {
            toast.error('Pause tournament not implemented yet');
        }
    };
    const resumeTournament = {
        mutate: (_params) => {
            toast.error('Resume tournament not implemented yet');
        }
    };
    const resetTournament = {
        mutate: (_params) => {
            toast.error('Reset tournament not implemented yet');
        }
    };
    const exportData = trpc.admin.exportTournamentData.useQuery({
        tournamentId,
        format: 'json',
        includePlayerData: true
    }, { enabled: false });
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
    const handleExport = async (format) => {
        const result = await exportData.refetch();
        if (result.data) {
            const content = format === 'json'
                ? JSON.stringify(result.data.data, null, 2)
                : String(result.data.data);
            const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-white flex items-center gap-3", children: [_jsx(Zap, { className: "w-6 h-6 text-purple-400" }), "Tournament Control Center"] }), _jsx(Badge, { className: `${statusColor} text-white border-0`, children: tournament.status })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap gap-3", children: [tournament.status === 'IN_PROGRESS' ? (_jsxs(Button, { variant: "outline", className: "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20", onClick: () => pauseTournament.mutate({ tournamentId }), children: [_jsx(Pause, { className: "w-4 h-4 mr-2" }), "Pause Tournament"] })) : tournament.status === 'PAUSED' ? (_jsxs(Button, { variant: "outline", className: "border-green-500/50 text-green-400 hover:bg-green-500/20", onClick: () => resumeTournament.mutate({ tournamentId }), children: [_jsx(Play, { className: "w-4 h-4 mr-2" }), "Resume Tournament"] })) : tournament.status === 'READY' ? (_jsxs(Button, { className: "bg-green-500 hover:bg-green-600", onClick: () => resumeTournament.mutate({ tournamentId }), children: [_jsx(Play, { className: "w-4 h-4 mr-2" }), "Start Tournament"] })) : null, _jsxs(Button, { variant: "outline", className: "border-red-500/50 text-red-400 hover:bg-red-500/20", onClick: () => {
                                            if (confirm('Are you sure you want to reset the tournament? This will clear all match results.')) {
                                                resetTournament.mutate({ tournamentId });
                                            }
                                        }, children: [_jsx(RotateCcw, { className: "w-4 h-4 mr-2" }), "Reset Tournament"] }), _jsxs(Button, { variant: "outline", className: "border-white/20", onClick: () => setShowExportDialog(true), children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Data"] }), _jsx(Button, { variant: "outline", className: `border-white/20 ${tournament.isOpen ? 'text-green-400' : 'text-red-400'}`, onClick: () => {
                                            setSettings({ ...settings, isOpen: !tournament.isOpen });
                                            updateSettings.mutate({
                                                tournamentId,
                                                updates: { isOpen: !tournament.isOpen }
                                            });
                                        }, children: tournament.isOpen ? (_jsxs(_Fragment, { children: [_jsx(Unlock, { className: "w-4 h-4 mr-2" }), "Registration Open"] })) : (_jsxs(_Fragment, { children: [_jsx(Lock, { className: "w-4 h-4 mr-2" }), "Registration Closed"] })) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Tournament ID" }), _jsx("p", { className: "text-white font-mono", children: tournamentId })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Join Code" }), _jsx("p", { className: "text-white font-mono text-lg", children: tournament.slug })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Format" }), _jsx("p", { className: "text-white capitalize", children: tournament.format.replace('_', ' ') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Created" }), _jsx("p", { className: "text-white", children: new Date(tournament.createdAt).toLocaleString() })] })] })] })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-white flex items-center gap-3", children: [_jsx(Settings, { className: "w-6 h-6 text-purple-400" }), "Tournament Settings"] }), !editMode ? (_jsxs(Button, { variant: "outline", size: "sm", className: "border-white/20", onClick: () => setEditMode(true), children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Edit"] })) : (_jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", className: "bg-green-500 hover:bg-green-600", onClick: handleSaveSettings, disabled: updateSettings.isPending, children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save"] }), _jsx(Button, { size: "sm", variant: "outline", className: "border-white/20", onClick: () => {
                                                setEditMode(false);
                                                setSettings({
                                                    name: tournament.name,
                                                    date: tournament.date,
                                                    isOpen: tournament.isOpen,
                                                    venue: tournament.settings?.venue || '',
                                                    matchDuration: tournament.settings?.matchDuration || 30,
                                                    breakBetweenMatches: tournament.settings?.breakBetweenMatches || 5,
                                                    allowTies: tournament.settings?.allowTies || false,
                                                    autoAdvance: (tournament.settings?.autoAdvance ?? true)
                                                });
                                            }, children: _jsx(X, { className: "w-4 h-4" }) })] }))] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Tournament Name" }), editMode ? (_jsx(Input, { value: settings.name, onChange: (e) => setSettings({ ...settings, name: e.target.value }), className: "bg-white/10 border-white/20 text-white" })) : (_jsx("p", { className: "text-white mt-1", children: tournament.name }))] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Date" }), editMode ? (_jsx(Input, { type: "date", value: settings.date, onChange: (e) => setSettings({ ...settings, date: e.target.value }), className: "bg-white/10 border-white/20 text-white" })) : (_jsx("p", { className: "text-white mt-1", children: new Date(tournament.date).toLocaleDateString() }))] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Venue" }), editMode ? (_jsx(Input, { value: settings.venue, onChange: (e) => setSettings({ ...settings, venue: e.target.value }), placeholder: "Enter venue", className: "bg-white/10 border-white/20 text-white" })) : (_jsx("p", { className: "text-white mt-1", children: settings.venue || 'Not specified' }))] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Match Duration (minutes)" }), editMode ? (_jsx(Input, { type: "number", value: settings.matchDuration, onChange: (e) => setSettings({ ...settings, matchDuration: parseInt(e.target.value) }), className: "bg-white/10 border-white/20 text-white" })) : (_jsxs("p", { className: "text-white mt-1", children: [settings.matchDuration, " minutes"] }))] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Break Between Matches (minutes)" }), editMode ? (_jsx(Input, { type: "number", value: settings.breakBetweenMatches, onChange: (e) => setSettings({ ...settings, breakBetweenMatches: parseInt(e.target.value) }), className: "bg-white/10 border-white/20 text-white" })) : (_jsxs("p", { className: "text-white mt-1", children: [settings.breakBetweenMatches, " minutes"] }))] })] }), _jsxs("div", { className: "space-y-3 pt-4 border-t border-white/10", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "text-gray-400", children: "Allow Ties" }), editMode ? (_jsx(Switch, { checked: settings.allowTies, onCheckedChange: (checked) => setSettings({ ...settings, allowTies: checked }) })) : (_jsx(Badge, { variant: settings.allowTies ? 'default' : 'secondary', children: settings.allowTies ? 'Yes' : 'No' }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "text-gray-400", children: "Auto-Advance Winners" }), editMode ? (_jsx(Switch, { checked: settings.autoAdvance, onCheckedChange: (checked) => setSettings({ ...settings, autoAdvance: checked === true }) })) : (_jsx(Badge, { variant: settings.autoAdvance ? 'default' : 'secondary', children: settings.autoAdvance ? 'Yes' : 'No' }))] })] })] })] }), _jsx(Dialog, { open: showExportDialog, onOpenChange: setShowExportDialog, children: _jsxs(DialogContent, { className: "bg-gray-900 border-white/20", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "text-white", children: "Export Tournament Data" }) }), _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-gray-400", children: "Choose the format for your tournament data export:" }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { variant: "outline", className: "w-full justify-start border-white/20", onClick: () => handleExport('json'), children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export as JSON (Complete Data)"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start border-white/20", onClick: () => handleExport('csv'), children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export as CSV (Spreadsheet)"] })] })] }), _jsx(DialogFooter, { children: _jsx(Button, { variant: "ghost", onClick: () => setShowExportDialog(false), className: "border-white/20", children: "Cancel" }) })] }) })] }));
}
