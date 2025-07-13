import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Timer,
  Play,
  Pause,
  Square,
  RotateCcw,
  MapPin,
  Users,
  AlertTriangle,
  Volume2,
  Settings,
  Clock,
  StopCircle
} from 'lucide-react';
import type { Tournament } from '../../types';

interface HostToolsProps {
  tournamentId: string;
  tournament: Tournament;
  onUpdate: () => void;
}

// Rename Timer to TimerType to avoid conflict with imported Timer icon

interface Station {
  id: string;
  name: string;
  location: string;
  currentMatch?: string;
  status: 'available' | 'occupied' | 'maintenance';
  equipment: string[];
}

interface TimerType {
  id: string;
  name: string;
  duration: number; // in seconds
  remaining: number;
  isRunning: boolean;
  type: 'match' | 'break' | 'setup';
}

// Mock station data
const mockStations: Station[] = [
  {
    id: '1',
    name: 'Beer Pong Station 1',
    location: 'Main Area - North',
    currentMatch: 'Team Alpha vs Team Beta',
    status: 'occupied',
    equipment: ['Beer Pong Table', 'Cups (20)', 'Ping Pong Balls (6)']
  },
  {
    id: '2',
    name: 'Beer Pong Station 2',
    location: 'Main Area - South',
    status: 'available',
    equipment: ['Beer Pong Table', 'Cups (20)', 'Ping Pong Balls (6)']
  },
  {
    id: '3',
    name: 'Flip Cup Station',
    location: 'Side Area',
    status: 'maintenance',
    equipment: ['Long Table', 'Cups (16)', 'Towels']
  }
];

