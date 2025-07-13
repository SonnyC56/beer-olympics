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
import {
  Megaphone,
  Send,
  AlertCircle,
  Info,
  CheckCircle,
  Users,
  Crown,
  Volume2,
  Plus,
  Eye,
  Calendar
} from 'lucide-react';

interface AnnouncementSystemProps {
  tournamentId: string;
}

export function AnnouncementSystem({ tournamentId }: AnnouncementSystemProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    targetAudience: 'all' as 'all' | 'teams' | 'captains'
  });

  // TODO: Add announcement fetching when endpoint is available
  const announcements: any[] = [];
  const refetch = () => {};

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'medium':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'captains':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'teams':
        return <Users className="w-4 h-4 text-blue-400" />;
      default:
        return <Volume2 className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <Megaphone className="w-6 h-6 text-purple-400" />
              Live Announcements
            </CardTitle>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            Broadcast important messages to participants in real-time. Messages will appear as notifications
            and can be targeted to specific groups.
          </p>
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {announcements && announcements.length > 0 ? (
              announcements.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${getPriorityColor(item.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getPriorityIcon(item.priority)}
                        <h3 className="text-white font-semibold">{item.title}</h3>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                        >
                          {item.priority.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          {getAudienceIcon(item.targetAudience)}
                          <span>{item.targetAudience}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-3">{item.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Sent to {item.targetAudience}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Megaphone className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No announcements yet</p>
                <p className="text-sm text-gray-500">Create your first announcement to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Announcement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-900 border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-400" />
              Create New Announcement
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label className="text-gray-400">Title</Label>
              <Input
                value={announcement.title}
                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                placeholder="Enter announcement title..."
                maxLength={100}
                className="bg-white/10 border-white/20 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                {announcement.title.length}/100 characters
              </p>
            </div>

            {/* Message */}
            <div>
              <Label className="text-gray-400">Message</Label>
              <Textarea
                value={announcement.message}
                onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                placeholder="Enter your announcement message..."
                maxLength={1000}
                rows={4}
                className="bg-white/10 border-white/20 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                {announcement.message.length}/1000 characters
              </p>
            </div>

            {/* Priority and Audience */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Priority</Label>
                <Select 
                  value={announcement.priority} 
                  onValueChange={(value: any) => setAnnouncement({ ...announcement, priority: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Low Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-400" />
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        High Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        Urgent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-400">Target Audience</Label>
                <Select 
                  value={announcement.targetAudience} 
                  onValueChange={(value: any) => setAnnouncement({ ...announcement, targetAudience: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-purple-400" />
                        Everyone
                      </div>
                    </SelectItem>
                    <SelectItem value="teams">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        Team Members Only
                      </div>
                    </SelectItem>
                    <SelectItem value="captains">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        Team Captains Only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-gray-400 text-sm font-medium mb-2">Preview:</h4>
              <div className={`p-3 rounded border ${getPriorityColor(announcement.priority)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getPriorityIcon(announcement.priority)}
                  <span className="text-white font-semibold">
                    {announcement.title || 'Announcement Title'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {announcement.priority.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm">
                  {announcement.message || 'Your announcement message will appear here...'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCreateDialog(false)}
              className="border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAnnouncement}
              disabled={createAnnouncement.isPending || !announcement.title.trim() || !announcement.message.trim()}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {createAnnouncement.isPending ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Announcement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}