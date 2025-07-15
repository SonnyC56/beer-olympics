import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { Users, Edit, Trash2, AlertTriangle, Flag, Filter } from 'lucide-react';
export function TeamManagement({ tournamentId, onUpdate }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [editData, setEditData] = useState({
        name: '',
        colorHex: '',
        flagCode: ''
    });
    const [reason, setReason] = useState('');
    // TODO: Replace with actual endpoint when available
    const teams = [];
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
    const filteredTeams = teams?.filter((team) => team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.memberIds.some((id) => id.toLowerCase().includes(searchTerm.toLowerCase()))) || [];
    const handleAction = (team, action) => {
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
        if (!selectedTeam || !actionType)
            return;
        const payload = {
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
    const getTeamStatusBadge = (team) => {
        if (team.isRemoved) {
            return _jsx(Badge, { variant: "destructive", children: "Removed" });
        }
        if (team.warnings && team.warnings.length > 0) {
            return _jsxs(Badge, { variant: "outline", className: "border-yellow-500 text-yellow-400", children: [team.warnings.length, " Warning", team.warnings.length > 1 ? 's' : ''] });
        }
        return _jsx(Badge, { variant: "default", children: "Active" });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-white flex items-center gap-3", children: [_jsx(Users, { className: "w-6 h-6 text-purple-400" }), "Team Management"] }), _jsxs(Badge, { className: "bg-blue-500/20 text-blue-400 border-blue-500/50", children: [filteredTeams.length, " Team", filteredTeams.length !== 1 ? 's' : ''] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { placeholder: "Search teams or members...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "bg-white/10 border-white/20 text-white" }) }), _jsxs(Button, { variant: "outline", className: "border-white/20", children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), "Filter"] })] }) })] }), _jsx(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: _jsx(CardContent, { className: "p-0", children: _jsx(ScrollArea, { className: "h-[600px]", children: isLoading ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" }), _jsx("p", { className: "text-gray-400 mt-2", children: "Loading teams..." })] })) : filteredTeams.length === 0 ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx(Users, { className: "w-12 h-12 text-gray-500 mx-auto mb-3" }), _jsx("p", { className: "text-gray-400", children: "No teams found" })] })) : (_jsx("div", { className: "divide-y divide-white/10", children: filteredTeams.map((team, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, className: "p-4 hover:bg-white/5 transition-colors", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold", style: { backgroundColor: team.colorHex }, children: team.flagCode || team.name.charAt(0) }), _jsxs("div", { children: [_jsx("h3", { className: "text-white font-semibold", children: team.name }), _jsxs("div", { className: "flex items-center gap-3 mt-1", children: [_jsxs("span", { className: "text-sm text-gray-400", children: [team.memberIds.length, " member", team.memberIds.length !== 1 ? 's' : ''] }), _jsxs("span", { className: "text-sm text-gray-400", children: ["Created ", new Date(team.createdAt).toLocaleDateString()] }), getTeamStatusBadge(team)] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", className: "border-blue-500/50 text-blue-400 hover:bg-blue-500/20", onClick: () => handleAction(team, 'edit'), children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { size: "sm", variant: "outline", className: "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20", onClick: () => handleAction(team, 'warn'), children: _jsx(Flag, { className: "w-4 h-4" }) }), _jsx(Button, { size: "sm", variant: "outline", className: "border-red-500/50 text-red-400 hover:bg-red-500/20", onClick: () => handleAction(team, 'remove'), disabled: team.isRemoved, children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-white/10", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Captain:" }), _jsx("span", { className: "text-white ml-2", children: team.captainId || 'Not assigned' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Matches Played:" }), _jsx("span", { className: "text-white ml-2", children: "0" }), " "] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Win Rate:" }), _jsx("span", { className: "text-white ml-2", children: "0%" }), " "] })] }), team.warnings && team.warnings.length > 0 && (_jsxs("div", { className: "mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded", children: [_jsxs("h4", { className: "text-yellow-400 text-sm font-semibold flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), "Warnings (", team.warnings.length, ")"] }), _jsxs("div", { className: "mt-1 space-y-1", children: [team.warnings.slice(0, 2).map((warning, idx) => (_jsxs("p", { className: "text-xs text-yellow-300", children: [warning.reason, " - ", new Date(warning.issuedAt).toLocaleDateString()] }, idx))), team.warnings.length > 2 && (_jsxs("p", { className: "text-xs text-yellow-400", children: ["+", team.warnings.length - 2, " more warning", team.warnings.length > 3 ? 's' : ''] }))] })] }))] })] }, team.id))) })) }) }) }), _jsx(Dialog, { open: !!selectedTeam && !!actionType, onOpenChange: () => {
                    setSelectedTeam(null);
                    setActionType(null);
                    setReason('');
                }, children: _jsxs(DialogContent, { className: "bg-gray-900 border-white/20", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "text-white flex items-center gap-2", children: [actionType === 'edit' && _jsx(Edit, { className: "w-5 h-5 text-blue-400" }), actionType === 'warn' && _jsx(Flag, { className: "w-5 h-5 text-yellow-400" }), actionType === 'remove' && _jsx(Trash2, { className: "w-5 h-5 text-red-400" }), actionType === 'edit' && 'Edit Team', actionType === 'warn' && 'Warn Team', actionType === 'remove' && 'Remove Team'] }) }), _jsxs("div", { className: "space-y-4", children: [selectedTeam && (_jsx("div", { className: "p-3 bg-white/5 rounded border border-white/10", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm", style: { backgroundColor: selectedTeam.colorHex }, children: selectedTeam.flagCode || selectedTeam.name.charAt(0) }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-medium", children: selectedTeam.name }), _jsxs("p", { className: "text-sm text-gray-400", children: [selectedTeam.memberIds.length, " members"] })] })] }) })), actionType === 'edit' && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Team Name" }), _jsx(Input, { value: editData.name, onChange: (e) => setEditData({ ...editData, name: e.target.value }), className: "bg-white/10 border-white/20 text-white" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Color" }), _jsx(Input, { type: "color", value: editData.colorHex, onChange: (e) => setEditData({ ...editData, colorHex: e.target.value }), className: "bg-white/10 border-white/20 text-white h-12" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Flag Code (optional)" }), _jsx(Input, { value: editData.flagCode, onChange: (e) => setEditData({ ...editData, flagCode: e.target.value }), placeholder: "e.g., \uD83C\uDDFA\uD83C\uDDF8", className: "bg-white/10 border-white/20 text-white" })] })] })), (actionType === 'warn' || actionType === 'remove') && (_jsxs("div", { children: [_jsxs(Label, { className: "text-gray-400", children: ["Reason ", actionType === 'remove' ? '(required)' : '(optional)'] }), _jsx(Textarea, { value: reason, onChange: (e) => setReason(e.target.value), placeholder: `Enter reason for ${actionType}...`, className: "bg-white/10 border-white/20 text-white", rows: 3 })] })), actionType === 'remove' && (_jsx("div", { className: "p-3 bg-red-500/10 border border-red-500/30 rounded", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-red-400 font-medium", children: "Warning" }), _jsx("p", { className: "text-sm text-red-300 mt-1", children: "This action will soft-delete the team. Teams that have played matches cannot be removed." })] })] }) }))] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "ghost", onClick: () => {
                                        setSelectedTeam(null);
                                        setActionType(null);
                                        setReason('');
                                    }, className: "border-white/20", children: "Cancel" }), _jsx(Button, { onClick: handleSubmitAction, disabled: manageTeam.isPending || (actionType === 'remove' && !reason), className: actionType === 'edit' ? 'bg-blue-500 hover:bg-blue-600' :
                                        actionType === 'warn' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                            'bg-red-500 hover:bg-red-600', children: manageTeam.isPending ? 'Processing...' :
                                        actionType === 'edit' ? 'Save Changes' :
                                            actionType === 'warn' ? 'Issue Warning' :
                                                'Remove Team' })] })] }) })] }));
}
