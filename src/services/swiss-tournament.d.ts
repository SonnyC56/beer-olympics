import type { Match, Team, Standing } from '../types/tournament';
interface SwissPlayer {
    id: string;
    score: number;
    opponents: string[];
    byes: number;
    buchholz?: number;
    sonnebornBerger?: number;
    wins: number;
    draws: number;
    losses: number;
}
interface SwissPairing {
    player1: string;
    player2: string | null;
    round: number;
}
export declare class SwissTournamentService {
    private players;
    private pairings;
    private currentRound;
    private maxRounds;
    constructor(teams: Team[], maxRounds?: number);
    /**
     * Generate pairings for the next round using Swiss system
     */
    generatePairings(round: number): SwissPairing[];
    /**
     * Update match result and player statistics
     */
    updateMatchResult(player1Id: string, player2Id: string | null, winner: string | null): void;
    /**
     * Calculate Buchholz score (sum of opponents' scores)
     */
    private calculateBuchholz;
    /**
     * Calculate Sonneborn-Berger score (sum of defeated opponents' scores + half of drawn opponents' scores)
     */
    private calculateSonnebornBerger;
    /**
     * Get current standings with tiebreakers
     */
    getStandings(): Standing[];
    /**
     * Check if tournament is complete
     */
    isComplete(): boolean;
    /**
     * Get all pairings for a specific round
     */
    getRoundPairings(round: number): SwissPairing[];
    /**
     * Convert Swiss pairings to tournament matches
     */
    pairingsToMatches(pairings: SwissPairing[], stationIds: string[], game: any): Match[];
    /**
     * Get player statistics
     */
    getPlayerStats(playerId: string): SwissPlayer | undefined;
    /**
     * Export tournament data for persistence
     */
    exportData(): {
        players: [string, SwissPlayer][];
        pairings: SwissPairing[];
        currentRound: number;
        maxRounds: number;
    };
    /**
     * Import tournament data
     */
    importData(data: any): void;
}
export default SwissTournamentService;
