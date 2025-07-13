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
import {
  Shield,
  AlertTriangle,
  Flag,
  Ban,
  Eye,
  MessageSquare,
  Image,
  FileText,
  Filter,
  UserX,
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';

interface ModerationToolsProps {
  tournamentId: string;
  onUpdate: () => void;
}

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

export function ModerationTools({ onUpdate }: ModerationToolsProps) {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [moderationAction, setModerationAction] = useState({
    action: 'dismiss' as 'dismiss' | 'warn' | 'ban' | 'remove_content',
    reason: '',
    duration: 24 // hours for temporary bans
  });

  const handleModerationAction = () => {
    if (!selectedReport) return;

    // Here you would call the actual moderation API
    toast.success(`Action ${moderationAction.action} applied successfully`);
    setSelectedReport(null);
    setModerationAction({ action: 'dismiss', reason: '', duration: 24 });
    onUpdate();
  };

  const getStatusColor = (status: string) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inappropriate_content':
        return <MessageSquare className="w-4 h-4" />;
      case 'cheating':
        return <AlertTriangle className="w-4 h-4" />;
      case 'spam':
        return <Flag className="w-4 h-4" />;
      case 'harassment':
        return <UserX className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            Moderation Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            Review reports, moderate content, and take action against policy violations.
          </p>
        </CardContent>
      </Card>

      {/* Moderation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/10 backdrop-blur-lg border border-white/20">
          <TabsTrigger value="reports" className="data-[state=active]:bg-purple-500">
            <Flag className="w-4 h-4 mr-2" />
            Reports ({mockReports.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="flagged" className="data-[state=active]:bg-purple-500">
            <Eye className="w-4 h-4 mr-2" />
            Flagged Content ({mockFlaggedContent.length})
          </TabsTrigger>
          <TabsTrigger value="actions" className="data-[state=active]:bg-purple-500">
            <Ban className="w-4 h-4 mr-2" />
            Actions Log
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">User Reports</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search reports..."
                    className="w-64 bg-white/10 border-white/20 text-white"
                  />
                  <Button variant="outline" size="sm" className="border-white/20">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {mockReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getTypeIcon(report.type)}
                            <h4 className="text-white font-medium">{report.reason}</h4>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{report.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Reported by: {report.reportedBy}</span>
                            <span>•</span>
                            <span>{new Date(report.createdAt).toLocaleString()}</span>
                            <span>•</span>
                            <span>Type: {report.targetType}</span>
                          </div>
                          {report.content && (
                            <div className="mt-3 p-2 bg-white/5 rounded border border-white/10">
                              <p className="text-sm text-gray-300">{report.content}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                            onClick={() => setSelectedReport(report)}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flagged Content Tab */}
        <TabsContent value="flagged" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <h3 className="text-white font-semibold">Automatically Flagged Content</h3>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {mockFlaggedContent.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {item.type === 'image' ? <Image className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                            <span className="text-white font-medium capitalize">{item.type}</span>
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                              {item.reportCount} reports
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{item.reason}</p>
                          <div className="mb-3 p-2 bg-white/5 rounded border border-white/10">
                            {item.type === 'image' ? (
                              <div className="flex items-center gap-2">
                                <Image className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300">{item.content}</span>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-300">{item.content}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Author: {item.author}</span>
                            <span>•</span>
                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Log Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <h3 className="text-white font-semibold">Moderation Actions Log</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No moderation actions yet</p>
                <p className="text-sm text-gray-500">Actions taken will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Moderation Action Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="bg-gray-900 border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Review Report
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              {/* Report Details */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  {getTypeIcon(selectedReport.type)}
                  <h3 className="text-white font-semibold">{selectedReport.reason}</h3>
                  <Badge className={getStatusColor(selectedReport.status)}>
                    {selectedReport.status}
                  </Badge>
                </div>
                <p className="text-gray-400 mb-3">{selectedReport.description}</p>
                
                {selectedReport.content && (
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <h4 className="text-gray-400 text-sm font-medium mb-2">Reported Content:</h4>
                    <p className="text-white">{selectedReport.content}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                  <span>Reported by: {selectedReport.reportedBy}</span>
                  <span>•</span>
                  <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Selection */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Take Action:</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={moderationAction.action === 'dismiss' ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setModerationAction({ ...moderationAction, action: 'dismiss' })}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Dismiss Report
                  </Button>
                  <Button
                    variant={moderationAction.action === 'warn' ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setModerationAction({ ...moderationAction, action: 'warn' })}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Issue Warning
                  </Button>
                  <Button
                    variant={moderationAction.action === 'remove_content' ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setModerationAction({ ...moderationAction, action: 'remove_content' })}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Content
                  </Button>
                  <Button
                    variant={moderationAction.action === 'ban' ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setModerationAction({ ...moderationAction, action: 'ban' })}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Temporary Ban
                  </Button>
                </div>

                {moderationAction.action === 'ban' && (
                  <div>
                    <label className="text-gray-400 text-sm">Ban Duration (hours):</label>
                    <Input
                      type="number"
                      value={moderationAction.duration}
                      onChange={(e) => setModerationAction({ 
                        ...moderationAction, 
                        duration: parseInt(e.target.value) || 24 
                      })}
                      className="bg-white/10 border-white/20 text-white mt-1"
                      min="1"
                      max="168" // 1 week max
                    />
                  </div>
                )}

                <div>
                  <label className="text-gray-400 text-sm">Reason (optional):</label>
                  <Textarea
                    value={moderationAction.reason}
                    onChange={(e) => setModerationAction({ ...moderationAction, reason: e.target.value })}
                    placeholder="Add a reason for this action..."
                    className="bg-white/10 border-white/20 text-white mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSelectedReport(null)}
              className="border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleModerationAction}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Apply Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}