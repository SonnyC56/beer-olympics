import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Flag, Ban, Eye, MessageSquare, Image, FileText, Filter, UserX, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
// Mock data for demonstration
const mockReports = [
    {
        id: '1',
        type: 'inappropriate_content',
        targetType: 'comment',
        targetId: 'comment_123',
        reportedBy: 'user_456',
        reason: 'Inappropriate language in match chat',
        description: 'User was using offensive language during the match discussion',
        status: 'pending',
        createdAt: new Date().toISOString(),
        content: 'This is some inappropriate content that was reported'
    },
    {
        id: '2',
        type: 'cheating',
        targetType: 'score',
        targetId: 'score_789',
        reportedBy: 'user_101',
        reason: 'Suspected score manipulation',
        description: 'Team reported a score that seems impossible given the game duration',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        content: 'Score: Team A: 50, Team B: 0'
    }
];
const mockFlaggedContent = [
    {
        id: '1',
        type: 'image',
        content: 'https://example.com/flagged-image.jpg',
        reason: 'Automated flagging: potentially inappropriate',
        reportCount: 3,
        status: 'flagged',
        createdAt: new Date().toISOString(),
        author: 'user_123'
    },
    {
        id: '2',
        type: 'comment',
        content: 'This comment contains some questionable language',
        reason: 'Multiple user reports',
        reportCount: 5,
        status: 'flagged',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        author: 'user_456'
    }
];
export function ModerationTools({ onUpdate }) {
    const [activeTab, setActiveTab] = useState('reports');
    const [selectedReport, setSelectedReport] = useState(null);
    const [moderationAction, setModerationAction] = useState({
        action: 'dismiss',
        reason: '',
        duration: 24 // hours for temporary bans
    });
    const handleModerationAction = () => {
        if (!selectedReport)
            return;
        // Here you would call the actual moderation API
        toast.success(`Action ${moderationAction.action} applied successfully`);
        setSelectedReport(null);
        setModerationAction({ action: 'dismiss', reason: '', duration: 24 });
        onUpdate();
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'resolved':
                return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'dismissed':
                return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
            default:
                return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'inappropriate_content':
                return _jsx(MessageSquare, { className: "w-4 h-4" });
            case 'cheating':
                return _jsx(AlertTriangle, { className: "w-4 h-4" });
            case 'spam':
                return _jsx(Flag, { className: "w-4 h-4" });
            case 'harassment':
                return _jsx(UserX, { className: "w-4 h-4" });
            default:
                return _jsx(AlertCircle, { className: "w-4 h-4" });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-white flex items-center gap-3", children: [_jsx(Shield, { className: "w-6 h-6 text-purple-400" }), "Moderation Tools"] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-gray-400", children: "Review reports, moderate content, and take action against policy violations." }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "bg-white/10 backdrop-blur-lg border border-white/20", children: [_jsxs(TabsTrigger, { value: "reports", className: "data-[state=active]:bg-purple-500", children: [_jsx(Flag, { className: "w-4 h-4 mr-2" }), "Reports (", mockReports.filter(r => r.status === 'pending').length, ")"] }), _jsxs(TabsTrigger, { value: "flagged", className: "data-[state=active]:bg-purple-500", children: [_jsx(Eye, { className: "w-4 h-4 mr-2" }), "Flagged Content (", mockFlaggedContent.length, ")"] }), _jsxs(TabsTrigger, { value: "actions", className: "data-[state=active]:bg-purple-500", children: [_jsx(Ban, { className: "w-4 h-4 mr-2" }), "Actions Log"] })] }), _jsx(TabsContent, { value: "reports", className: "space-y-4", children: _jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-white font-semibold", children: "User Reports" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Search reports...", className: "w-64 bg-white/10 border-white/20 text-white" }), _jsx(Button, { variant: "outline", size: "sm", className: "border-white/20", children: _jsx(Filter, { className: "w-4 h-4" }) })] })] }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[500px]", children: _jsx("div", { className: "space-y-3", children: mockReports.map((report, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, className: "p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [getTypeIcon(report.type), _jsx("h4", { className: "text-white font-medium", children: report.reason }), _jsx(Badge, { className: getStatusColor(report.status), children: report.status })] }), _jsx("p", { className: "text-gray-400 text-sm mb-2", children: report.description }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [_jsxs("span", { children: ["Reported by: ", report.reportedBy] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(report.createdAt).toLocaleString() }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Type: ", report.targetType] })] }), report.content && (_jsx("div", { className: "mt-3 p-2 bg-white/5 rounded border border-white/10", children: _jsx("p", { className: "text-sm text-gray-300", children: report.content }) }))] }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { size: "sm", variant: "outline", className: "border-purple-500/50 text-purple-400 hover:bg-purple-500/20", onClick: () => setSelectedReport(report), children: "Review" }) })] }) }, report.id))) }) }) })] }) }), _jsx(TabsContent, { value: "flagged", className: "space-y-4", children: _jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsx("h3", { className: "text-white font-semibold", children: "Automatically Flagged Content" }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[500px]", children: _jsx("div", { className: "space-y-3", children: mockFlaggedContent.map((item, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, className: "p-4 bg-white/5 rounded-lg border border-white/10", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [item.type === 'image' ? _jsx(Image, { className: "w-4 h-4" }) : _jsx(MessageSquare, { className: "w-4 h-4" }), _jsx("span", { className: "text-white font-medium capitalize", children: item.type }), _jsxs(Badge, { className: "bg-red-500/20 text-red-400 border-red-500/50", children: [item.reportCount, " reports"] })] }), _jsx("p", { className: "text-gray-400 text-sm mb-2", children: item.reason }), _jsx("div", { className: "mb-3 p-2 bg-white/5 rounded border border-white/10", children: item.type === 'image' ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Image, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-sm text-gray-300", children: item.content })] })) : (_jsx("p", { className: "text-sm text-gray-300", children: item.content })) }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [_jsxs("span", { children: ["Author: ", item.author] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(item.createdAt).toLocaleString() })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", className: "border-green-500/50 text-green-400 hover:bg-green-500/20", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-1" }), "Approve"] }), _jsxs(Button, { size: "sm", variant: "outline", className: "border-red-500/50 text-red-400 hover:bg-red-500/20", children: [_jsx(Trash2, { className: "w-4 h-4 mr-1" }), "Remove"] })] })] }) }, item.id))) }) }) })] }) }), _jsx(TabsContent, { value: "actions", className: "space-y-4", children: _jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsx("h3", { className: "text-white font-semibold", children: "Moderation Actions Log" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-500 mx-auto mb-3" }), _jsx("p", { className: "text-gray-400", children: "No moderation actions yet" }), _jsx("p", { className: "text-sm text-gray-500", children: "Actions taken will appear here" })] }) })] }) })] }), _jsx(Dialog, { open: !!selectedReport, onOpenChange: () => setSelectedReport(null), children: _jsxs(DialogContent, { className: "bg-gray-900 border-white/20 max-w-2xl", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "text-white flex items-center gap-2", children: [_jsx(Shield, { className: "w-5 h-5 text-purple-400" }), "Review Report"] }) }), selectedReport && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-white/5 rounded-lg border border-white/10", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [getTypeIcon(selectedReport.type), _jsx("h3", { className: "text-white font-semibold", children: selectedReport.reason }), _jsx(Badge, { className: getStatusColor(selectedReport.status), children: selectedReport.status })] }), _jsx("p", { className: "text-gray-400 mb-3", children: selectedReport.description }), selectedReport.content && (_jsxs("div", { className: "p-3 bg-white/5 rounded border border-white/10", children: [_jsx("h4", { className: "text-gray-400 text-sm font-medium mb-2", children: "Reported Content:" }), _jsx("p", { className: "text-white", children: selectedReport.content })] })), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-500 mt-3", children: [_jsxs("span", { children: ["Reported by: ", selectedReport.reportedBy] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(selectedReport.createdAt).toLocaleString() })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-white font-medium", children: "Take Action:" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs(Button, { variant: moderationAction.action === 'dismiss' ? 'default' : 'outline', className: "justify-start", onClick: () => setModerationAction({ ...moderationAction, action: 'dismiss' }), children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Dismiss Report"] }), _jsxs(Button, { variant: moderationAction.action === 'warn' ? 'default' : 'outline', className: "justify-start", onClick: () => setModerationAction({ ...moderationAction, action: 'warn' }), children: [_jsx(AlertTriangle, { className: "w-4 h-4 mr-2" }), "Issue Warning"] }), _jsxs(Button, { variant: moderationAction.action === 'remove_content' ? 'default' : 'outline', className: "justify-start", onClick: () => setModerationAction({ ...moderationAction, action: 'remove_content' }), children: [_jsx(Trash2, { className: "w-4 h-4 mr-2" }), "Remove Content"] }), _jsxs(Button, { variant: moderationAction.action === 'ban' ? 'default' : 'outline', className: "justify-start", onClick: () => setModerationAction({ ...moderationAction, action: 'ban' }), children: [_jsx(Ban, { className: "w-4 h-4 mr-2" }), "Temporary Ban"] })] }), moderationAction.action === 'ban' && (_jsxs("div", { children: [_jsx("label", { className: "text-gray-400 text-sm", children: "Ban Duration (hours):" }), _jsx(Input, { type: "number", value: moderationAction.duration, onChange: (e) => setModerationAction({
                                                        ...moderationAction,
                                                        duration: parseInt(e.target.value) || 24
                                                    }), className: "bg-white/10 border-white/20 text-white mt-1", min: "1", max: "168" // 1 week max
                                                 })] })), _jsxs("div", { children: [_jsx("label", { className: "text-gray-400 text-sm", children: "Reason (optional):" }), _jsx(Textarea, { value: moderationAction.reason, onChange: (e) => setModerationAction({ ...moderationAction, reason: e.target.value }), placeholder: "Add a reason for this action...", className: "bg-white/10 border-white/20 text-white mt-1", rows: 3 })] })] })] })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "ghost", onClick: () => setSelectedReport(null), className: "border-white/20", children: "Cancel" }), _jsx(Button, { onClick: handleModerationAction, className: "bg-purple-500 hover:bg-purple-600", children: "Apply Action" })] })] }) })] }));
}