export function HostTools({ onUpdate }: HostToolsProps) {
  const [timers, setTimers] = useState<TimerType[]>([]);
  const [stations] = useState<Station[]>(mockStations);
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [newTimer, setNewTimer] = useState({
    name: '',
    duration: 600, // 10 minutes default
    type: 'match' as 'match' | 'break' | 'setup'
  });

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (timer.isRunning && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            if (newRemaining === 0) {
              // Timer finished - could trigger notification
              toast.success(`Timer "${timer.name}" finished!`);
              return { ...timer, remaining: 0, isRunning: false };
            }
            return { ...timer, remaining: newRemaining };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const createTimer = () => {
    if (!newTimer.name.trim()) {
      toast.error('Please enter a timer name');
      return;
    }

    const timer: TimerType = {
      id: Date.now().toString(),
      name: newTimer.name,
      duration: newTimer.duration,
      remaining: newTimer.duration,
      isRunning: false,
      type: newTimer.type
    };

    setTimers(prev => [...prev, timer]);
    setShowTimerDialog(false);
    setNewTimer({ name: '', duration: 600, type: 'match' });
    toast.success('Timer created successfully');
  };

  const controlTimer = (id: string, action: 'start' | 'pause' | 'reset' | 'delete') => {
    setTimers(prevTimers => {
      switch (action) {
        case 'start':
          return prevTimers.map(t => 
            t.id === id ? { ...t, isRunning: true } : t
          );
        case 'pause':
          return prevTimers.map(t => 
            t.id === id ? { ...t, isRunning: false } : t
          );
        case 'reset':
          return prevTimers.map(t => 
            t.id === id ? { ...t, remaining: t.duration, isRunning: false } : t
          );
        case 'delete':
          return prevTimers.filter(t => t.id !== id);
        default:
          return prevTimers;
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (timer: TimerType) => {
    if (timer.remaining === 0) return 'border-red-500/50 bg-red-500/10';
    if (timer.remaining < 60) return 'border-orange-500/50 bg-orange-500/10';
    if (timer.isRunning) return 'border-green-500/50 bg-green-500/10';
    return 'border-blue-500/50 bg-blue-500/10';
  };

  const getStationStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'occupied':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'maintenance':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const handleEmergencyStop = () => {
    if (confirm('Are you sure you want to initiate an emergency stop? This will pause all active matches and timers.')) {
      setTimers(prev => prev.map(t => ({ ...t, isRunning: false })));
      toast.error('Emergency stop activated - all activities paused');
      // Here you would also send emergency notifications
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Controls */}
      <Card className="bg-white/10 backdrop-blur-lg border-red-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Emergency Controls
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleEmergencyStop}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Emergency Stop
            </Button>
            <Button
              variant="outline"
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
              onClick={() => {
                toast.success('Tournament announcement sent to all participants');
              }}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Broadcast Announcement
            </Button>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              All Systems Operational
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timer Management */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <Timer className="w-6 h-6 text-purple-400" />
              Timer Management
            </CardTitle>
            <Button
              onClick={() => setShowTimerDialog(true)}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Timer className="w-4 h-4 mr-2" />
              New Timer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timers.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No active timers</p>
                <p className="text-sm text-gray-500">Create a timer to get started</p>
              </div>
            ) : (
              timers.map((timer, index) => (
                <motion.div
                  key={timer.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getTimerColor(timer)}`}
                >
                  <div className="text-center mb-3">
                    <h3 className="text-white font-semibold text-lg">{timer.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {timer.type}
                    </Badge>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-bold mb-2 ${
                      timer.remaining === 0 ? 'text-red-400' :
                      timer.remaining < 60 ? 'text-orange-400' :
                      'text-white'
                    }`}>
                      {formatTime(timer.remaining)}
                    </div>
                    <div className="text-sm text-gray-400">
                      / {formatTime(timer.duration)}
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    {!timer.isRunning ? (
                      <Button
                        size="sm"
                        onClick={() => controlTimer(timer.id, 'start')}
                        disabled={timer.remaining === 0}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => controlTimer(timer.id, 'pause')}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => controlTimer(timer.id, 'reset')}
                      className="border-white/20"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => controlTimer(timer.id, 'delete')}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Station Management */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <MapPin className="w-6 h-6 text-purple-400" />
              Station Management
            </CardTitle>
            <Button
              onClick={() => toast.info('Station management coming soon')}
              variant="outline"
              className="border-white/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Stations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stations.map((station, index) => (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{station.name}</h3>
                    <p className="text-sm text-gray-400">{station.location}</p>
                  </div>
                  <Badge className={getStationStatusColor(station.status)}>
                    {station.status}
                  </Badge>
                </div>

                {station.currentMatch && (
                  <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                    <p className="text-blue-400 text-sm font-medium">Current Match:</p>
                    <p className="text-white text-sm">{station.currentMatch}</p>
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-gray-400 text-xs mb-1">Equipment:</p>
                  <div className="flex flex-wrap gap-1">
                    {station.equipment.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/20"
                    onClick={() => {
                      // TODO: Implement station management
                      toast.info('Station management coming soon');
                    }}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Manage
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Host Dashboard Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Timers</p>
                <p className="text-3xl font-bold text-white">
                  {timers.filter(t => t.isRunning).length}
                </p>
              </div>
              <Timer className="w-12 h-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Available Stations</p>
                <p className="text-3xl font-bold text-white">
                  {stations.filter(s => s.status === 'available').length}
                </p>
              </div>
              <MapPin className="w-12 h-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Matches</p>
                <p className="text-3xl font-bold text-white">
                  {stations.filter(s => s.status === 'occupied').length}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Timer Dialog */}
      <Dialog open={showTimerDialog} onOpenChange={setShowTimerDialog}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Timer className="w-5 h-5 text-purple-400" />
              Create New Timer
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Timer Name</Label>
              <Input
                value={newTimer.name}
                onChange={(e) => setNewTimer({ ...newTimer, name: e.target.value })}
                placeholder="e.g., Match 1 - Round 1"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-400">Duration (minutes)</Label>
              <Input
                type="number"
                value={newTimer.duration / 60}
                onChange={(e) => setNewTimer({ 
                  ...newTimer, 
                  duration: (parseInt(e.target.value) || 0) * 60 
                })}
                className="bg-white/10 border-white/20 text-white"
                min="1"
                max="60"
              />
            </div>

            <div>
              <Label className="text-gray-400">Timer Type</Label>
              <Select 
                value={newTimer.type} 
                onValueChange={(value: any) => setNewTimer({ ...newTimer, type: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem value="match">Match Timer</SelectItem>
                  <SelectItem value="break">Break Timer</SelectItem>
                  <SelectItem value="setup">Setup Timer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowTimerDialog(false)}
              className="border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={createTimer}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Create Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}