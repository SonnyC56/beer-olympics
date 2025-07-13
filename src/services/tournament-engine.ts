/**
 * Tournament Engine Service
 * Integrates tournament-js libraries for comprehensive tournament management
 */

import Duel from 'duel';
import Group from 'group';
import FFA from 'ffa';
import Masters from 'masters';
import Tiebreaker from 'tiebreaker';
import roundrobin from 'roundrobin';

export type TournamentFormat = 
  | 'single_elimination' 
  | 'double_elimination'
  | 'round_robin'
  | 'group_stage'
  | 'free_for_all'
  | 'masters'
  | 'swiss';

export interface TournamentConfig {
  format: TournamentFormat;
  numPlayers: number;
  playerNames?: string[];
  groupSize?: number; // For group stage
  numGroups?: number; // For group stage
  bronzeMatch?: boolean; // For elimination tournaments
  short?: boolean; // For double elimination
  advancers?: number; // For group stage
  limit?: number; // For FFA
  maxRounds?: number; // For swiss/masters
}

export interface TournamentMatch {
  id: { s: number; r: number; m: number }; // section, round, match
  p: (number | null)[]; // players array
  m?: number[]; // scores array
  winners?: number[]; // winners array (for multi-winner matches)
}

export interface TournamentPlayer {
  seed: number;
  name: string;
  wins: number;
  for: number;
  against: number;
  pos: number;
}

export interface TournamentResults {
  results: TournamentPlayer[];
  complete: boolean;
  currentRound?: number;
  totalRounds?: number;
}

export class TournamentEngine {
  private tournament: any = null;
  private config: TournamentConfig;
  private playerMap: Map<number, string> = new Map();

  constructor(config: TournamentConfig) {
    this.config = config;
    this.initializePlayerMap();
    this.createTournament();
  }

  private initializePlayerMap(): void {
    if (this.config.playerNames) {
      this.config.playerNames.forEach((name, index) => {
        this.playerMap.set(index + 1, name);
      });
    } else {
      // Generate default player names
      for (let i = 1; i <= this.config.numPlayers; i++) {
        this.playerMap.set(i, `Player ${i}`);
      }
    }
  }

  private createTournament(): void {
    const { format, numPlayers } = this.config;

    switch (format) {
      case 'single_elimination':
        this.tournament = new Duel(numPlayers, { 
          short: false,
          bronze: this.config.bronzeMatch || false
        });
        break;

      case 'double_elimination':
        this.tournament = new Duel(numPlayers, { 
          short: this.config.short || false,
          bronze: this.config.bronzeMatch || false
        });
        break;

      case 'group_stage':
        if (!this.config.groupSize) {
          throw new Error('Group size required for group stage tournament');
        }
        this.tournament = new Group(numPlayers, {
          groupSize: this.config.groupSize,
          advancers: this.config.advancers || 2
        });
        break;

      case 'free_for_all':
        this.tournament = new FFA(numPlayers, {
          limit: this.config.limit || 4,
          advancers: this.config.advancers || 2
        });
        break;

      case 'masters':
        this.tournament = new Masters(numPlayers, {
          limit: this.config.limit || 4,
          maxRounds: this.config.maxRounds || 10
        });
        break;

      case 'round_robin':
        // Round robin doesn't use tournament-js Tournament class
        // We'll handle it separately with the roundrobin package
        break;

      default:
        throw new Error(`Unsupported tournament format: ${format}`);
    }
  }

  /**
   * Get all matches for the tournament
   */
  getMatches(): TournamentMatch[] {
    if (this.config.format === 'round_robin') {
      return this.getRoundRobinMatches();
    }

    if (!this.tournament) {
      throw new Error('Tournament not initialized');
    }

    return this.tournament.matches.map((match: any) => ({
      id: match.id,
      p: match.p,
      m: match.m,
      winners: match.winners
    }));
  }

  private getRoundRobinMatches(): TournamentMatch[] {
    const playerNames = Array.from(this.playerMap.values());
    const schedule = roundrobin(this.config.numPlayers, playerNames);
    
    const matches: TournamentMatch[] = [];
    
    schedule.forEach((round, roundIndex) => {
      round.forEach((match, matchIndex) => {
        // Find player seeds by name
        const player1Seed = this.getPlayerSeedByName(match.home || match[0]);
        const player2Seed = this.getPlayerSeedByName(match.away || match[1]);
        
        matches.push({
          id: { s: 1, r: roundIndex + 1, m: matchIndex + 1 },
          p: [player1Seed, player2Seed],
          m: undefined,
          winners: undefined
        });
      });
    });

    return matches;
  }

  private getPlayerSeedByName(playerName: string): number {
    for (const [seed, name] of this.playerMap.entries()) {
      if (name === playerName) {
        return seed;
      }
    }
    throw new Error(`Player not found: ${playerName}`);
  }

  /**
   * Score a match
   */
  scoreMatch(matchId: { s: number; r: number; m: number }, scores: number[]): boolean {
    if (this.config.format === 'round_robin') {
      // For round robin, we'll track scores separately
      // This is a simplified implementation
      return true;
    }

    if (!this.tournament) {
      throw new Error('Tournament not initialized');
    }

    try {
      return this.tournament.score(matchId, scores);
    } catch (error) {
      console.error('Error scoring match:', error);
      return false;
    }
  }

