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
import { SwissTournamentService } from './swiss-tournament';
import { SchedulingEngine } from './scheduling-engine';
import type { 
  Station, 
  ScheduleSlot, 
  SchedulingConfig, 
  ScheduleResult,
  SchedulingConstraint,
  ScheduledMatch
} from '../types/scheduling';

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
  private schedulingEngine: SchedulingEngine | null = null;
  private stations: Station[] = [];
  private schedule: ScheduleSlot[] = [];
  private swissEngine: SwissTournamentService | null = null;

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

      case 'swiss':
        // Swiss tournament uses custom service
        const teams = Array.from(this.playerMap.entries()).map(([seed, name]) => ({
          id: String(seed),
          name
        }));
        this.swissEngine = new SwissTournamentService(teams, this.config.maxRounds);
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

    if (this.config.format === 'swiss') {
      return this.getSwissMatches();
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

    if (this.config.format === 'swiss' && this.swissEngine) {
      // Find the match and determine winner
      const matches = this.getSwissMatches();
      const match = matches.find(m => 
        m.id.s === matchId.s && m.id.r === matchId.r && m.id.m === matchId.m
      );
      
      if (match && match.p[0] !== null && match.p[1] !== null) {
        const player1Id = String(match.p[0]);
        const player2Id = match.p[1] === null ? null : String(match.p[1]);
        let winner: string | null = null;
        
        if (scores[0] > scores[1]) winner = player1Id;
        else if (scores[1] > scores[0]) winner = player2Id;
        // null winner = draw
        
        this.swissEngine.updateMatchResult(player1Id, player2Id, winner);
        return true;
      }
      return false;
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

    if (this.config.format === 'swiss' && this.swissEngine) {
      const standings = this.swissEngine.getStandings();
      
      return {
        results: standings.map(standing => ({
          seed: Number(standing.teamId),
          name: this.playerMap.get(Number(standing.teamId)) || `Player ${standing.teamId}`,
          wins: standing.wins,
          for: standing.points,
          against: 0, // Swiss doesn't track this
          pos: standing.position
        })),
        complete: this.swissEngine.isComplete(),
        currentRound: this.getCurrentRound(),
        totalRounds: this.config.maxRounds || 7
      };
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
    if (this.config.format === 'swiss') {
      return this.config.maxRounds || 7;
    }
    
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

    if (this.config.format === 'swiss' && this.swissEngine) {
      return this.swissEngine.isComplete();
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
   * Swiss-specific methods
   */
  private getSwissMatches(): TournamentMatch[] {
    if (!this.swissEngine) return [];
    
    const allMatches: TournamentMatch[] = [];
    const currentRound = this.getCurrentRound();
    
    // Generate pairings for completed rounds and current round
    for (let round = 1; round <= currentRound; round++) {
      let pairings = this.swissEngine.getRoundPairings(round);
      
      // If no pairings exist for this round, generate them
      if (pairings.length === 0 && round <= (this.config.maxRounds || 7)) {
        pairings = this.swissEngine.generatePairings(round);
      }
      
      // Convert Swiss pairings to tournament matches
      pairings.forEach((pairing, index) => {
        allMatches.push({
          id: { s: 1, r: round, m: index + 1 },
          p: [
            pairing.player1 ? Number(pairing.player1) : null,
            pairing.player2 ? Number(pairing.player2) : null
          ],
          m: undefined, // Scores will be set when match is scored
          winners: undefined
        });
      });
    }
    
    return allMatches;
  }

  /**
   * Generate next round for Swiss tournament
   */
  generateSwissNextRound(): TournamentMatch[] {
    if (!this.swissEngine) return [];
    
    const currentRound = this.getCurrentRound();
    const nextRound = currentRound + 1;
    
    if (nextRound > (this.config.maxRounds || 7)) {
      return []; // Tournament complete
    }
    
    const pairings = this.swissEngine.generatePairings(nextRound);
    const matches = this.swissEngine.pairingsToMatches(
      pairings,
      this.stations.map(s => s.id),
      { id: 'default' } // Game info
    );
    
    return matches.map((match, index) => ({
      id: { s: 1, r: nextRound, m: index + 1 },
      p: [
        match.teamA ? Number(match.teamA) : null,
        match.teamB === 'BYE' ? null : Number(match.teamB)
      ],
      m: match.isComplete ? [1, 0] : undefined, // Bye matches auto-score
      winners: match.winner ? [Number(match.winner)] : undefined
    }));
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
      } : null,
      swissState: this.swissEngine ? this.swissEngine.exportData() : null
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
    
    // Restore Swiss state
    if (state.swissState && engine.swissEngine) {
      engine.swissEngine.importData(state.swissState);
    }
    
    // Restore stations and schedule if present
    if (state.stations) {
      engine.stations = state.stations;
    }
    if (state.schedule) {
      engine.schedule = state.schedule;
    }
    
    return engine;
  }

  /**
   * Station Management Methods
   */

  /**
   * Initialize stations for the tournament
   */
  initializeStations(stations: Station[]): void {
    this.stations = stations;
    if (this.schedulingEngine) {
      this.schedulingEngine.initializeStations(stations);
    }
  }

  /**
   * Add a new station
   */
  addStation(station: Station): void {
    this.stations.push(station);
    if (this.schedulingEngine) {
      this.schedulingEngine.initializeStations(this.stations);
    }
  }

  /**
   * Update station status
   */
  updateStationStatus(stationId: string, status: Station['status']): void {
    const station = this.stations.find(s => s.id === stationId);
    if (station) {
      station.status = status;
      station.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Get all stations
   */
  getStations(): Station[] {
    return this.stations;
  }

  /**
   * Get available stations
   */
  getAvailableStations(): Station[] {
    return this.stations.filter(s => s.status === 'available' && s.isActive);
  }

  /**
   * Scheduling Methods
   */

  /**
   * Initialize scheduling engine with config
   */
  initializeScheduling(config: SchedulingConfig): void {
    this.schedulingEngine = new SchedulingEngine(config);
    if (this.stations.length > 0) {
      this.schedulingEngine.initializeStations(this.stations);
    }
  }

  /**
   * Generate schedule for all matches
   */
  async generateSchedule(
    schedulingConfig: SchedulingConfig,
    constraints: SchedulingConstraint[] = []
  ): Promise<ScheduleResult> {
    if (!this.schedulingEngine) {
      this.initializeScheduling(schedulingConfig);
    }

    const matches = this.getMatches();
    const tournamentMatches = matches.map(m => ({
      ...m,
      _type: 'match' as const,
      id: `${m.id.s}-${m.id.r}-${m.id.m}`,
      tournamentId: 'current', // This would be set properly in real implementation
      round: m.id.r,
      isComplete: !!m.m,
      createdAt: new Date().toISOString()
    }));

    const result = await this.schedulingEngine!.generateSchedule(
      tournamentMatches as any[], // Type assertion for simplicity
      constraints
    );

    if (result.success) {
      this.schedule = result.schedule;
    }

    return result;
  }

  /**
   * Get schedule for specific round
   */
  getScheduleForRound(round: number): ScheduleSlot[] {
    return this.schedule.filter(slot => slot.round === round);
  }

  /**
   * Get schedule for specific station
   */
  getScheduleForStation(stationId: string): ScheduleSlot[] {
    return this.schedule.filter(slot => slot.stationId === stationId);
  }

  /**
   * Update match with scheduled time and station
   */
  assignMatchToSlot(matchId: string, slotId: string): void {
    const slot = this.schedule.find(s => s.id === slotId);
    if (slot) {
      slot.matchId = matchId;
      slot.status = 'scheduled';
      slot.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Handle match delay
   */
  async handleMatchDelay(slotId: string, delayMinutes: number): Promise<ScheduleResult> {
    if (!this.schedulingEngine) {
      throw new Error('Scheduling engine not initialized');
    }

    return await this.schedulingEngine.rescheduleForDelay(slotId, delayMinutes);
  }

  /**
   * Get matches with scheduling info
   */
  getScheduledMatches(): ScheduledMatch[] {
    const matches = this.getMatches();
    
    return matches.map(match => {
      const matchId = `${match.id.s}-${match.id.r}-${match.id.m}`;
      const slot = this.schedule.find(s => s.matchId === matchId);
      
      return {
        _type: 'match' as const,
        id: matchId,
        tournamentId: 'current',
        tournamentMatchId: match.id,
        round: match.id.r,
        teamA: match.p[0] ? this.getPlayerName(match.p[0]) : undefined,
        teamB: match.p[1] ? this.getPlayerName(match.p[1]) : undefined,
        isComplete: !!match.m,
        finalScore: match.m ? { a: match.m[0], b: match.m[1] } : undefined,
        winner: match.winners?.[0] ? this.getPlayerName(match.winners[0]) : undefined,
        scheduledSlotId: slot?.id,
        scheduledStartTime: slot?.startTime,
        scheduledEndTime: slot?.endTime,
        scheduledStationId: slot?.stationId,
        scheduledStationName: slot?.stationName,
        mediaIds: [],
        createdAt: new Date().toISOString()
      };
    });
  }

  /**
   * Check for scheduling conflicts
   */
  getSchedulingConflicts(): any[] {
    if (!this.schedulingEngine) {
      return [];
    }

    // This would return conflicts from the last schedule generation
    return [];
  }

  /**
   * Export tournament state including stations and schedule
   */
  exportStateWithSchedule(): any {
    const baseState = this.exportState();
    
    return {
      ...baseState,
      stations: this.stations,
      schedule: this.schedule,
      schedulingConfig: this.schedulingEngine ? {} : null // Would include actual config
    };
  }

  /**
   * Get station utilization stats
   */
  getStationUtilization(): { [stationId: string]: number } {
    const utilization: { [stationId: string]: number } = {};
    
    this.stations.forEach(station => {
      const stationSlots = this.schedule.filter(s => s.stationId === station.id);
      const totalTime = stationSlots.reduce((sum, slot) => sum + slot.duration, 0);
      utilization[station.id] = totalTime;
    });
    
    return utilization;
  }

  /**
   * Recommend stations for a match based on various factors
   */
  recommendStationsForMatch(matchId: string): Station[] {
    // Simple recommendation logic - can be enhanced
    const availableStations = this.getAvailableStations();
    
    // Sort by least used
    return availableStations.sort((a, b) => {
      const aUsage = this.schedule.filter(s => s.stationId === a.id).length;
      const bUsage = this.schedule.filter(s => s.stationId === b.id).length;
      return aUsage - bUsage;
    });
  }
}