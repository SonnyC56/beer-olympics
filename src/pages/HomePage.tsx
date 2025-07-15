import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/material/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/material/card';
import { TextField } from '@/components/ui/material/text-field';
import { FAB } from '@/components/ui/material/fab';

export function HomePage() {
  const [tournamentCode, setTournamentCode] = useState('');
  const navigate = useNavigate();

  const handleJoinTournament = () => {
    if (tournamentCode) {
      navigate(`/join/${tournamentCode}`);
    }
  };

  const handleCreateTournament = () => {
    navigate('/create');
  };

  const handleStyleGuide = () => {
    navigate('/style-guide');
  };

  const handleRSVP = () => {
    navigate('/rsvp');
  };

  const handleDemoTournament = () => {
    navigate('/manage/demo-tournament');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="text-center mb-12 material-header-animation">
        <h1 className="text-7xl font-party font-bold text-neutral-0 text-shadow-lg material-display-large">
          Beer Olympics
        </h1>
        <p className="text-2xl text-neutral-0/90 mt-2 text-shadow material-title-large">
          Transform your backyard games into professional tournaments with real-time scoring and leaderboards
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card variant="elevated" elevation={2} className="material-motion-standard-decelerate">
          <CardHeader>
            <CardTitle>Join Tournament</CardTitle>
            <CardDescription>
              Enter your tournament code to join the party!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TextField
              label="Tournament Code"
              placeholder="Enter tournament code"
              value={tournamentCode}
              onChange={(e) => setTournamentCode(e.target.value)}
              fullWidth
              leadingIcon="sports_esports"
            />
            <Button onClick={handleJoinTournament} variant="filled" size="large" fullWidth leadingIcon="login">
              Join Tournament
            </Button>
          </CardContent>
        </Card>

        <Card variant="elevated" elevation={2} className="material-motion-standard-decelerate">
          <CardHeader>
            <CardTitle>Create Tournament</CardTitle>
            <CardDescription>
              Host your own epic Beer Olympics event!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateTournament} variant="tonal" size="large" fullWidth leadingIcon="add_circle">
              Create Tournament
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Test Pages Section */}
      <section className="mt-12 max-w-4xl w-full">
        <h2 className="text-3xl font-party font-bold text-neutral-0 text-center mb-6">
          🎨 Test Our New Features! 🎉
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="filled" className="material-surface-container-high material-motion-standard">
            <CardHeader>
              <CardTitle>🎨 STYLE GUIDE</CardTitle>
              <CardDescription>
                Explore our fun & playful design system!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleStyleGuide} variant="elevated" fullWidth leadingIcon="palette">
                View Style Guide
              </Button>
            </CardContent>
          </Card>

          <Card variant="filled" className="material-surface-container-high material-motion-standard">
            <CardHeader>
              <CardTitle>📋 RSVP PAGE</CardTitle>
              <CardDescription>
                Try our fully functional RSVP form with preferred partner field! All data saves locally.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleRSVP} variant="elevated" fullWidth leadingIcon="event_available">
                Test RSVP Form
              </Button>
            </CardContent>
          </Card>

          <Card variant="elevated" elevation={3} className="lg:col-span-2 material-motion-emphasized">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏆 TOURNAMENT MANAGEMENT
                <span className="material-badge-new px-3 py-1 rounded-full text-xs font-medium">NEW!</span>
              </CardTitle>
              <CardDescription>
                Experience our brand new tournament management system with live leaderboards, bracket visualization, game configuration, and social features!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleDemoTournament} variant="filled" size="large" fullWidth leadingIcon="emoji_events">
                View Demo Tournament
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Floating Action Button for quick tournament creation */}
      <FAB
        icon="add"
        label="Create"
        onClick={handleCreateTournament}
        variant="primary"
        size="large"
        position="bottom-right"
      />
    </div>
  );
}