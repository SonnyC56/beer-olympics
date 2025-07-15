import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveMatchTracker } from '../components/LiveMatchTracker';
import { UpcomingMatches } from '../components/UpcomingMatches';
import { LiveLeaderboard } from '../components/LiveLeaderboardSimple';
import { TournamentStats } from '../components/TournamentStats';
import SocialFeed from '../components/SocialFeed';
import { MdFullscreen, MdFullscreenExit, MdSplitscreen, MdTv, MdPhoneIphone } from 'react-icons/md';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

type ViewMode = 'split' | 'focus' | 'grid' | 'tv';
type DisplayMode = 'desktop' | 'mobile' | 'tv';

export function SpectatorPage() {
  const { slug } = useParams<{ slug: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusedStation, setFocusedStation] = useState<string | null>(null);
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);

  const { data: tournament } = trpc.tournament.getBySlug.useQuery(
    { slug: slug || '' },
    { enabled: !!slug }
  );

  const { data: activeMatches } = trpc.match.getActiveMatches.useQuery(
    { tournamentId: tournament?.slug || '' },
    { 
      enabled: !!tournament?.slug,
      refetchInterval: 5000 // Poll every 5 seconds
    }
  );

  const { data: upcomingMatches } = trpc.match.getUpcomingMatches.useQuery(
    { tournamentId: tournament?.slug || '' },
    { 
      enabled: !!tournament?.slug,
      refetchInterval: 30000 // Poll every 30 seconds
    }
  );

  // Detect display mode based on screen size
  useEffect(() => {
    const detectDisplayMode = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDisplayMode('mobile');
      } else if (width > 1920) {
        setDisplayMode('tv');
      } else {
        setDisplayMode('desktop');
      }
    };

    detectDisplayMode();
    window.addEventListener('resize', detectDisplayMode);
    return () => window.removeEventListener('resize', detectDisplayMode);
  }, []);

  // Fullscreen handling
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle favorite team notifications
  useEffect(() => {
    if (!activeMatches) return;

    const checkFavoriteMatches = () => {
      activeMatches.forEach(match => {
        const hasFavoriteTeam = match.teams.some(team => 
          team && favoriteTeams.includes(team.id)
        );
        
        if (hasFavoriteTeam && match.status === 'in_progress') {
          // Send browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Your team is playing!', {
              body: `${match.game.name} at ${match.station.name}`,
              icon: '/beer-olympics-icon.png'
            });
          }
        }
      });
    };

    checkFavoriteMatches();
  }, [activeMatches, favoriteTeams]);

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary">Tournament not found</h2>
          <p className="text-muted-foreground mt-2">Please check the URL and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${displayMode === 'tv' ? 'p-0' : 'p-4'}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 ${displayMode === 'tv' ? 'px-8 pt-6' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
              <MdTv className="text-3xl" />
              {tournament.name} - Live
            </h1>
            <p className="text-muted-foreground mt-1">
              {activeMatches?.length || 0} matches in progress • {upcomingMatches?.length || 0} upcoming
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggles */}
            <div className="bg-card rounded-lg p-1 flex gap-1">
              <Button
                variant={viewMode === 'split' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('split')}
                className="flex items-center gap-1"
              >
                <MdSplitscreen className="text-lg" />
                Split
              </Button>
              <Button
                variant={viewMode === 'focus' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('focus')}
              >
                Focus
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'tv' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tv')}
                className="flex items-center gap-1"
              >
                <MdTv className="text-lg" />
                TV
              </Button>
            </div>

            {/* Display Mode Indicator */}
            <div className="bg-card rounded-lg px-3 py-1.5 flex items-center gap-2">
              {displayMode === 'mobile' && <MdPhoneIphone className="text-lg" />}
              {displayMode === 'tv' && <MdTv className="text-lg" />}
              <span className="text-sm capitalize">{displayMode}</span>
            </div>

            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="rounded-lg"
            >
              {isFullscreen ? <MdFullscreenExit className="text-xl" /> : <MdFullscreen className="text-xl" />}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'split' && (
          <motion.div
            key="split"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`grid ${displayMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-12'} gap-4`}
          >
            {/* Live Matches - Main Content */}
            <div className={`${displayMode === 'mobile' ? '' : 'col-span-8'}`}>
              <LiveMatchTracker
                matches={(activeMatches || []).map(match => ({
                  ...match,
                  teams: match.teams.filter(team => team !== null) as any[],
                  scores: match.scores.filter(score => score !== null) as any[]
                }))}
                onFocusMatch={(stationId) => {
                  setFocusedStation(stationId);
                  setViewMode('focus');
                }}
                favoriteTeams={favoriteTeams}
                displayMode={displayMode}
              />
            </div>

            {/* Side Panel */}
            <div className={`${displayMode === 'mobile' ? '' : 'col-span-4'} space-y-4`}>
              <Tabs defaultValue="leaderboard" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-card">
                  <TabsTrigger value="leaderboard">Standings</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                </TabsList>
                
                <TabsContent value="leaderboard" className="mt-4">
                  <LiveLeaderboard
                    tournamentId={tournament.slug}
                    compact={true}
                    highlightTeams={favoriteTeams}
                  />
                </TabsContent>
                
                <TabsContent value="upcoming" className="mt-4">
                  <UpcomingMatches
                    matches={upcomingMatches || []}
                    favoriteTeams={favoriteTeams}
                    onToggleFavorite={(teamId) => {
                      setFavoriteTeams(prev => 
                        prev.includes(teamId) 
                          ? prev.filter(id => id !== teamId)
                          : [...prev, teamId]
                      );
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="social" className="mt-4">
                  <SocialFeed posts={[]} />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}

        {viewMode === 'focus' && focusedStation && (
          <motion.div
            key="focus"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <Button
              variant="outline"
              onClick={() => {
                setViewMode('split');
                setFocusedStation(null);
              }}
              className="mb-4"
            >
              ← Back to Split View
            </Button>
            
            <LiveMatchTracker
              matches={(activeMatches?.filter(m => m.station.id === focusedStation) || []).map(match => ({
                ...match,
                teams: match.teams.filter(team => team !== null) as any[],
                scores: match.scores.filter(score => score !== null) as any[]
              }))}
              focused={true}
              displayMode={displayMode}
            />
          </motion.div>
        )}

        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`grid ${
              displayMode === 'mobile' ? 'grid-cols-1' : 
              displayMode === 'tv' ? 'grid-cols-4' : 'grid-cols-3'
            } gap-4`}
          >
            <LiveMatchTracker
              matches={(activeMatches || []).map(match => ({
                ...match,
                teams: match.teams.filter(team => team !== null) as any[],
                scores: match.scores.filter(score => score !== null) as any[]
              }))}
              gridView={true}
              displayMode={displayMode}
            />
          </motion.div>
        )}

        {viewMode === 'tv' && (
          <motion.div
            key="tv"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col"
          >
            <div className="flex-1 grid grid-cols-12 gap-6 p-6">
              {/* Main Display */}
              <div className="col-span-9">
                <LiveMatchTracker
                  matches={(activeMatches || []).map(match => ({
                    ...match,
                    teams: match.teams.filter(team => team !== null) as any[],
                    scores: match.scores.filter(score => score !== null) as any[]
                  }))}
                  tvMode={true}
                  displayMode="tv"
                />
              </div>

              {/* Stats Panel */}
              <div className="col-span-3 space-y-4">
                <TournamentStats
                  tournamentId={tournament.slug}
                  compact={true}
                />
                <LiveLeaderboard
                  tournamentId={tournament.slug}
                  compact={true}
                  maxTeams={8}
                />
              </div>
            </div>

            {/* Bottom Ticker */}
            <div className="bg-card/80 backdrop-blur-sm p-4 border-t">
              <UpcomingMatches
                matches={upcomingMatches?.slice(0, 5) || []}
                tickerMode={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Permission Request */}
      {favoriteTeams.length > 0 && 'Notification' in window && Notification.permission === 'default' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-card p-4 rounded-lg shadow-lg max-w-sm"
        >
          <p className="text-sm mb-2">Enable notifications for your favorite teams?</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => Notification.requestPermission()}
            >
              Enable
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* Dismiss */}}
            >
              Not Now
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}