import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { Trophy, Edit, AlertTriangle, Shield, Eye } from 'lucide-react';
export function MatchOverrides({ tournamentId, onUpdate }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [overrideData, setOverrideData] = useState({
        winnerId: '',
        scoreA: 0,
        scoreB: 0,
        reason: ''
    });
    // TODO: Replace with actual endpoint when available
    const matches = [];
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
    const filteredMatches = matches?.filter((match) => {
        const matchesSearch = match.teamAName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.teamBName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.eventName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'pending' && !match.isComplete) ||
            (statusFilter === 'completed' && match.isComplete && !match.hasDispute) ||
            (statusFilter === 'disputed' && match.hasDispute);
        return matchesSearch && matchesStatus;
    }) || [];
    const handleOverrideMatch = (match) => {
        setSelectedMatch(match);
        setOverrideData({
            winnerId: match.winner || match.teamA || '',
            scoreA: match.finalScore?.a || 0,
            scoreB: match.finalScore?.b || 0,
            reason: ''
        });
    };
    const handleSubmitOverride = () => {
        if (!selectedMatch)
            return;
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
    const getMatchStatusBadge = (match) => {
        if (match.adminOverride) {
            return _jsx(Badge, { className: "bg-orange-500/20 text-orange-400 border-orange-500/50", children: "Overridden" });
        }
        if (match.hasDispute) {
            return _jsx(Badge, { variant: "destructive", children: "Disputed" });
        }
        if (match.isComplete) {
            return _jsx(Badge, { variant: "default", children: "Completed" });
        }
        return _jsx(Badge, { variant: "secondary", children: "Pending" });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-white flex items-center gap-3", children: [_jsx(Trophy, { className: "w-6 h-6 text-purple-400" }), "Match Overrides"] }), _jsxs(Badge, { className: "bg-blue-500/20 text-blue-400 border-blue-500/50", children: [filteredMatches.length, " Match", filteredMatches.length !== 1 ? 'es' : ''] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { placeholder: "Search matches, teams, or events...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "bg-white/10 border-white/20 text-white" }) }), _jsxs(Select, { value: statusFilter, onValueChange: (value) => setStatusFilter(value), children: [_jsx(SelectTrigger, { className: "w-48 bg-white/10 border-white/20 text-white", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { className: "bg-gray-900 border-white/20", children: [_jsx(SelectItem, { value: "all", children: "All Matches" }), _jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "disputed", children: "Disputed" })] })] })] }) })] }), _jsx(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: _jsx(CardContent, { className: "p-0", children: _jsx(ScrollArea, { className: "h-[600px]", children: isLoading ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" }), _jsx("p", { className: "text-gray-400 mt-2", children: "Loading matches..." })] })) : filteredMatches.length === 0 ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx(Trophy, { className: "w-12 h-12 text-gray-500 mx-auto mb-3" }), _jsx("p", { className: "text-gray-400", children: "No matches found" })] })) : (_jsx("div", { className: "divide-y divide-white/10", children: filteredMatches.map((match, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, className: "p-4 hover:bg-white/5 transition-colors", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-white font-semibold", children: match.teamAName }), _jsx("div", { className: "text-2xl font-bold text-purple-400", children: match.finalScore?.a || 0 })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-gray-400 text-sm", children: "VS" }), _jsx(Trophy, { className: "w-6 h-6 text-gray-400 mx-auto" })] }), _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-white font-semibold", children: match.teamBName }), _jsx("div", { className: "text-2xl font-bold text-purple-400", children: match.finalScore?.b || 0 })] })] }), _jsxs("div", { className: "flex items-center gap-4 mt-3 text-sm text-gray-400", children: [_jsx("span", { children: match.eventName }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Round ", match.round] }), match.scheduledTime && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(match.scheduledTime).toLocaleString() })] }))] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [getMatchStatusBadge(match), _jsxs(Button, { size: "sm", variant: "outline", className: "border-purple-500/50 text-purple-400 hover:bg-purple-500/20", onClick: () => handleOverrideMatch(match), children: [_jsx(Edit, { className: "w-4 h-4 mr-2" }), "Override"] }), _jsx(Button, { size: "sm", variant: "outline", className: "border-white/20", children: _jsx(Eye, { className: "w-4 h-4" }) })] })] }), (match.adminOverride || match.hasDispute) && (_jsxs("div", { className: "mt-3 pt-3 border-t border-white/10", children: [match.adminOverride && (_jsxs("div", { className: "p-2 bg-orange-500/10 border border-orange-500/30 rounded mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4 text-orange-400" }), _jsx("span", { className: "text-orange-400 font-medium", children: "Admin Override" })] }), _jsx("p", { className: "text-sm text-orange-300 mt-1", children: match.adminOverride.reason }), _jsxs("p", { className: "text-xs text-orange-200 mt-1", children: ["By admin on ", new Date(match.adminOverride.overriddenAt).toLocaleString()] })] })), match.hasDispute && (_jsxs("div", { className: "p-2 bg-red-500/10 border border-red-500/30 rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-red-400" }), _jsx("span", { className: "text-red-400 font-medium", children: "Disputed Result" })] }), _jsx("p", { className: "text-sm text-red-300 mt-1", children: "This match result is under dispute and may need review." })] }))] }))] }, match.id))) })) }) }) }), _jsx(Dialog, { open: !!selectedMatch, onOpenChange: () => setSelectedMatch(null), children: _jsxs(DialogContent, { className: "bg-gray-900 border-white/20", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "text-white flex items-center gap-2", children: [_jsx(Edit, { className: "w-5 h-5 text-purple-400" }), "Override Match Result"] }) }), selectedMatch && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-3 bg-white/5 rounded border border-white/10", children: [_jsxs("div", { className: "flex items-center justify-center gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-white font-medium", children: selectedMatch.teamAName }), _jsx("div", { className: "text-lg font-bold text-purple-400", children: selectedMatch.finalScore?.a || 0 })] }), _jsx("div", { className: "text-gray-400", children: "VS" }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-white font-medium", children: selectedMatch.teamBName }), _jsx("div", { className: "text-lg font-bold text-purple-400", children: selectedMatch.finalScore?.b || 0 })] })] }), _jsxs("div", { className: "text-center text-sm text-gray-400 mt-2", children: [selectedMatch.eventName, " \u2022 Round ", selectedMatch.round] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Winner" }), _jsxs(Select, { value: overrideData.winnerId, onValueChange: (value) => setOverrideData({ ...overrideData, winnerId: value }), children: [_jsx(SelectTrigger, { className: "bg-white/10 border-white/20 text-white", children: _jsx(SelectValue, { placeholder: "Select winner" }) }), _jsxs(SelectContent, { className: "bg-gray-900 border-white/20", children: [selectedMatch.teamA && _jsx(SelectItem, { value: selectedMatch.teamA, children: selectedMatch.teamAName || 'Team A' }), selectedMatch.teamB && _jsx(SelectItem, { value: selectedMatch.teamB, children: selectedMatch.teamBName || 'Team B' })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs(Label, { className: "text-gray-400", children: [selectedMatch.teamAName, " Score"] }), _jsx(Input, { type: "number", min: "0", value: overrideData.scoreA, onChange: (e) => setOverrideData({
                                                        ...overrideData,
                                                        scoreA: parseInt(e.target.value) || 0
                                                    }), className: "bg-white/10 border-white/20 text-white" })] }), _jsxs("div", { children: [_jsxs(Label, { className: "text-gray-400", children: [selectedMatch.teamBName, " Score"] }), _jsx(Input, { type: "number", min: "0", value: overrideData.scoreB, onChange: (e) => setOverrideData({
                                                        ...overrideData,
                                                        scoreB: parseInt(e.target.value) || 0
                                                    }), className: "bg-white/10 border-white/20 text-white" })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Reason for Override (required)" }), _jsx(Textarea, { value: overrideData.reason, onChange: (e) => setOverrideData({ ...overrideData, reason: e.target.value }), placeholder: "Explain why this match result is being overridden...", className: "bg-white/10 border-white/20 text-white", rows: 3 })] }), _jsx("div", { className: "p-3 bg-yellow-500/10 border border-yellow-500/30 rounded", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-yellow-400 font-medium", children: "Override Warning" }), _jsx("p", { className: "text-sm text-yellow-300 mt-1", children: "This will permanently override the match result and create an audit log entry. This action cannot be undone." })] })] }) })] })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "ghost", onClick: () => setSelectedMatch(null), className: "border-white/20", children: "Cancel" }), _jsx(Button, { onClick: handleSubmitOverride, disabled: overrideMatch.isPending || !overrideData.reason || !overrideData.winnerId, className: "bg-purple-500 hover:bg-purple-600", children: overrideMatch.isPending ? 'Overriding...' : 'Override Match' })] })] }) })] }));
}
