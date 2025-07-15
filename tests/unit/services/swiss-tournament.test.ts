import { describe, it, expect, beforeEach } from 'vitest';
import { SwissTournamentService } from '../../../src/services/swiss-tournament';
import type { Team } from '../../../src/types/tournament';

describe('SwissTournamentService', () => {
  let service: SwissTournamentService;
  let teams: Team[];

  beforeEach(() => {
    // Create test teams
    teams = [];
    for (let i = 1; i <= 8; i++) {
      teams.push({
        id: String(i),
        name: `Team ${i}`,
        players: [`Player ${i}A`, `Player ${i}B`]
      });
    }
  });

  describe('initialization', () => {
    it('should initialize with correct number of players', () => {
      service = new SwissTournamentService(teams);
      const standings = service.getStandings();
      
      expect(standings).toHaveLength(8);
      expect(standings[0].points).toBe(0);
    });

    it('should calculate correct max rounds for different player counts', () => {
      // 8 players = 3 rounds
      service = new SwissTournamentService(teams.slice(0, 8));
      expect(service['maxRounds']).toBe(3);

      // 16 players = 4 rounds
      const teams16 = Array.from({ length: 16 }, (_, i) => ({
        id: String(i + 1),
        name: `Team ${i + 1}`
      }));
      service = new SwissTournamentService(teams16);
      expect(service['maxRounds']).toBe(4);

      // 32 players = 5 rounds
      const teams32 = Array.from({ length: 32 }, (_, i) => ({
        id: String(i + 1),
        name: `Team ${i + 1}`
      }));
      service = new SwissTournamentService(teams32);
      expect(service['maxRounds']).toBe(5);
    });
  });

  describe('pairing generation', () => {
    beforeEach(() => {
      service = new SwissTournamentService(teams);
    });

    it('should generate correct number of pairings for round 1', () => {
      const pairings = service.generatePairings(1);
      
      expect(pairings).toHaveLength(4); // 8 players = 4 matches
      expect(pairings.every(p => p.round === 1)).toBe(true);
    });

    it('should not pair players against same opponent twice', () => {
      // Simulate round 1
      const round1 = service.generatePairings(1);
      
      // Score matches
      round1.forEach(pairing => {
        if (pairing.player2) {
          service.updateMatchResult(pairing.player1, pairing.player2, pairing.player1);
        }
      });

      // Generate round 2
      const round2 = service.generatePairings(2);
      
      // Check no repeat pairings
      round2.forEach(pairing => {
        const player1 = service['players'].get(pairing.player1)!;
        if (pairing.player2) {
          expect(player1.opponents).not.toContain(pairing.player2);
        }
      });
    });

    it('should handle odd number of players with bye', () => {
      const oddTeams = teams.slice(0, 7); // 7 teams
      service = new SwissTournamentService(oddTeams);
      
      const pairings = service.generatePairings(1);
      
      expect(pairings).toHaveLength(4); // 3 matches + 1 bye
      expect(pairings.some(p => p.player2 === null)).toBe(true);
    });

    it('should pair players with similar scores', () => {
      // Simulate some matches
      service.updateMatchResult('1', '2', '1'); // Team 1 wins
      service.updateMatchResult('3', '4', '3'); // Team 3 wins
      service.updateMatchResult('5', '6', '5'); // Team 5 wins
      service.updateMatchResult('7', '8', '7'); // Team 7 wins

      // Generate round 2 - winners should face winners
      const round2 = service.generatePairings(2);
      
      // Get scores
      const getScore = (playerId: string) => service['players'].get(playerId)!.score;
      
      // Check that paired players have similar scores
      round2.forEach(pairing => {
        if (pairing.player2) {
          const score1 = getScore(pairing.player1);
          const score2 = getScore(pairing.player2);
          expect(Math.abs(score1 - score2)).toBeLessThanOrEqual(0.5);
        }
      });
    });
  });

  describe('match results', () => {
    beforeEach(() => {
      service = new SwissTournamentService(teams);
    });

    it('should update scores correctly for wins', () => {
      service.updateMatchResult('1', '2', '1');
      
      const player1 = service.getPlayerStats('1')!;
      const player2 = service.getPlayerStats('2')!;
      
      expect(player1.score).toBe(1);
      expect(player1.wins).toBe(1);
      expect(player1.losses).toBe(0);
      
      expect(player2.score).toBe(0);
      expect(player2.wins).toBe(0);
      expect(player2.losses).toBe(1);
    });

    it('should update scores correctly for draws', () => {
      service.updateMatchResult('1', '2', null); // Draw
      
      const player1 = service.getPlayerStats('1')!;
      const player2 = service.getPlayerStats('2')!;
      
      expect(player1.score).toBe(0.5);
      expect(player1.draws).toBe(1);
      
      expect(player2.score).toBe(0.5);
      expect(player2.draws).toBe(1);
    });

    it('should handle bye correctly', () => {
      service.updateMatchResult('1', null, null);
      
      const player1 = service.getPlayerStats('1')!;
      
      expect(player1.score).toBe(1);
      expect(player1.byes).toBe(1);
      expect(player1.wins).toBe(1);
    });
  });

  describe('tiebreakers', () => {
    beforeEach(() => {
      service = new SwissTournamentService(teams);
    });

    it('should calculate Buchholz correctly', () => {
      // Set up a scenario where tiebreakers matter
      service.updateMatchResult('1', '2', '1'); // 1 beats 2
      service.updateMatchResult('3', '4', '3'); // 3 beats 4
      service.updateMatchResult('1', '3', '1'); // 1 beats 3
      service.updateMatchResult('2', '4', '2'); // 2 beats 4
      
      const standings = service.getStandings();
      
      // Team 1: 2 wins (beat 2 and 3)
      // Team 3: 1 win (beat 4)
      // Team 2: 1 win (beat 4)
      // Team 4: 0 wins
      
      expect(standings[0].teamId).toBe('1');
      expect(standings[0].points).toBe(2);
      
      // Teams 2 and 3 both have 1 win, check Buchholz
      const team2 = standings.find(s => s.teamId === '2')!;
      const team3 = standings.find(s => s.teamId === '3')!;
      
      expect(team2.buchholz).toBeDefined();
      expect(team3.buchholz).toBeDefined();
    });
  });

  describe('standings', () => {
    beforeEach(() => {
      service = new SwissTournamentService(teams);
    });

    it('should rank teams correctly', () => {
      // Simulate a few rounds
      service.updateMatchResult('1', '2', '1');
      service.updateMatchResult('3', '4', '3');
      service.updateMatchResult('5', '6', '5');
      service.updateMatchResult('7', '8', '7');
      
      const standings = service.getStandings();
      
      // Winners should be ranked 1-4
      const winners = ['1', '3', '5', '7'];
      const topFour = standings.slice(0, 4).map(s => s.teamId);
      
      winners.forEach(winner => {
        expect(topFour).toContain(winner);
      });
      
      // All positions should be sequential
      standings.forEach((standing, index) => {
        expect(standing.position).toBe(index + 1);
      });
    });
  });

  describe('tournament completion', () => {
    it('should not be complete until max rounds reached', () => {
      service = new SwissTournamentService(teams, 3);
      
      expect(service.isComplete()).toBe(false);
      
      // Simulate 2 rounds
      for (let round = 1; round <= 2; round++) {
        const pairings = service.generatePairings(round);
        pairings.forEach(p => {
          if (p.player2) {
            service.updateMatchResult(p.player1, p.player2, p.player1);
          }
        });
      }
      
      expect(service.isComplete()).toBe(false);
      
      // Complete round 3
      const round3 = service.generatePairings(3);
      round3.forEach(p => {
        if (p.player2) {
          service.updateMatchResult(p.player1, p.player2, p.player1);
        }
      });
      
      expect(service.isComplete()).toBe(true);
    });
  });

  describe('data persistence', () => {
    it('should export and import state correctly', () => {
      service = new SwissTournamentService(teams);
      
      // Generate some matches
      const round1 = service.generatePairings(1);
      service.updateMatchResult('1', '2', '1');
      service.updateMatchResult('3', '4', '3');
      
      // Export state
      const exportedData = service.exportData();
      
      // Create new service and import
      const newService = new SwissTournamentService(teams);
      newService.importData(exportedData);
      
      // Verify state
      const standings = newService.getStandings();
      expect(standings.find(s => s.teamId === '1')!.points).toBe(1);
      expect(standings.find(s => s.teamId === '3')!.points).toBe(1);
      
      const round1Pairings = newService.getRoundPairings(1);
      expect(round1Pairings).toHaveLength(round1.length);
    });
  });

  describe('pairingsToMatches conversion', () => {
    it('should convert pairings to match objects correctly', () => {
      service = new SwissTournamentService(teams);
      const pairings = service.generatePairings(1);
      
      const stationIds = ['station1', 'station2', 'station3', 'station4'];
      const game = { id: 'game1', name: 'Beer Pong' };
      
      const matches = service.pairingsToMatches(pairings, stationIds, game);
      
      expect(matches).toHaveLength(pairings.length);
      
      matches.forEach((match, index) => {
        expect(match.round).toBe(1);
        expect(match.matchNumber).toBe(index + 1);
        
        if (match.team2Id !== 'BYE') {
          expect(match.stationId).toBe(stationIds[index % stationIds.length]);
          expect(match.gameId).toBe(game.id);
          expect(match.status).toBe('upcoming');
        } else {
          expect(match.status).toBe('completed');
          expect(match.winner).toBe(match.team1Id);
        }
      });
    });
  });
});

export {};