import { v4 as uuidv4 } from 'uuid';
export class SwissTournamentService {
    constructor(teams, maxRounds = 0) {
        Object.defineProperty(this, "players", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "pairings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "currentRound", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "maxRounds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Initialize players
        teams.forEach(team => {
            this.players.set(team.id, {
                id: team.id,
                score: 0,
                opponents: [],
                byes: 0,
                wins: 0,
                draws: 0,
                losses: 0
            });
        });
        // Calculate default max rounds if not specified
        if (maxRounds === 0) {
            const playerCount = teams.length;
            if (playerCount <= 8)
                this.maxRounds = 3;
            else if (playerCount <= 16)
                this.maxRounds = 4;
            else if (playerCount <= 32)
                this.maxRounds = 5;
            else if (playerCount <= 64)
                this.maxRounds = 6;
            else
                this.maxRounds = 7;
        }
        else {
            this.maxRounds = maxRounds;
        }
    }
    /**
     * Generate pairings for the next round using Swiss system
     */
    generatePairings(round) {
        const roundPairings = [];
        const availablePlayers = new Set(this.players.keys());
        // Sort players by score (descending), then by tiebreakers
        const sortedPlayers = Array.from(this.players.entries())
            .sort(([, a], [, b]) => {
            // Primary: Score
            if (b.score !== a.score)
                return b.score - a.score;
            // Secondary: Buchholz (sum of opponents' scores)
            const buchholzA = this.calculateBuchholz(a.id);
            const buchholzB = this.calculateBuchholz(b.id);
            if (buchholzB !== buchholzA)
                return buchholzB - buchholzA;
            // Tertiary: Sonneborn-Berger
            const sbA = this.calculateSonnebornBerger(a.id);
            const sbB = this.calculateSonnebornBerger(b.id);
            return sbB - sbA;
        })
            .map(([id]) => id);
        // Pair players with similar scores
        for (const playerId of sortedPlayers) {
            if (!availablePlayers.has(playerId))
                continue;
            const player = this.players.get(playerId);
            let paired = false;
            // Try to find an opponent with similar score that hasn't been played before
            for (const opponentId of sortedPlayers) {
                if (opponentId === playerId)
                    continue;
                if (!availablePlayers.has(opponentId))
                    continue;
                if (player.opponents.includes(opponentId))
                    continue;
                // Pair these players
                roundPairings.push({
                    player1: playerId,
                    player2: opponentId,
                    round
                });
                availablePlayers.delete(playerId);
                availablePlayers.delete(opponentId);
                paired = true;
                break;
            }
            // If no pairing found and odd number of players, assign bye
            if (!paired && availablePlayers.size === 1) {
                roundPairings.push({
                    player1: playerId,
                    player2: null,
                    round
                });
                availablePlayers.delete(playerId);
            }
        }
        this.pairings.push(...roundPairings);
        this.currentRound = round;
        return roundPairings;
    }
    /**
     * Update match result and player statistics
     */
    updateMatchResult(player1Id, player2Id, winner) {
        const player1 = this.players.get(player1Id);
        if (player2Id === null) {
            // Bye - player gets 1 point
            player1.score += 1;
            player1.byes += 1;
            player1.wins += 1;
            return;
        }
        const player2 = this.players.get(player2Id);
        // Update opponents list
        if (!player1.opponents.includes(player2Id)) {
            player1.opponents.push(player2Id);
        }
        if (!player2.opponents.includes(player1Id)) {
            player2.opponents.push(player1Id);
        }
        // Update scores based on result
        if (winner === player1Id) {
            player1.score += 1;
            player1.wins += 1;
            player2.losses += 1;
        }
        else if (winner === player2Id) {
            player2.score += 1;
            player2.wins += 1;
            player1.losses += 1;
        }
        else {
            // Draw
            player1.score += 0.5;
            player2.score += 0.5;
            player1.draws += 1;
            player2.draws += 1;
        }
    }
    /**
     * Calculate Buchholz score (sum of opponents' scores)
     */
    calculateBuchholz(playerId) {
        const player = this.players.get(playerId);
        let buchholz = 0;
        for (const opponentId of player.opponents) {
            const opponent = this.players.get(opponentId);
            if (opponent) {
                buchholz += opponent.score;
            }
        }
        return buchholz;
    }
    /**
     * Calculate Sonneborn-Berger score (sum of defeated opponents' scores + half of drawn opponents' scores)
     */
    calculateSonnebornBerger(playerId) {
        // This would require tracking individual match results
        // For now, we'll use a simplified version
        const player = this.players.get(playerId);
        return player.wins * 1 + player.draws * 0.5;
    }
    /**
     * Get current standings with tiebreakers
     */
    getStandings() {
        const standings = [];
        for (const [id, player] of this.players) {
            player.buchholz = this.calculateBuchholz(id);
            player.sonnebornBerger = this.calculateSonnebornBerger(id);
            standings.push({
                teamId: id,
                position: 0, // Will be set after sorting
                wins: player.wins,
                losses: player.losses,
                draws: player.draws,
                points: player.score,
                gamesPlayed: player.wins + player.losses + player.draws,
                buchholz: player.buchholz,
                sonnebornBerger: player.sonnebornBerger,
                headToHead: {} // Would need match history for this
            });
        }
        // Sort by score, then tiebreakers
        standings.sort((a, b) => {
            if (b.points !== a.points)
                return b.points - a.points;
            if (b.buchholz !== a.buchholz)
                return b.buchholz - a.buchholz;
            return b.sonnebornBerger - a.sonnebornBerger;
        });
        // Assign positions
        standings.forEach((standing, index) => {
            standing.position = index + 1;
        });
        return standings;
    }
    /**
     * Check if tournament is complete
     */
    isComplete() {
        return this.currentRound >= this.maxRounds;
    }
    /**
     * Get all pairings for a specific round
     */
    getRoundPairings(round) {
        return this.pairings.filter(p => p.round === round);
    }
    /**
     * Convert Swiss pairings to tournament matches
     */
    pairingsToMatches(pairings, stationIds, game) {
        const matches = [];
        let stationIndex = 0;
        for (const pairing of pairings) {
            if (pairing.player2 === null) {
                // Bye match - auto win for player1
                matches.push({
                    _type: 'match',
                    id: uuidv4(),
                    tournamentId: '',
                    round: pairing.round,
                    teamA: pairing.player1,
                    teamB: 'BYE',
                    stationId: undefined,
                    isComplete: true,
                    winner: pairing.player1,
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString(),
                    mediaIds: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            else {
                // Regular match
                matches.push({
                    _type: 'match',
                    id: uuidv4(),
                    tournamentId: '',
                    round: pairing.round,
                    teamA: pairing.player1,
                    teamB: pairing.player2,
                    stationId: stationIds[stationIndex % stationIds.length],
                    isComplete: false,
                    winner: undefined,
                    mediaIds: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                stationIndex++;
            }
        }
        return matches;
    }
    /**
     * Get player statistics
     */
    getPlayerStats(playerId) {
        return this.players.get(playerId);
    }
    /**
     * Export tournament data for persistence
     */
    exportData() {
        return {
            players: Array.from(this.players.entries()),
            pairings: this.pairings,
            currentRound: this.currentRound,
            maxRounds: this.maxRounds
        };
    }
    /**
     * Import tournament data
     */
    importData(data) {
        this.players = new Map(data.players);
        this.pairings = data.pairings;
        this.currentRound = data.currentRound;
        this.maxRounds = data.maxRounds;
    }
}
export default SwissTournamentService;
