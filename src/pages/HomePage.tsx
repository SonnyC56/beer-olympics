import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="text-center mb-12">
        <h1 className="text-7xl font-party font-bold text-neutral-0 text-shadow-lg">
          Beer Olympics
        </h1>
        <p className="text-2xl text-neutral-0/90 mt-2 text-shadow">
          Transform your backyard games into professional tournaments with real-time scoring and leaderboards
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Join Tournament</CardTitle>
            <CardDescription>
              Enter your tournament code to join the party!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Enter tournament code"
              value={tournamentCode}
              onChange={(e) => setTournamentCode(e.target.value)}
            />
            <Button onClick={handleJoinTournament} variant="secondary">
              Join Tournament
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Tournament</CardTitle>
            <CardDescription>
              Host your own epic Beer Olympics event!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateTournament} variant="tertiary" className="w-full">
              Create Tournament
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}