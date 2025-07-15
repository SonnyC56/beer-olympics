import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  CheckCircle2,
  Users,
  UserPlus,
  Search,
  AlertCircle,
  Timer,
  Shield,
  Sparkles,
  TrendingUp,
  Calendar,
  Clock,
  UserCheck,
  Loader2,
  Smartphone,
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRScanner } from '@/components/QRScanner';
import { CheckInScanner } from '@/components/CheckInScanner';
import { toast } from 'sonner';
import { trpcClient } from '@/utils/trpc';
import { cn } from '@/lib/utils';

interface CheckInStats {
  totalRSVPs: number;
  checkedIn: number;
  waitlist: number;
  noShows: number;
  capacity: number;
  teamsFormed: number;
  lateArrivals: number;
}

interface Attendee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  participationType: 'player' | 'spectator' | 'designated_driver';
  teamName?: string;
  teamId?: string;
  checkedInAt?: string;
  checkInMethod?: 'qr' | 'manual' | 'self_service';
  status: 'pending' | 'checked_in' | 'no_show' | 'waitlist';
  qrCode?: string;
  preferredPartner?: string;
  shirtSize?: string;
  isLateArrival?: boolean;
}

export function CheckInPage() {
  const { tournamentSlug } = useParams<{ tournamentSlug: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('check-in');
  const [stats, setStats] = useState<CheckInStats>({
    totalRSVPs: 0,
    checkedIn: 0,
    waitlist: 0,
    noShows: 0,
    capacity: 64,
    teamsFormed: 0,
    lateArrivals: 0
  });
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [kioskMode, setKioskMode] = useState(false);
  const [autoAssignTeams, setAutoAssignTeams] = useState(true);

  // Load RSVP data and check-in status
  useEffect(() => {
    loadCheckInData();
    // Set up real-time updates
    const interval = setInterval(loadCheckInData, 5000);
    return () => clearInterval(interval);
  }, [tournamentSlug]);

  const loadCheckInData = async () => {
    if (!tournamentSlug) return;
    
    try {
      const result = await trpcClient.rsvp.getCheckInStatus.query({ tournamentSlug });
      if (result.success) {
        setAttendees(result.attendees);
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Failed to load check-in data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (attendee: Attendee, method: 'qr' | 'manual' | 'self_service' = 'manual') => {
    try {
      const result = await trpcClient.rsvp.checkIn.mutate({
        id: attendee.id,
        method,
        autoAssignTeam: autoAssignTeams && !attendee.teamId,
        isLateArrival: new Date().getHours() > 12 // Example: after noon is late
      });

      if (result.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-semibold">{attendee.fullName} checked in!</p>
              {result.teamAssigned && (
                <p className="text-sm text-gray-500">Assigned to Team {result.teamName}</p>
              )}
            </div>
          </div>
        );
        
        // Refresh data
        loadCheckInData();
        
        // Show welcome screen in kiosk mode
        if (kioskMode) {
          showWelcomeScreen(attendee, result);
        }
      }
    } catch (error) {
      toast.error('Failed to check in attendee');
    }
  };

  const showWelcomeScreen = (attendee: Attendee, checkInResult: any) => {
    toast.custom(() => (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-2xl shadow-2xl max-w-md mx-auto"
      >
        <div className="text-center">
          <CheckCircle2 className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Welcome, {attendee.fullName}!</h2>
          
          {checkInResult.teamAssigned && (
            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <p className="text-lg mb-1">You've been assigned to</p>
              <p className="text-2xl font-bold">{checkInResult.teamName}</p>
              <p className="text-sm mt-2">Table {checkInResult.tableNumber}</p>
            </div>
          )}
          
          {attendee.shirtSize && (
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <p>Your shirt size: {attendee.shirtSize.toUpperCase()}</p>
              <p className="text-sm">Pick up at registration desk</p>
            </div>
          )}
          
          <Button
            onClick={() => toast.dismiss()}
            className="mt-4 bg-white text-green-600 hover:bg-gray-100"
          >
            Got it!
          </Button>
        </div>
      </motion.div>
    ),
      {
        duration: kioskMode ? 8000 : 5000,
        position: 'top-center'
      }
    );
  };

  const handleQRScan = async (data: string) => {
    try {
      const { attendeeId } = JSON.parse(data);
      const attendee = attendees.find(a => a.id === attendeeId);
      
      if (attendee) {
        if (attendee.status === 'checked_in') {
          toast.info(`${attendee.fullName} is already checked in`);
        } else {
          await handleCheckIn(attendee, 'qr');
        }
      } else {
        toast.error('Invalid QR code');
      }
    } catch (error) {
      toast.error('Failed to process QR code');
    }
  };

  const filteredAttendees = attendees.filter(a => 
    a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.phone.includes(searchQuery) ||
    (a.teamName && a.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in': return 'text-green-500';
      case 'waitlist': return 'text-yellow-500';
      case 'no_show': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked_in': return <CheckCircle2 className="w-4 h-4" />;
      case 'waitlist': return <Clock className="w-4 h-4" />;
      case 'no_show': return <X className="w-4 h-4" />;
      default: return <Timer className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Tournament Check-In
            </h1>
            <p className="text-gray-400">
              Manage arrivals and team assignments for {tournamentSlug}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant={kioskMode ? "default" : "outline"}
              onClick={() => setKioskMode(!kioskMode)}
              className={cn(
                "transition-all",
                kioskMode && "bg-green-500 hover:bg-green-600"
              )}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {kioskMode ? 'Exit Kiosk Mode' : 'Kiosk Mode'}
            </Button>
            
            <Button
              onClick={() => setShowScanner(true)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR Code
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Checked In</p>
                    <p className="text-3xl font-bold text-green-500">
                      {stats.checkedIn}
                    </p>
                    <Progress 
                      value={(stats.checkedIn / stats.totalRSVPs) * 100} 
                      className="mt-2 h-2"
                    />
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending</p>
                    <p className="text-3xl font-bold text-yellow-500">
                      {stats.totalRSVPs - stats.checkedIn - stats.noShows}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Expected arrivals
                    </p>
                  </div>
                  <Timer className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Teams Formed</p>
                    <p className="text-3xl font-bold text-blue-500">
                      {stats.teamsFormed}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-assigned
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Capacity</p>
                    <p className="text-3xl font-bold text-white">
                      {Math.round((stats.checkedIn / stats.capacity) * 100)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.checkedIn}/{stats.capacity}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone, or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>
          
          <Select value={autoAssignTeams ? 'auto' : 'manual'} onValueChange={(v) => setAutoAssignTeams(v === 'auto')}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-assign teams</SelectItem>
              <SelectItem value="manual">Manual teams only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="check-in">Check-In Queue</TabsTrigger>
          <TabsTrigger value="checked">Checked In ({stats.checkedIn})</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist ({stats.waitlist})</TabsTrigger>
          <TabsTrigger value="teams">Teams ({stats.teamsFormed})</TabsTrigger>
        </TabsList>

        <TabsContent value="check-in">
          <div className="space-y-4">
            {filteredAttendees
              .filter(a => a.status === 'pending')
              .map((attendee, index) => (
                <motion.div
                  key={attendee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-gray-800/50 border-gray-700 hover:border-amber-500/50 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                            {attendee.fullName.charAt(0)}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-white">
                              {attendee.fullName}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{attendee.email}</span>
                              <span>{attendee.phone}</span>
                              {attendee.teamName && (
                                <Badge variant="secondary">{attendee.teamName}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={attendee.participationType === 'player' ? 'default' : 'secondary'}>
                            {attendee.participationType}
                          </Badge>
                          
                          <Button
                            onClick={() => handleCheckIn(attendee)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Check In
                          </Button>
                        </div>
                      </div>
                      
                      {attendee.preferredPartner && (
                        <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                          <p className="text-sm text-gray-400">
                            Preferred partner: <span className="text-white">{attendee.preferredPartner}</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
            {filteredAttendees.filter(a => a.status === 'pending').length === 0 && (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">All attendees have been checked in!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="checked">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAttendees
              .filter(a => a.status === 'checked_in')
              .map((attendee, index) => (
                <motion.div
                  key={attendee.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white flex items-center gap-2">
                            {attendee.fullName}
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </h3>
                          <p className="text-sm text-gray-400">
                            Checked in at {new Date(attendee.checkedInAt!).toLocaleTimeString()}
                          </p>
                          {attendee.teamName && (
                            <Badge variant="secondary" className="mt-2">
                              {attendee.teamName}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {attendee.checkInMethod}
                          </Badge>
                          {attendee.isLateArrival && (
                            <p className="text-xs text-yellow-500">Late arrival</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="waitlist">
          <Alert className="mb-6 bg-yellow-500/10 border-yellow-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Waitlisted attendees will be admitted as space becomes available.
              They will receive notifications when spots open up.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            {filteredAttendees
              .filter(a => a.status === 'waitlist')
              .map((attendee, index) => (
                <Card key={attendee.id} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{attendee.fullName}</h3>
                        <p className="text-sm text-gray-400">
                          Position #{index + 1} on waitlist
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => handleCheckIn(attendee)}
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                      >
                        Admit from Waitlist
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team cards would go here - grouped by team */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Team Formation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Teams are automatically formed as players check in.
                </p>
                <Button className="mt-4 w-full" variant="outline">
                  View All Teams
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <CheckInScanner
            onScanSuccess={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>

      {/* Attendee Details Modal */}
      <Dialog open={!!selectedAttendee} onOpenChange={() => setSelectedAttendee(null)}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Attendee Details</DialogTitle>
          </DialogHeader>
          
          {selectedAttendee && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">{selectedAttendee.fullName}</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    Email: <span className="text-white">{selectedAttendee.email}</span>
                  </p>
                  <p className="text-gray-400">
                    Phone: <span className="text-white">{selectedAttendee.phone}</span>
                  </p>
                  <p className="text-gray-400">
                    Type: <span className="text-white">{selectedAttendee.participationType}</span>
                  </p>
                  {selectedAttendee.teamName && (
                    <p className="text-gray-400">
                      Team: <span className="text-white">{selectedAttendee.teamName}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  onClick={() => {
                    handleCheckIn(selectedAttendee);
                    setSelectedAttendee(null);
                  }}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Check In
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}