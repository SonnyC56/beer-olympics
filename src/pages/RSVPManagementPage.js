import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Download, Search, Trophy, Shirt, Car, Heart, BarChart, ArrowLeft, CheckCircle, XCircle, Filter } from 'lucide-react';
import { getTournamentRSVPs, getRSVPStats, exportRSVPsToCSV, updateRSVP } from '@/services/rsvp';
import { toast } from 'sonner';
export function RSVPManagementPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const tournamentSlug = slug || 'default-tournament';
    const [rsvps, setRsvps] = useState([]);
    const [filteredRsvps, setFilteredRsvps] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [stats, setStats] = useState(null);
    const loadRSVPs = useCallback(async () => {
        const tournamentRsvps = await getTournamentRSVPs(tournamentSlug);
        setRsvps(tournamentRsvps);
        const statsData = await getRSVPStats(tournamentSlug);
        setStats(statsData);
    }, [tournamentSlug]);
    const filterRSVPs = useCallback(() => {
        let filtered = [...rsvps];
        // Filter by status
        if (filterBy !== 'all') {
            filtered = filtered.filter(rsvp => rsvp.status === filterBy);
        }
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(rsvp => rsvp.fullName.toLowerCase().includes(term) ||
                rsvp.email.toLowerCase().includes(term) ||
                rsvp.teamName?.toLowerCase().includes(term) ||
                rsvp.preferredPartner?.toLowerCase().includes(term));
        }
        setFilteredRsvps(filtered);
    }, [rsvps, searchTerm, filterBy]);
    useEffect(() => {
        const loadData = async () => {
            await loadRSVPs();
            const statsData = await getRSVPStats(tournamentSlug);
            setStats(statsData);
        };
        loadData();
    }, [loadRSVPs, tournamentSlug]);
    useEffect(() => {
        filterRSVPs();
    }, [filterRSVPs]);
    const handleExport = async () => {
        const csv = await exportRSVPsToCSV(tournamentSlug);
        if (!csv) {
            toast.error('No RSVPs to export');
            return;
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `beer-olympics-rsvps-${tournamentSlug}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('RSVPs exported successfully!');
    };
    const handleStatusChange = async (rsvpId, newStatus) => {
        const updated = await updateRSVP(rsvpId, { status: newStatus });
        if (updated) {
            await loadRSVPs();
            toast.success(`RSVP status updated to ${newStatus}`);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 p-4 md:p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs(Button, { variant: "ghost", onClick: () => navigate(`/control/${slug}`), className: "text-white hover:bg-white/10 border border-white/20 mb-2", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Control Room"] }), _jsx("h1", { className: "text-4xl font-bold text-white", children: "RSVP Management" }), _jsx("p", { className: "text-gray-300", children: "Manage tournament registrations" })] }), _jsxs(Button, { onClick: handleExport, className: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export CSV"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs(CardTitle, { className: "text-white flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5" }), "Total RSVPs"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-3xl font-bold text-white", children: stats?.totalRSVPs || 0 }), _jsxs("p", { className: "text-sm text-gray-300 mt-1", children: ["+", stats?.totalGuests || 0, " guests"] })] })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs(CardTitle, { className: "text-white flex items-center gap-2", children: [_jsx(Trophy, { className: "w-5 h-5" }), "Skill Levels"] }) }), _jsxs(CardContent, { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-300", children: "Beginner" }), _jsx("span", { className: "text-white font-bold", children: stats?.skillLevels?.beginner || 0 })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-300", children: "Intermediate" }), _jsx("span", { className: "text-white font-bold", children: stats?.skillLevels?.intermediate || 0 })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-300", children: "Advanced" }), _jsx("span", { className: "text-white font-bold", children: stats?.skillLevels?.advanced || 0 })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-300", children: "Legendary" }), _jsx("span", { className: "text-white font-bold", children: stats?.skillLevels?.legendary || 0 })] })] })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs(CardTitle, { className: "text-white flex items-center gap-2", children: [_jsx(Car, { className: "w-5 h-5" }), "Transportation"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-300", children: "Need ride" }), _jsx("span", { className: "text-white font-bold", children: stats?.needsTransportation || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-300", children: "Can offer" }), _jsx("span", { className: "text-white font-bold", children: stats?.canOfferRide || 0 })] })] }) })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs(CardTitle, { className: "text-white flex items-center gap-2", children: [_jsx(Heart, { className: "w-5 h-5" }), "Volunteers"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-3xl font-bold text-white", children: stats?.volunteers || 0 }), _jsx("p", { className: "text-sm text-gray-300 mt-1", children: "Ready to help!" })] })] })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-white flex items-center gap-2", children: [_jsx(BarChart, { className: "w-5 h-5" }), "Event Popularity"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: Object.entries(stats?.eventPopularity || {}).map(([eventId, count]) => (_jsxs("div", { className: "bg-white/10 rounded-lg p-3", children: [_jsx("p", { className: "text-white font-medium capitalize", children: eventId.replace('-', ' ') }), _jsx("p", { className: "text-2xl font-bold text-amber-400", children: count }), _jsx("p", { className: "text-xs text-gray-300", children: "participants" })] }, eventId))) }) })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-white flex items-center gap-2", children: [_jsx(Filter, { className: "w-5 h-5" }), "Filter RSVPs"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx(Input, { placeholder: "Search by name, email, or team...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400" })] }), _jsx("div", { className: "flex gap-2", children: ['all', 'confirmed', 'pending', 'cancelled'].map((status) => (_jsx(Button, { variant: filterBy === status ? 'default' : 'outline', onClick: () => setFilterBy(status), className: filterBy === status
                                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                                : 'border-white/20 text-white hover:bg-white/10', children: status.charAt(0).toUpperCase() + status.slice(1) }, status))) })] }) })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-white", children: ["Registrations (", filteredRsvps.length, ")"] }), _jsx(CardDescription, { className: "text-gray-300", children: "Click on a row to view details" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-white/20", children: [_jsx("th", { className: "text-left p-3 text-gray-300", children: "Name" }), _jsx("th", { className: "text-left p-3 text-gray-300", children: "Team" }), _jsx("th", { className: "text-left p-3 text-gray-300", children: "Partner" }), _jsx("th", { className: "text-left p-3 text-gray-300 hidden md:table-cell", children: "Events" }), _jsx("th", { className: "text-left p-3 text-gray-300 hidden lg:table-cell", children: "Shirt" }), _jsx("th", { className: "text-left p-3 text-gray-300", children: "Status" }), _jsx("th", { className: "text-left p-3 text-gray-300", children: "Actions" })] }) }), _jsx("tbody", { children: filteredRsvps.map((rsvp) => (_jsxs("tr", { className: "border-b border-white/10 hover:bg-white/5", children: [_jsx("td", { className: "p-3", children: _jsxs("div", { children: [_jsx("p", { className: "text-white font-medium", children: rsvp.fullName }), _jsx("p", { className: "text-sm text-gray-400", children: rsvp.email })] }) }), _jsx("td", { className: "p-3 text-white", children: rsvp.teamName }), _jsx("td", { className: "p-3 text-white", children: rsvp.preferredPartner || '-' }), _jsx("td", { className: "p-3 text-white hidden md:table-cell", children: rsvp.attendingGames?.length || 0 }), _jsx("td", { className: "p-3 text-white hidden lg:table-cell", children: rsvp.shirtSize.toUpperCase() }), _jsx("td", { className: "p-3", children: _jsx("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rsvp.status === 'confirmed'
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : rsvp.status === 'pending'
                                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                                        : 'bg-red-500/20 text-red-400'}`, children: rsvp.status }) }), _jsx("td", { className: "p-3", children: _jsxs("div", { className: "flex gap-2", children: [rsvp.status !== 'confirmed' && (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleStatusChange(rsvp.id, 'confirmed'), className: "text-green-400 hover:text-green-300 hover:bg-green-500/20", children: _jsx(CheckCircle, { className: "w-4 h-4" }) })), rsvp.status !== 'cancelled' && (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleStatusChange(rsvp.id, 'cancelled'), className: "text-red-400 hover:text-red-300 hover:bg-red-500/20", children: _jsx(XCircle, { className: "w-4 h-4" }) }))] }) })] }, rsvp.id))) })] }), filteredRsvps.length === 0 && (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-400", children: "No RSVPs found" }) }))] }) })] }), _jsxs(Card, { className: "bg-white/10 backdrop-blur-sm border-white/20", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-white flex items-center gap-2", children: [_jsx(Shirt, { className: "w-5 h-5" }), "T-Shirt Order Summary"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-3 md:grid-cols-6 gap-4", children: Object.entries(stats?.shirtSizes || {}).map(([size, count]) => (_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-white uppercase", children: size }), _jsx("p", { className: "text-3xl font-bold text-amber-400", children: count })] }, size))) }) })] })] }) }));
}
