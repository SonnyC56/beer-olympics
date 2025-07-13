import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Download, 
  Search,
  Trophy,
  Shirt,
  Car,
  Heart,
  BarChart,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { getTournamentRSVPs, getRSVPStats, exportRSVPsToCSV, updateRSVP, type RSVPData } from '@/services/rsvp';
import { toast } from 'sonner';

export function RSVPManagementPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const tournamentSlug = slug || 'default-tournament';
  
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [filteredRsvps, setFilteredRsvps] = useState<RSVPData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [stats, setStats] = useState<any>(null);
  
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
      filtered = filtered.filter(rsvp => 
        rsvp.fullName.toLowerCase().includes(term) ||
        rsvp.email.toLowerCase().includes(term) ||
        rsvp.teamName?.toLowerCase().includes(term) ||
        rsvp.preferredPartner?.toLowerCase().includes(term)
      );
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
  
  const handleStatusChange = async (rsvpId: string, newStatus: RSVPData['status']) => {
    const updated = await updateRSVP(rsvpId, { status: newStatus });
    if (updated) {
      await loadRSVPs();
      toast.success(`RSVP status updated to ${newStatus}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => navigate(`/control/${slug}`)}
              className="text-white hover:bg-white/10 border border-white/20 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Control Room
            </Button>
            <h1 className="text-4xl font-bold text-white">RSVP Management</h1>
            <p className="text-gray-300">Manage tournament registrations</p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Total RSVPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats?.totalRSVPs || 0}</p>
              <p className="text-sm text-gray-300 mt-1">
                +{stats?.totalGuests || 0} guests
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Skill Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Beginner</span>
                <span className="text-white font-bold">{stats?.skillLevels?.beginner || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Intermediate</span>
                <span className="text-white font-bold">{stats?.skillLevels?.intermediate || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Advanced</span>
                <span className="text-white font-bold">{stats?.skillLevels?.advanced || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Legendary</span>
                <span className="text-white font-bold">{stats?.skillLevels?.legendary || 0}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Car className="w-5 h-5" />
                Transportation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Need ride</span>
                  <span className="text-white font-bold">{stats?.needsTransportation || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Can offer</span>
                  <span className="text-white font-bold">{stats?.canOfferRide || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Volunteers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats?.volunteers || 0}</p>
              <p className="text-sm text-gray-300 mt-1">
                Ready to help!
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Event Popularity */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Event Popularity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats?.eventPopularity || {}).map(([eventId, count]) => (
                <div key={eventId} className="bg-white/10 rounded-lg p-3">
                  <p className="text-white font-medium capitalize">{eventId.replace('-', ' ')}</p>
                  <p className="text-2xl font-bold text-amber-400">{count as React.ReactNode}</p>
                  <p className="text-xs text-gray-300">participants</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Filters and Search */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter RSVPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or team..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    variant={filterBy === status ? 'default' : 'outline'}
                    onClick={() => setFilterBy(status as typeof filterBy)}
                    className={filterBy === status 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'border-white/20 text-white hover:bg-white/10'
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* RSVP List */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Registrations ({filteredRsvps.length})</CardTitle>
            <CardDescription className="text-gray-300">
              Click on a row to view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3 text-gray-300">Name</th>
                    <th className="text-left p-3 text-gray-300">Team</th>
                    <th className="text-left p-3 text-gray-300">Partner</th>
                    <th className="text-left p-3 text-gray-300 hidden md:table-cell">Events</th>
                    <th className="text-left p-3 text-gray-300 hidden lg:table-cell">Shirt</th>
                    <th className="text-left p-3 text-gray-300">Status</th>
                    <th className="text-left p-3 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3">
                        <div>
                          <p className="text-white font-medium">{rsvp.fullName}</p>
                          <p className="text-sm text-gray-400">{rsvp.email}</p>
                        </div>
                      </td>
                      <td className="p-3 text-white">{rsvp.teamName}</td>
                      <td className="p-3 text-white">{rsvp.preferredPartner || '-'}</td>
                      <td className="p-3 text-white hidden md:table-cell">{rsvp.attendingGames?.length || 0}</td>
                      <td className="p-3 text-white hidden lg:table-cell">{rsvp.shirtSize.toUpperCase()}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          rsvp.status === 'confirmed' 
                            ? 'bg-green-500/20 text-green-400'
                            : rsvp.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {rsvp.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {rsvp.status !== 'confirmed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(rsvp.id, 'confirmed')}
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {rsvp.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(rsvp.id, 'cancelled')}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredRsvps.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No RSVPs found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* T-Shirt Sizes Summary */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shirt className="w-5 h-5" />
              T-Shirt Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {Object.entries(stats?.shirtSizes || {}).map(([size, count]) => (
                <div key={size} className="text-center">
                  <p className="text-2xl font-bold text-white uppercase">{size}</p>
                  <p className="text-3xl font-bold text-amber-400">{count as React.ReactNode}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}