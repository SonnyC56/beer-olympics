import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { Eye, Download, RefreshCw, Shield, Users, Trophy, Settings, Flag, AlertTriangle, CheckCircle, Calendar, User, FileText } from 'lucide-react';
export function AdminLog({ tournamentId }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [limit, setLimit] = useState(50);
    // Fetch admin log
    const { data: adminLog, isPending: isLoading, refetch } = trpc.admin.getAdminLog.useQuery({ tournamentId, limit }, { enabled: !!tournamentId });
    const filteredLog = adminLog?.filter(entry => {
        const matchesSearch = entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.adminName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = actionFilter === 'all' || entry.action === actionFilter;
        return matchesSearch && matchesFilter;
    }) || [];
    const getActionIcon = (action) => {
        switch (action) {
            case 'override_match':
                return _jsx(Trophy, { className: "w-4 h-4 text-purple-400" });
            case 'remove':
            case 'edit':
                return _jsx(Users, { className: "w-4 h-4 text-blue-400" });
            case 'warn':
                return _jsx(Flag, { className: "w-4 h-4 text-yellow-400" });
            case 'update_settings':
                return _jsx(Settings, { className: "w-4 h-4 text-green-400" });
            case 'broadcast':
                return _jsx(AlertTriangle, { className: "w-4 h-4 text-orange-400" });
            default:
                return _jsx(Shield, { className: "w-4 h-4 text-gray-400" });
        }
    };
    const getActionColor = (action) => {
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
    const formatActionText = (action) => {
        return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-white flex items-center gap-3", children: [_jsx(Eye, { className: "w-6 h-6 text-purple-400" }), "Admin Activity Log"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Badge, { className: "bg-blue-500/20 text-blue-400 border-blue-500/50", children: [filteredLog.length, " Entries"] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => refetch(), className: "border-white/20", children: _jsx(RefreshCw, { className: "w-4 h-4" }) }), _jsxs(Button, { size: "sm", variant: "outline", onClick: exportLog, className: "border-white/20", disabled: !adminLog || adminLog.length === 0, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export"] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { placeholder: "Search logs by action, reason, or admin...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "bg-white/10 border-white/20 text-white" }) }), _jsxs(Select, { value: actionFilter, onValueChange: setActionFilter, children: [_jsx(SelectTrigger, { className: "w-48 bg-white/10 border-white/20 text-white", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { className: "bg-gray-900 border-white/20", children: [_jsx(SelectItem, { value: "all", children: "All Actions" }), uniqueActions.map(action => (_jsx(SelectItem, { value: action, children: formatActionText(action) }, action)))] })] }), _jsxs(Select, { value: limit.toString(), onValueChange: (value) => setLimit(parseInt(value)), children: [_jsx(SelectTrigger, { className: "w-32 bg-white/10 border-white/20 text-white", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { className: "bg-gray-900 border-white/20", children: [_jsx(SelectItem, { value: "25", children: "25 entries" }), _jsx(SelectItem, { value: "50", children: "50 entries" }), _jsx(SelectItem, { value: "100", children: "100 entries" })] })] })] }) })] }), _jsx(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: _jsx(CardContent, { className: "p-0", children: _jsx(ScrollArea, { className: "h-[700px]", children: isLoading ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" }), _jsx("p", { className: "text-gray-400 mt-2", children: "Loading admin log..." })] })) : filteredLog.length === 0 ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-500 mx-auto mb-3" }), _jsx("p", { className: "text-gray-400", children: "No admin actions found" }), _jsx("p", { className: "text-sm text-gray-500", children: searchTerm || actionFilter !== 'all'
                                        ? 'Try adjusting your search criteria'
                                        : 'Admin actions will appear here' })] })) : (_jsx("div", { className: "divide-y divide-white/10", children: filteredLog.map((entry, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.02 }, className: "p-4 hover:bg-white/5 transition-colors", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `p-2 rounded-lg border ${getActionColor(entry.action)}`, children: getActionIcon(entry.action) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-white font-semibold", children: formatActionText(entry.action) }), _jsx(Badge, { variant: "outline", className: "text-xs", children: entry.targetType || 'system' }), _jsx("span", { className: "text-xs text-gray-500", children: formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(User, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-400", children: "Admin:" }), _jsx("span", { className: "text-white", children: entry.adminName || entry.adminId })] }), entry.targetId && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Trophy, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-400", children: "Target:" }), _jsxs("span", { className: "text-white font-mono text-xs", children: [entry.targetId.slice(0, 8), "..."] })] })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-400", children: "Time:" }), _jsx("span", { className: "text-white", children: new Date(entry.timestamp).toLocaleString() })] })] }), entry.reason && (_jsx("div", { className: "mt-3 p-2 bg-white/5 rounded border border-white/10", children: _jsx("p", { className: "text-sm text-gray-300", children: entry.reason }) })), entry.data && (_jsxs("details", { className: "mt-3", children: [_jsx("summary", { className: "text-sm text-gray-400 cursor-pointer hover:text-white", children: "View Technical Details" }), _jsx("div", { className: "mt-2 p-2 bg-black/20 rounded border border-white/10", children: _jsx("pre", { className: "text-xs text-gray-300 overflow-x-auto", children: JSON.stringify(entry.data, null, 2) }) })] }))] }), _jsx("div", { className: "flex items-center", children: _jsx(CheckCircle, { className: "w-5 h-5 text-green-400" }) })] }) }, `${entry.timestamp}-${index}`))) })) }) }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Total Actions" }), _jsx("p", { className: "text-2xl font-bold text-white", children: adminLog?.length || 0 })] }), _jsx(Shield, { className: "w-8 h-8 text-purple-400" })] }) }) }), _jsx(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Match Overrides" }), _jsx("p", { className: "text-2xl font-bold text-white", children: adminLog?.filter(e => e.action === 'override_match').length || 0 })] }), _jsx(Trophy, { className: "w-8 h-8 text-purple-400" })] }) }) }), _jsx(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Team Actions" }), _jsx("p", { className: "text-2xl font-bold text-white", children: adminLog?.filter(e => e.targetType === 'team').length || 0 })] }), _jsx(Users, { className: "w-8 h-8 text-blue-400" })] }) }) }), _jsx(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Today's Actions" }), _jsx("p", { className: "text-2xl font-bold text-white", children: adminLog?.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length || 0 })] }), _jsx(Calendar, { className: "w-8 h-8 text-green-400" })] }) }) })] })] }));
}
