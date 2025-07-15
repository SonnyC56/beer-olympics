/**
 * Tournament Engine Service
 * Integrates tournament-js libraries for comprehensive tournament management
 */
import type { Station, ScheduleSlot, SchedulingConfig, ScheduleResult, SchedulingConstraint, ScheduledMatch } from '../types/scheduling';
export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'group_stage' | 'free_for_all' | 'masters' | 'swiss';
export interface TournamentConfig {
    format: TournamentFormat;
    numPlayers: number;
    playerNames?: string[];
    groupSize?: number;
    numGroups?: number;
    bronzeMatch?: boolean;
    short?: boolean;
    advancers?: number;
    limit?: number;
    maxRounds?: number;
}
export interface TournamentMatch {
    id: {
        s: number;
        r: number;
        m: number;
    };
    p: (number | null)[];
    m?: number[];
    winners?: number[];
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
export declare class TournamentEngine {
    private tournament;
    private config;
    private playerMap;
    private schedulingEngine;
    private stations;
    private schedule;
    private swissEngine;
    constructor(config: TournamentConfig);
    private initializePlayerMap;
    private createTournament;
    /**
     * Get all matches for the tournament
     */
    getMatches(): TournamentMatch[];
    private getRoundRobinMatches;
    private getPlayerSeedByName;
    /**
     * Score a match
     */
    scoreMatch(matchId: {
        s: number;
        r: number;
        m: number;
    }, scores: number[]): boolean;
    /**
     * Get tournament results
     */
    getResults(): TournamentResults;
    private getRoundRobinResults;
    /**
     * Get current round number
     */
    private getCurrentRound;
    /**
     * Get total number of rounds
     */
    getTotalRounds(): number;
    /**
     * Check if tournament is complete
     */
    isComplete(): boolean;
    /**
     * Get matches for a specific round
     */
    getMatchesForRound(round: number): TournamentMatch[];
    /**
     * Get upcoming matches (not yet scored)
     */
    getUpcomingMatches(): TournamentMatch[];
    /**
     * Get completed matches
     */
    getCompletedMatches(): TournamentMatch[];
    /**
     * Get player name by seed
     */
    getPlayerName(seed: number): string;
    /**
     * Get tournament bracket visualization data
     */
    getBracketData(): any;
    private getRoundRobinBracket;
    /**
     * Swiss-specific methods
     */
    private getSwissMatches;
    /**
     * Generate next round for Swiss tournament
     */
    generateSwissNextRound(): TournamentMatch[];
    /**
     * Handle tiebreakers if needed
     */
    resolveTiebreaker(players: number[], method?: 'head2head' | 'total'): number[];
    /**
     * Export tournament state for persistence
     */
    exportState(): any;
    /**
     * Import tournament state from persistence
     */
    static importState(state: any): TournamentEngine;
    /**
     * Station Management Methods
     */
    /**
     * Initialize stations for the tournament
     */
    initializeStations(stations: Station[]): void;
    /**
     * Add a new station
     */
    addStation(station: Station): void;
    /**
     * Update station status
     */
    updateStationStatus(stationId: string, status: Station['status']): void;
    /**
     * Get all stations
     */
    getStations(): Station[];
    /**
     * Get available stations
     */
    getAvailableStations(): Station[];
    /**
     * Scheduling Methods
     */
    /**
     * Initialize scheduling engine with config
     */
    initializeScheduling(config: SchedulingConfig): void;
    /**
     * Generate schedule for all matches
     */
    generateSchedule(schedulingConfig: SchedulingConfig, constraints?: SchedulingConstraint[]): Promise<ScheduleResult>;
    /**
     * Get schedule for specific round
     */
    getScheduleForRound(round: number): ScheduleSlot[];
    /**
     * Get schedule for specific station
     */
    getScheduleForStation(stationId: string): ScheduleSlot[];
    /**
     * Update match with scheduled time and station
     */
    assignMatchToSlot(matchId: string, slotId: string): void;
    /**
     * Handle match delay
     */
    handleMatchDelay(slotId: string, delayMinutes: number): Promise<ScheduleResult>;
    /**
     * Get matches with scheduling info
     */
    getScheduledMatches(): ScheduledMatch[];
    /**
     * Check for scheduling conflicts
     */
    getSchedulingConflicts(): any[];
    /**
     * Export tournament state including stations and schedule
     */
    exportStateWithSchedule(): any;
    /**
     * Get station utilization stats
     */
    getStationUtilization(): {
        [stationId: string]: number;
    };
    /**
     * Recommend stations for a match based on various factors
     */
    recommendStationsForMatch(matchId: string): Station[];
}
