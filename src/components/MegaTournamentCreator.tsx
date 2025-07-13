import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { trpc } from '../utils/trpc';
import { toast } from 'sonner';

interface SubTournamentConfig {
  name: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  maxTeams: number;
}

interface BonusChallenge {
  name: string;
  description: string;
  points: number;
  type: 'team' | 'individual';
}

export function MegaTournamentCreator() {
  const [megaTournamentName, setMegaTournamentName] = useState('');
  const [date, setDate] = useState('');
  const [subTournaments, setSubTournaments] = useState<SubTournamentConfig[]>([
    { name: 'Beer Pong Championship', format: 'single_elimination', maxTeams: 16 },
    { name: 'Beer Die Tournament', format: 'double_elimination', maxTeams: 8 },
    { name: 'Flip Cup League', format: 'round_robin', maxTeams: 12 }
  ]);
  const [bonusChallenges, setBonusChallenges] = useState<BonusChallenge[]>([
    { name: 'Karaoke Champion', description: 'Perform a crowd-favorite song', points: 50, type: 'individual' },
    { name: 'Best Team Spirit', description: 'Show amazing team enthusiasm', points: 75, type: 'team' },
    { name: 'Social Media Star', description: 'Post the best tournament photo/video', points: 25, type: 'individual' }
  ]);
  const [editingSubIndex, setEditingSubIndex] = useState<number | null>(null);
  const [editingBonusIndex, setEditingBonusIndex] = useState<number | null>(null);

  const createMegaTournament = trpc.tournament.createMegaTournament.useMutation({
    onSuccess: (data) => {
      toast.success('Mega tournament created successfully!');
      console.log('Created mega tournament:', data);
    },
    onError: (error) => {
      toast.error(`Failed to create mega tournament: ${error.message}`);
    }
  });

  // Sub-tournament management functions
  const addSubTournament = () => {
    setSubTournaments([...subTournaments, {
      name: 'New Tournament',
      format: 'single_elimination',
      maxTeams: 16
    }]);
  };

  const updateSubTournament = (index: number, updates: Partial<SubTournamentConfig>) => {
    const updated = [...subTournaments];
    updated[index] = { ...updated[index], ...updates };
    setSubTournaments(updated);
  };

  const deleteSubTournament = (index: number) => {
    setSubTournaments(subTournaments.filter((_, i) => i !== index));
  };

  // Bonus challenge management functions
  const addBonusChallenge = () => {
    setBonusChallenges([...bonusChallenges, {
      name: 'New Challenge',
      description: 'Description',
      points: 25,
      type: 'individual'
    }]);
  };

  const updateBonusChallenge = (index: number, updates: Partial<BonusChallenge>) => {
    const updated = [...bonusChallenges];
    updated[index] = { ...updated[index], ...updates };
    setBonusChallenges(updated);
  };

  const deleteBonusChallenge = (index: number) => {
    setBonusChallenges(bonusChallenges.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!megaTournamentName || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    createMegaTournament.mutate({
      name: megaTournamentName,
      date,
      subTournaments: subTournaments.map(st => ({
        name: st.name,
        format: st.format,
        maxTeams: st.maxTeams,
        pointsForPlacement: { 1: 100, 2: 75, 3: 50, 4: 25 }
      })),
      bonusChallenges: bonusChallenges.map((bc, index) => ({
        id: `bonus-${index}`,
        name: bc.name,
        description: bc.description,
        points: bc.points,
        type: bc.type,
        maxCompletions: 1,
        requirements: []
      })),
      megaScoringMethod: 'placement'
    });
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Mega Tournament</h2>
      <p className="text-gray-600 mb-6">
        Create a mega tournament that spans multiple games with overall scoring and bonus challenges!
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Mega Tournament Name</label>
          <Input
            value={megaTournamentName}
            onChange={(e) => setMegaTournamentName(e.target.value)}
            placeholder="Summer Beer Olympics 2024"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Sub-Tournaments</h3>
            <Button type="button" size="sm" onClick={addSubTournament}>
              Add Tournament
            </Button>
          </div>
          <div className="space-y-3">
            {subTournaments.map((st, index) => (
              <Card key={index} className="p-4 bg-gray-50">
                {editingSubIndex === index ? (
                  <div className="space-y-3">
                    <Input
                      value={st.name}
                      onChange={(e) => updateSubTournament(index, { name: e.target.value })}
                      placeholder="Tournament name"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={st.format}
                        onChange={(e) => updateSubTournament(index, { format: e.target.value as any })}
                      >
                        <option value="single_elimination">Single Elimination</option>
                        <option value="double_elimination">Double Elimination</option>
                        <option value="round_robin">Round Robin</option>
                      </select>
                      <Input
                        type="number"
                        value={st.maxTeams}
                        onChange={(e) => updateSubTournament(index, { maxTeams: parseInt(e.target.value) })}
                        min="2"
                        max="128"
                        placeholder="Max teams"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => setEditingSubIndex(null)}>
                        Save
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => deleteSubTournament(index)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{st.name}</h4>
                      <p className="text-sm text-gray-600">
                        Format: {st.format.replace('_', ' ')} | Max Teams: {st.maxTeams}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">
                        Points: 1st: 100 | 2nd: 75 | 3rd: 50 | 4th: 25
                      </div>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingSubIndex(index)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Bonus Challenges</h3>
            <Button type="button" size="sm" onClick={addBonusChallenge}>
              Add Challenge
            </Button>
          </div>
          <div className="space-y-3">
            {bonusChallenges.map((bc, index) => (
              <Card key={index} className="p-4 bg-blue-50">
                {editingBonusIndex === index ? (
                  <div className="space-y-3">
                    <Input
                      value={bc.name}
                      onChange={(e) => updateBonusChallenge(index, { name: e.target.value })}
                      placeholder="Challenge name"
                    />
                    <Input
                      value={bc.description}
                      onChange={(e) => updateBonusChallenge(index, { description: e.target.value })}
                      placeholder="Description"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        value={bc.points}
                        onChange={(e) => updateBonusChallenge(index, { points: parseInt(e.target.value) })}
                        min="5"
                        max="200"
                        placeholder="Points"
                      />
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={bc.type}
                        onChange={(e) => updateBonusChallenge(index, { type: e.target.value as 'team' | 'individual' })}
                      >
                        <option value="individual">Individual</option>
                        <option value="team">Team</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => setEditingBonusIndex(null)}>
                        Save
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => deleteBonusChallenge(index)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{bc.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-blue-600">+{bc.points} pts</span>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingBonusIndex(index)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{bc.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Type: {bc.type}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={createMegaTournament.isPending}
        >
          {createMegaTournament.isPending ? 'Creating...' : 'Create Mega Tournament'}
        </Button>
      </form>
    </Card>
  );
}