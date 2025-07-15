import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { trpc } from '../../utils/trpc';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Megaphone, Send, AlertCircle, Info, CheckCircle, Users, Crown, Volume2, Plus, Eye, Calendar } from 'lucide-react';
export function AnnouncementSystem({ tournamentId }) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [announcement, setAnnouncement] = useState({
        title: '',
        message: '',
        priority: 'medium',
        targetAudience: 'all'
    });
    // TODO: Add announcement fetching when endpoint is available
    const announcements = [];
    const refetch = () => { };
    // Create announcement mutation
    const createAnnouncement = trpc.admin.broadcastAnnouncement.useMutation({
        onSuccess: (data) => {
            toast.success(`Announcement sent to ${data.recipientCount || 'all'} recipients`);
            setShowCreateDialog(false);
            setAnnouncement({
                title: '',
                message: '',
                priority: 'medium',
                targetAudience: 'all'
            });
            refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
    const handleCreateAnnouncement = () => {
        if (!announcement.title.trim() || !announcement.message.trim()) {
            toast.error('Please fill in both title and message');
            return;
        }
        createAnnouncement.mutate({
            tournamentId,
            title: announcement.title,
            message: announcement.message,
            priority: announcement.priority,
            targetAudience: announcement.targetAudience
        });
    };
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'urgent':
                return _jsx(AlertCircle, { className: "w-4 h-4 text-red-400" });
            case 'high':
                return _jsx(AlertCircle, { className: "w-4 h-4 text-orange-400" });
            case 'medium':
                return _jsx(Info, { className: "w-4 h-4 text-blue-400" });
            case 'low':
                return _jsx(CheckCircle, { className: "w-4 h-4 text-green-400" });
            default:
                return _jsx(Info, { className: "w-4 h-4 text-gray-400" });
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'border-red-500/30 bg-red-500/10';
            case 'high':
                return 'border-orange-500/30 bg-orange-500/10';
            case 'medium':
                return 'border-blue-500/30 bg-blue-500/10';
            case 'low':
                return 'border-green-500/30 bg-green-500/10';
            default:
                return 'border-gray-500/30 bg-gray-500/10';
        }
    };
    const getAudienceIcon = (audience) => {
        switch (audience) {
            case 'captains':
                return _jsx(Crown, { className: "w-4 h-4 text-yellow-400" });
            case 'teams':
                return _jsx(Users, { className: "w-4 h-4 text-blue-400" });
            default:
                return _jsx(Volume2, { className: "w-4 h-4 text-purple-400" });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-white flex items-center gap-3", children: [_jsx(Megaphone, { className: "w-6 h-6 text-purple-400" }), "Live Announcements"] }), _jsxs(Button, { onClick: () => setShowCreateDialog(true), className: "bg-purple-500 hover:bg-purple-600", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Announcement"] })] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-gray-400", children: "Broadcast important messages to participants in real-time. Messages will appear as notifications and can be targeted to specific groups." }) })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-white text-lg", children: "Recent Announcements" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: announcements && announcements.length > 0 ? (announcements.map((item, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, className: `p-4 rounded-lg border ${getPriorityColor(item.priority)}`, children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [getPriorityIcon(item.priority), _jsx("h3", { className: "text-white font-semibold", children: item.title }), _jsx(Badge, { variant: "outline", className: "text-xs", children: item.priority.toUpperCase() }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-400", children: [getAudienceIcon(item.targetAudience), _jsx("span", { children: item.targetAudience })] })] }), _jsx("p", { className: "text-gray-300 mb-3", children: item.message }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3 h-3" }), new Date(item.createdAt).toLocaleString()] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Eye, { className: "w-3 h-3" }), "Sent to ", item.targetAudience] })] })] }) }) }, item.id)))) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Megaphone, { className: "w-12 h-12 text-gray-500 mx-auto mb-3" }), _jsx("p", { className: "text-gray-400", children: "No announcements yet" }), _jsx("p", { className: "text-sm text-gray-500", children: "Create your first announcement to get started" })] })) }) })] }), _jsx(Dialog, { open: showCreateDialog, onOpenChange: setShowCreateDialog, children: _jsxs(DialogContent, { className: "bg-gray-900 border-white/20 max-w-2xl", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "text-white flex items-center gap-2", children: [_jsx(Megaphone, { className: "w-5 h-5 text-purple-400" }), "Create New Announcement"] }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Title" }), _jsx(Input, { value: announcement.title, onChange: (e) => setAnnouncement({ ...announcement, title: e.target.value }), placeholder: "Enter announcement title...", maxLength: 100, className: "bg-white/10 border-white/20 text-white" }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [announcement.title.length, "/100 characters"] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Message" }), _jsx(Textarea, { value: announcement.message, onChange: (e) => setAnnouncement({ ...announcement, message: e.target.value }), placeholder: "Enter your announcement message...", maxLength: 1000, rows: 4, className: "bg-white/10 border-white/20 text-white" }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [announcement.message.length, "/1000 characters"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Priority" }), _jsxs(Select, { value: announcement.priority, onValueChange: (value) => setAnnouncement({ ...announcement, priority: value }), children: [_jsx(SelectTrigger, { className: "bg-white/10 border-white/20 text-white", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { className: "bg-gray-900 border-white/20", children: [_jsx(SelectItem, { value: "low", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-400" }), "Low Priority"] }) }), _jsx(SelectItem, { value: "medium", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Info, { className: "w-4 h-4 text-blue-400" }), "Medium Priority"] }) }), _jsx(SelectItem, { value: "high", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-orange-400" }), "High Priority"] }) }), _jsx(SelectItem, { value: "urgent", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-red-400" }), "Urgent"] }) })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Target Audience" }), _jsxs(Select, { value: announcement.targetAudience, onValueChange: (value) => setAnnouncement({ ...announcement, targetAudience: value }), children: [_jsx(SelectTrigger, { className: "bg-white/10 border-white/20 text-white", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { className: "bg-gray-900 border-white/20", children: [_jsx(SelectItem, { value: "all", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Volume2, { className: "w-4 h-4 text-purple-400" }), "Everyone"] }) }), _jsx(SelectItem, { value: "teams", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-blue-400" }), "Team Members Only"] }) }), _jsx(SelectItem, { value: "captains", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Crown, { className: "w-4 h-4 text-yellow-400" }), "Team Captains Only"] }) })] })] })] })] }), _jsxs("div", { className: "p-4 bg-white/5 rounded-lg border border-white/10", children: [_jsx("h4", { className: "text-gray-400 text-sm font-medium mb-2", children: "Preview:" }), _jsxs("div", { className: `p-3 rounded border ${getPriorityColor(announcement.priority)}`, children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [getPriorityIcon(announcement.priority), _jsx("span", { className: "text-white font-semibold", children: announcement.title || 'Announcement Title' }), _jsx(Badge, { variant: "outline", className: "text-xs", children: announcement.priority.toUpperCase() })] }), _jsx("p", { className: "text-gray-300 text-sm", children: announcement.message || 'Your announcement message will appear here...' })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "ghost", onClick: () => setShowCreateDialog(false), className: "border-white/20", children: "Cancel" }), _jsx(Button, { onClick: handleCreateAnnouncement, disabled: createAnnouncement.isPending || !announcement.title.trim() || !announcement.message.trim(), className: "bg-purple-500 hover:bg-purple-600", children: createAnnouncement.isPending ? ('Sending...') : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Send Announcement"] })) })] })] }) })] }));
}
