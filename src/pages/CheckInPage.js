import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle2, Users, Search, AlertCircle, Timer, TrendingUp, Clock, UserCheck, Loader2, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckInScanner } from '@/components/CheckInScanner';
import { toast } from 'sonner';
import { trpcClient } from '@/utils/trpc';
import { cn } from '@/lib/utils';
export function CheckInPage() {
    const { tournamentSlug } = useParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('check-in');
    const [stats, setStats] = useState({
        totalRSVPs: 0,
        checkedIn: 0,
        waitlist: 0,
        noShows: 0,
        capacity: 64,
        teamsFormed: 0,
        lateArrivals: 0
    });
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const [selectedAttendee, setSelectedAttendee] = useState(null);
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
        if (!tournamentSlug)
            return;
        try {
            const result = await trpcClient.rsvp.getCheckInStatus.query({ tournamentSlug });
            if (result.success) {
                setAttendees(result.attendees);
                setStats(result.stats);
            }
        }
        catch (error) {
            console.error('Failed to load check-in data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCheckIn = async (attendee, method = 'manual') => {
        try {
            const result = await trpcClient.rsvp.checkIn.mutate({
                id: attendee.id,
                method,
                autoAssignTeam: autoAssignTeams && !attendee.teamId,
                isLateArrival: new Date().getHours() > 12 // Example: after noon is late
            });
            if (result.success) {
                toast.success(_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-green-500" }), _jsxs("div", { children: [_jsxs("p", { className: "font-semibold", children: [attendee.fullName, " checked in!"] }), result.teamAssigned && (_jsxs("p", { className: "text-sm text-gray-500", children: ["Assigned to Team ", result.teamName] }))] })] }));
                // Refresh data
                loadCheckInData();
                // Show welcome screen in kiosk mode
                if (kioskMode) {
                    showWelcomeScreen(attendee, result);
                }
            }
        }
        catch (error) {
            toast.error('Failed to check in attendee');
        }
    };
    const showWelcomeScreen = (attendee, checkInResult) => {
        toast.custom(() => (_jsx(motion.div, { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.8, opacity: 0 }, className: "bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-2xl shadow-2xl max-w-md mx-auto", children: _jsxs("div", { className: "text-center", children: [_jsx(CheckCircle2, { className: "w-20 h-20 mx-auto mb-4" }), _jsxs("h2", { className: "text-3xl font-bold mb-2", children: ["Welcome, ", attendee.fullName, "!"] }), checkInResult.teamAssigned && (_jsxs("div", { className: "bg-white/20 rounded-lg p-4 mb-4", children: [_jsx("p", { className: "text-lg mb-1", children: "You've been assigned to" }), _jsx("p", { className: "text-2xl font-bold", children: checkInResult.teamName }), _jsxs("p", { className: "text-sm mt-2", children: ["Table ", checkInResult.tableNumber] })] })), attendee.shirtSize && (_jsxs("div", { className: "bg-white/10 rounded-lg p-3 mb-4", children: [_jsxs("p", { children: ["Your shirt size: ", attendee.shirtSize.toUpperCase()] }), _jsx("p", { className: "text-sm", children: "Pick up at registration desk" })] })), _jsx(Button, { onClick: () => toast.dismiss(), className: "mt-4 bg-white text-green-600 hover:bg-gray-100", children: "Got it!" })] }) })), {
            duration: kioskMode ? 8000 : 5000,
            position: 'top-center'
        });
    };
    const handleQRScan = async (data) => {
        try {
            const { attendeeId } = JSON.parse(data);
            const attendee = attendees.find(a => a.id === attendeeId);
            if (attendee) {
                if (attendee.status === 'checked_in') {
                    toast.info(`${attendee.fullName} is already checked in`);
                }
                else {
                    await handleCheckIn(attendee, 'qr');
                }
            }
            else {
                toast.error('Invalid QR code');
            }
        }
        catch (error) {
            toast.error('Failed to process QR code');
        }
    };
    const filteredAttendees = attendees.filter(a => a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phone.includes(searchQuery) ||
        (a.teamName && a.teamName.toLowerCase().includes(searchQuery.toLowerCase())));
    const getStatusColor = (status) => {
        switch (status) {
            case 'checked_in': return 'text-green-500';
            case 'waitlist': return 'text-yellow-500';
            case 'no_show': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'checked_in': return _jsx(CheckCircle2, { className: "w-4 h-4" });
            case 'waitlist': return _jsx(Clock, { className: "w-4 h-4" });
            case 'no_show': return _jsx(X, { className: "w-4 h-4" });
            default: return _jsx(Timer, { className: "w-4 h-4" });
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-amber-500" }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8 max-w-7xl", children: [_jsxs("div", { className: "mb-8", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-2", children: "Tournament Check-In" }), _jsxs("p", { className: "text-gray-400", children: ["Manage arrivals and team assignments for ", tournamentSlug] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: kioskMode ? "default" : "outline", onClick: () => setKioskMode(!kioskMode), className: cn("transition-all", kioskMode && "bg-green-500 hover:bg-green-600"), children: [_jsx(Smartphone, { className: "w-4 h-4 mr-2" }), kioskMode ? 'Exit Kiosk Mode' : 'Kiosk Mode'] }), _jsxs(Button, { onClick: () => setShowScanner(true), className: "bg-amber-500 hover:bg-amber-600", children: [_jsx(QrCode, { className: "w-4 h-4 mr-2" }), "Scan QR Code"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: _jsx(Card, { className: "bg-gray-800/50 border-gray-700", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Checked In" }), _jsx("p", { className: "text-3xl font-bold text-green-500", children: stats.checkedIn }), _jsx(Progress, { value: (stats.checkedIn / stats.totalRSVPs) * 100, className: "mt-2 h-2" })] }), _jsx(UserCheck, { className: "w-8 h-8 text-green-500" })] }) }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: _jsx(Card, { className: "bg-gray-800/50 border-gray-700", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Pending" }), _jsx("p", { className: "text-3xl font-bold text-yellow-500", children: stats.totalRSVPs - stats.checkedIn - stats.noShows }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Expected arrivals" })] }), _jsx(Timer, { className: "w-8 h-8 text-yellow-500" })] }) }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, children: _jsx(Card, { className: "bg-gray-800/50 border-gray-700", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Teams Formed" }), _jsx("p", { className: "text-3xl font-bold text-blue-500", children: stats.teamsFormed }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Auto-assigned" })] }), _jsx(Users, { className: "w-8 h-8 text-blue-500" })] }) }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, children: _jsx(Card, { className: "bg-gray-800/50 border-gray-700", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Capacity" }), _jsxs("p", { className: "text-3xl font-bold text-white", children: [Math.round((stats.checkedIn / stats.capacity) * 100), "%"] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [stats.checkedIn, "/", stats.capacity] })] }), _jsx(TrendingUp, { className: "w-8 h-8 text-amber-500" })] }) }) }) })] }), _jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx(Input, { placeholder: "Search by name, email, phone, or team...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10 bg-gray-800 border-gray-700" })] }), _jsxs(Select, { value: autoAssignTeams ? 'auto' : 'manual', onValueChange: (v) => setAutoAssignTeams(v === 'auto'), children: [_jsx(SelectTrigger, { className: "w-48 bg-gray-800 border-gray-700", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "auto", children: "Auto-assign teams" }), _jsx(SelectItem, { value: "manual", children: "Manual teams only" })] })] })] })] }), _jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, children: [_jsxs(TabsList, { className: "mb-6", children: [_jsx(TabsTrigger, { value: "check-in", children: "Check-In Queue" }), _jsxs(TabsTrigger, { value: "checked", children: ["Checked In (", stats.checkedIn, ")"] }), _jsxs(TabsTrigger, { value: "waitlist", children: ["Waitlist (", stats.waitlist, ")"] }), _jsxs(TabsTrigger, { value: "teams", children: ["Teams (", stats.teamsFormed, ")"] })] }), _jsx(TabsContent, { value: "check-in", children: _jsxs("div", { className: "space-y-4", children: [filteredAttendees
                                    .filter(a => a.status === 'pending')
                                    .map((attendee, index) => (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.05 }, children: _jsx(Card, { className: "bg-gray-800/50 border-gray-700 hover:border-amber-500/50 transition-all", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold", children: attendee.fullName.charAt(0) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white", children: attendee.fullName }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-400", children: [_jsx("span", { children: attendee.email }), _jsx("span", { children: attendee.phone }), attendee.teamName && (_jsx(Badge, { variant: "secondary", children: attendee.teamName }))] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: attendee.participationType === 'player' ? 'default' : 'secondary', children: attendee.participationType }), _jsxs(Button, { onClick: () => handleCheckIn(attendee), className: "bg-green-500 hover:bg-green-600", children: [_jsx(CheckCircle2, { className: "w-4 h-4 mr-2" }), "Check In"] })] })] }), attendee.preferredPartner && (_jsx("div", { className: "mt-3 p-3 bg-gray-700/50 rounded-lg", children: _jsxs("p", { className: "text-sm text-gray-400", children: ["Preferred partner: ", _jsx("span", { className: "text-white", children: attendee.preferredPartner })] }) }))] }) }) }, attendee.id))), filteredAttendees.filter(a => a.status === 'pending').length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(CheckCircle2, { className: "w-16 h-16 text-gray-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-400", children: "All attendees have been checked in!" })] }))] }) }), _jsx(TabsContent, { value: "checked", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: filteredAttendees
                                .filter(a => a.status === 'checked_in')
                                .map((attendee, index) => (_jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.02 }, children: _jsx(Card, { className: "bg-gray-800/50 border-gray-700", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h3", { className: "font-semibold text-white flex items-center gap-2", children: [attendee.fullName, _jsx(CheckCircle2, { className: "w-4 h-4 text-green-500" })] }), _jsxs("p", { className: "text-sm text-gray-400", children: ["Checked in at ", new Date(attendee.checkedInAt).toLocaleTimeString()] }), attendee.teamName && (_jsx(Badge, { variant: "secondary", className: "mt-2", children: attendee.teamName }))] }), _jsxs("div", { className: "text-right", children: [_jsx(Badge, { variant: "outline", className: "mb-1", children: attendee.checkInMethod }), attendee.isLateArrival && (_jsx("p", { className: "text-xs text-yellow-500", children: "Late arrival" }))] })] }) }) }) }, attendee.id))) }) }), _jsxs(TabsContent, { value: "waitlist", children: [_jsxs(Alert, { className: "mb-6 bg-yellow-500/10 border-yellow-500", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Waitlisted attendees will be admitted as space becomes available. They will receive notifications when spots open up." })] }), _jsx("div", { className: "space-y-4", children: filteredAttendees
                                    .filter(a => a.status === 'waitlist')
                                    .map((attendee, index) => (_jsx(Card, { className: "bg-gray-800/50 border-gray-700", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white", children: attendee.fullName }), _jsxs("p", { className: "text-sm text-gray-400", children: ["Position #", index + 1, " on waitlist"] })] }), _jsx(Button, { onClick: () => handleCheckIn(attendee), variant: "outline", className: "border-yellow-500 text-yellow-500 hover:bg-yellow-500/10", children: "Admit from Waitlist" })] }) }) }, attendee.id))) })] }), _jsx(TabsContent, { value: "teams", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: _jsxs(Card, { className: "bg-gray-800/50 border-gray-700", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Team Formation" }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-gray-400", children: "Teams are automatically formed as players check in." }), _jsx(Button, { className: "mt-4 w-full", variant: "outline", children: "View All Teams" })] })] }) }) })] }), _jsx(AnimatePresence, { children: showScanner && (_jsx(CheckInScanner, { onScanSuccess: handleQRScan, onClose: () => setShowScanner(false) })) }), _jsx(Dialog, { open: !!selectedAttendee, onOpenChange: () => setSelectedAttendee(null), children: _jsxs(DialogContent, { className: "bg-gray-900 border-gray-800", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Attendee Details" }) }), selectedAttendee && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white mb-2", children: selectedAttendee.fullName }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("p", { className: "text-gray-400", children: ["Email: ", _jsx("span", { className: "text-white", children: selectedAttendee.email })] }), _jsxs("p", { className: "text-gray-400", children: ["Phone: ", _jsx("span", { className: "text-white", children: selectedAttendee.phone })] }), _jsxs("p", { className: "text-gray-400", children: ["Type: ", _jsx("span", { className: "text-white", children: selectedAttendee.participationType })] }), selectedAttendee.teamName && (_jsxs("p", { className: "text-gray-400", children: ["Team: ", _jsx("span", { className: "text-white", children: selectedAttendee.teamName })] }))] })] }), _jsx(DialogFooter, { children: _jsx(Button, { onClick: () => {
                                            handleCheckIn(selectedAttendee);
                                            setSelectedAttendee(null);
                                        }, className: "bg-green-500 hover:bg-green-600", children: "Check In" }) })] }))] }) })] }));
}
