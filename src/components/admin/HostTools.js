import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { Timer, Play, Pause, Square, RotateCcw, MapPin, Users, AlertTriangle, Volume2, Settings, Clock, StopCircle } from 'lucide-react';
// Mock station data
const mockStations = [
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
export function HostTools({ onUpdate }) {
    const [timers, setTimers] = useState([]);
    const [stations] = useState(mockStations);
    const [showTimerDialog, setShowTimerDialog] = useState(false);
    const [newTimer, setNewTimer] = useState({
        name: '',
        duration: 600, // 10 minutes default
        type: 'match'
    });
    // Update timers every second
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prevTimers => prevTimers.map(timer => {
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
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const createTimer = () => {
        if (!newTimer.name.trim()) {
            toast.error('Please enter a timer name');
            return;
        }
        const timer = {
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
    const controlTimer = (id, action) => {
        setTimers(prevTimers => {
            switch (action) {
                case 'start':
                    return prevTimers.map(t => t.id === id ? { ...t, isRunning: true } : t);
                case 'pause':
                    return prevTimers.map(t => t.id === id ? { ...t, isRunning: false } : t);
                case 'reset':
                    return prevTimers.map(t => t.id === id ? { ...t, remaining: t.duration, isRunning: false } : t);
                case 'delete':
                    return prevTimers.filter(t => t.id !== id);
                default:
                    return prevTimers;
            }
        });
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const getTimerColor = (timer) => {
        if (timer.remaining === 0)
            return 'border-red-500/50 bg-red-500/10';
        if (timer.remaining < 60)
            return 'border-orange-500/50 bg-orange-500/10';
        if (timer.isRunning)
            return 'border-green-500/50 bg-green-500/10';
        return 'border-blue-500/50 bg-blue-500/10';
    };
    const getStationStatusColor = (status) => {
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-red-500/30", children: [_jsx(CardHeader, { children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs(CardTitle, { className: "text-white flex items-center gap-3", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-red-400" }), "Emergency Controls"] }) }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { onClick: handleEmergencyStop, className: "bg-red-500 hover:bg-red-600 text-white", children: [_jsx(StopCircle, { className: "w-4 h-4 mr-2" }), "Emergency Stop"] }), _jsxs(Button, { variant: "outline", className: "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20", onClick: () => {
                                        toast.success('Tournament announcement sent to all participants');
                                    }, children: [_jsx(Volume2, { className: "w-4 h-4 mr-2" }), "Broadcast Announcement"] }), _jsx(Badge, { className: "bg-green-500/20 text-green-400 border-green-500/50", children: "All Systems Operational" })] }) })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-white flex items-center gap-3", children: [_jsx(Timer, { className: "w-6 h-6 text-purple-400" }), "Timer Management"] }), _jsxs(Button, { onClick: () => setShowTimerDialog(true), className: "bg-purple-500 hover:bg-purple-600", children: [_jsx(Timer, { className: "w-4 h-4 mr-2" }), "New Timer"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: timers.length === 0 ? (_jsxs("div", { className: "col-span-full text-center py-8", children: [_jsx(Clock, { className: "w-12 h-12 text-gray-500 mx-auto mb-3" }), _jsx("p", { className: "text-gray-400", children: "No active timers" }), _jsx("p", { className: "text-sm text-gray-500", children: "Create a timer to get started" })] })) : (timers.map((timer, index) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.1 }, className: `p-4 rounded-lg border ${getTimerColor(timer)}`, children: [_jsxs("div", { className: "text-center mb-3", children: [_jsx("h3", { className: "text-white font-semibold text-lg", children: timer.name }), _jsx(Badge, { variant: "outline", className: "text-xs mt-1", children: timer.type })] }), _jsxs("div", { className: "text-center mb-4", children: [_jsx("div", { className: `text-4xl font-bold mb-2 ${timer.remaining === 0 ? 'text-red-400' :
                                                    timer.remaining < 60 ? 'text-orange-400' :
                                                        'text-white'}`, children: formatTime(timer.remaining) }), _jsxs("div", { className: "text-sm text-gray-400", children: ["/ ", formatTime(timer.duration)] })] }), _jsxs("div", { className: "flex justify-center gap-2", children: [!timer.isRunning ? (_jsx(Button, { size: "sm", onClick: () => controlTimer(timer.id, 'start'), disabled: timer.remaining === 0, className: "bg-green-500 hover:bg-green-600", children: _jsx(Play, { className: "w-4 h-4" }) })) : (_jsx(Button, { size: "sm", onClick: () => controlTimer(timer.id, 'pause'), className: "bg-yellow-500 hover:bg-yellow-600", children: _jsx(Pause, { className: "w-4 h-4" }) })), _jsx(Button, { size: "sm", variant: "outline", onClick: () => controlTimer(timer.id, 'reset'), className: "border-white/20", children: _jsx(RotateCcw, { className: "w-4 h-4" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => controlTimer(timer.id, 'delete'), className: "border-red-500/50 text-red-400 hover:bg-red-500/20", children: _jsx(Square, { className: "w-4 h-4" }) })] })] }, timer.id)))) }) })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-white flex items-center gap-3", children: [_jsx(MapPin, { className: "w-6 h-6 text-purple-400" }), "Station Management"] }), _jsxs(Button, { onClick: () => toast.info('Station management coming soon'), variant: "outline", className: "border-white/20", children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Manage Stations"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: stations.map((station, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "p-4 bg-white/5 rounded-lg border border-white/10", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-white font-semibold", children: station.name }), _jsx("p", { className: "text-sm text-gray-400", children: station.location })] }), _jsx(Badge, { className: getStationStatusColor(station.status), children: station.status })] }), station.currentMatch && (_jsxs("div", { className: "mb-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded", children: [_jsx("p", { className: "text-blue-400 text-sm font-medium", children: "Current Match:" }), _jsx("p", { className: "text-white text-sm", children: station.currentMatch })] })), _jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-gray-400 text-xs mb-1", children: "Equipment:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: station.equipment.map((item, idx) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: item }, idx))) })] }), _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { size: "sm", variant: "outline", className: "flex-1 border-white/20", onClick: () => {
                                                // TODO: Implement station management
                                                toast.info('Station management coming soon');
                                            }, children: [_jsx(Settings, { className: "w-4 h-4 mr-1" }), "Manage"] }) })] }, station.id))) }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Active Timers" }), _jsx("p", { className: "text-3xl font-bold text-white", children: timers.filter(t => t.isRunning).length })] }), _jsx(Timer, { className: "w-12 h-12 text-purple-400" })] }) }) }), _jsx(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Available Stations" }), _jsx("p", { className: "text-3xl font-bold text-white", children: stations.filter(s => s.status === 'available').length })] }), _jsx(MapPin, { className: "w-12 h-12 text-green-400" })] }) }) }), _jsx(Card, { className: "bg-white/10 backdrop-blur-lg border-white/20", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Active Matches" }), _jsx("p", { className: "text-3xl font-bold text-white", children: stations.filter(s => s.status === 'occupied').length })] }), _jsx(Users, { className: "w-12 h-12 text-blue-400" })] }) }) })] }), _jsx(Dialog, { open: showTimerDialog, onOpenChange: setShowTimerDialog, children: _jsxs(DialogContent, { className: "bg-gray-900 border-white/20", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "text-white flex items-center gap-2", children: [_jsx(Timer, { className: "w-5 h-5 text-purple-400" }), "Create New Timer"] }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Timer Name" }), _jsx(Input, { value: newTimer.name, onChange: (e) => setNewTimer({ ...newTimer, name: e.target.value }), placeholder: "e.g., Match 1 - Round 1", className: "bg-white/10 border-white/20 text-white" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Duration (minutes)" }), _jsx(Input, { type: "number", value: newTimer.duration / 60, onChange: (e) => setNewTimer({
                                                ...newTimer,
                                                duration: (parseInt(e.target.value) || 0) * 60
                                            }), className: "bg-white/10 border-white/20 text-white", min: "1", max: "60" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-400", children: "Timer Type" }), _jsxs(Select, { value: newTimer.type, onValueChange: (value) => setNewTimer({ ...newTimer, type: value }), children: [_jsx(SelectTrigger, { className: "bg-white/10 border-white/20 text-white", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { className: "bg-gray-900 border-white/20", children: [_jsx(SelectItem, { value: "match", children: "Match Timer" }), _jsx(SelectItem, { value: "break", children: "Break Timer" }), _jsx(SelectItem, { value: "setup", children: "Setup Timer" })] })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "ghost", onClick: () => setShowTimerDialog(false), className: "border-white/20", children: "Cancel" }), _jsx(Button, { onClick: createTimer, className: "bg-purple-500 hover:bg-purple-600", children: "Create Timer" })] })] }) })] }));
}