  /**
   * Get tournament results
   */
  getResults(): TournamentResults {
    if (this.config.format === 'round_robin') {
      return this.getRoundRobinResults();
    }

    if (!this.tournament) {
      throw new Error('Tournament not initialized');
    }

    const results = this.tournament.results();
    
    return {
      results: results.map((result: any) => ({
        seed: result.seed,
        name: this.playerMap.get(result.seed) || `Player ${result.seed}`,
        wins: result.wins,
        for: result.for,
        against: result.against,
        pos: result.pos
      })),
      complete: this.tournament.isDone(),
      currentRound: this.getCurrentRound(),
      totalRounds: this.getTotalRounds()
    };
  }

  private getRoundRobinResults(): TournamentResults {
    // Simplified round robin results
    // In a real implementation, you'd track match results
    const results: TournamentPlayer[] = [];
    
    for (let i = 1; i <= this.config.numPlayers; i++) {
      results.push({
        seed: i,
        name: this.playerMap.get(i) || `Player ${i}`,
        wins: 0,
        for: 0,
        against: 0,
        pos: i
      });
    }

    return {
      results,
      complete: false,
      currentRound: 1,
      totalRounds: this.config.numPlayers - 1
    };
  }

  /**
   * Get current round number
   */
  private getCurrentRound(): number {
    if (!this.tournament) return 1;
    
    const matches = this.tournament.matches;
    let currentRound = 1;
    
    for (const match of matches) {
      if (match.m) { // If match has been scored
        currentRound = Math.max(currentRound, match.id.r);
      } else {
        break;
      }
    }
    
    return currentRound;
  }

  /**
   * Get total number of rounds
   */
  getTotalRounds(): number {
    if (!this.tournament) return 1;
    
    return Math.max(...this.tournament.matches.map((m: any) => m.id.r));
  }

  /**
   * Check if tournament is complete
   */
  isComplete(): boolean {
    if (this.config.format === 'round_robin') {
      // Check if all round robin matches are complete
      return false; // Simplified for now
    }

    return this.tournament ? this.tournament.isDone() : false;
  }

  /**
   * Get matches for a specific round
   */
  getMatchesForRound(round: number): TournamentMatch[] {
    return this.getMatches().filter(match => match.id.r === round);
  }

  /**
   * Get upcoming matches (not yet scored)
   */
  getUpcomingMatches(): TournamentMatch[] {
    return this.getMatches().filter(match => !match.m);
  }

  /**
   * Get completed matches
   */
  getCompletedMatches(): TournamentMatch[] {
    return this.getMatches().filter(match => match.m);
  }

  /**
   * Get player name by seed
   */
  getPlayerName(seed: number): string {
    return this.playerMap.get(seed) || `Player ${seed}`;
  }

  /**
   * Get tournament bracket visualization data
   */
  getBracketData(): any {
    if (this.config.format === 'round_robin') {
      return this.getRoundRobinBracket();
    }

    const matches = this.getMatches();
    const bracket: any = {};

    // Group matches by round
    matches.forEach(match => {
      const round = match.id.r;
      if (!bracket[round]) {
        bracket[round] = [];
      }
      bracket[round].push({
        id: match.id,
        players: match.p.map(p => p ? this.getPlayerName(p) : 'TBD'),
        scores: match.m,
        winner: match.winners?.[0] ? this.getPlayerName(match.winners[0]) : null,
        complete: !!match.m
      });
    });

    return bracket;
  }

  private getRoundRobinBracket(): any {
    const matches = this.getRoundRobinMatches();
    const bracket: any = {};

    matches.forEach(match => {
      const round = match.id.r;
      if (!bracket[round]) {
        bracket[round] = [];
      }
      bracket[round].push({
        id: match.id,
        players: match.p.map(p => p ? this.getPlayerName(p) : 'TBD'),
        scores: match.m,
        winner: null,
        complete: !!match.m
      });
    });

    return bracket;
  }

  /**
   * Handle tiebreakers if needed
   */
  resolveTiebreaker(players: number[], method: 'head2head' | 'total' = 'head2head'): number[] {
    if (!this.tournament) {
      throw new Error('Tournament not initialized');
    }

    try {
      // Use tiebreaker library for complex tiebreaking scenarios
      const tiebreaker = new Tiebreaker(this.tournament, players, {
        compareBy: method
      });
      
      return tiebreaker.sorted();
    } catch (error) {
      console.error('Error resolving tiebreaker:', error);
      return players; // Return original order if tiebreaker fails
    }
  }

  /**
   * Export tournament state for persistence
   */
  exportState(): any {
    return {
      config: this.config,
      playerMap: Array.from(this.playerMap.entries()),
      tournamentState: this.tournament ? {
        matches: this.tournament.matches,
        results: this.tournament.results()
      } : null
    };
  }

  /**
   * Import tournament state from persistence
   */
  static importState(state: any): TournamentEngine {
    const engine = new TournamentEngine(state.config);
    
    // Restore player map
    engine.playerMap = new Map(state.playerMap);
    
    // Restore tournament state
    if (state.tournamentState && engine.tournament) {
      // Restore match scores
      state.tournamentState.matches.forEach((match: any) => {
        if (match.m) {
          engine.tournament.score(match.id, match.m);
        }
      });
    }
    
    return engine;
  }
}