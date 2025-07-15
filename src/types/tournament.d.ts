/**
 * Tournament Types and Interfaces
 * Enhanced with tournament-js integration
 */
import type { TournamentFormat, TournamentConfig, TournamentMatch, TournamentPlayer, TournamentResults } from '../services/tournament-engine';
export type { TournamentFormat, TournamentConfig, TournamentMatch, TournamentPlayer, TournamentResults };
export interface Tournament {
    _type: 'tournament';
    slug: string;
    name: string;
    date: string;
    ownerId: string;
    isOpen: boolean;
    format: TournamentFormat;
    maxTeams: number;
    createdAt: string;
    updatedAt: string;
    parentTournamentId?: string;
    subTournamentIds?: string[];
    isMegaTournament?: boolean;
    config?: TournamentConfig;
    currentRound?: number;
    totalRounds?: number;
    isComplete?: boolean;
    settings?: TournamentSettings;
    status?: 'SETUP' | 'READY' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
}
export interface TournamentSettings {
    allowTies?: boolean;
    pointsPerWin?: number;
    pointsPerTie?: number;
    pointsPerLoss?: number;
    tiebreakMethod?: 'head2head' | 'total' | 'random';
    autoAdvance?: boolean;
    bronzeMatch?: boolean;
    thirdPlaceMatch?: boolean;
    seedingMethod?: 'random' | 'manual' | 'ranking';
    maxMatchesPerRound?: number;
    matchDuration?: number;
    breakBetweenMatches?: number;
    venue?: string;
    prizes?: Prize[];
    rules?: string[];
    megaTournamentScoring?: MegaTournamentScoring;
    bonusChallenges?: BonusChallenge[];
}
export interface Prize {
    position: number;
    title: string;
    description?: string;
    value?: string;
}
export interface MegaTournamentScoring {
    method: 'placement' | 'points' | 'hybrid';
    placementPoints?: {
        [position: number]: number;
    };
    participationPoints?: number;
    bonusPointsEnabled?: boolean;
}
export interface BonusChallenge {
    id: string;
    name: string;
    description: string;
    points: number;
    type: 'team' | 'individual';
    maxCompletions?: number;
    availableIn?: string[];
    requirements?: string[];
}
export interface MegaTournamentScore {
    _type: 'mega_tournament_score';
    megaTournamentId: string;
    teamId: string;
    totalPoints: number;
    placementPoints: number;
    bonusPoints: number;
    tournamentScores: {
        [tournamentId: string]: {
            placement: number;
            points: number;
            bonusPoints: number;
        };
    };
    bonusCompletions: {
        challengeId: string;
        completedAt: string;
        points: number;
    }[];
    updatedAt: string;
}
export interface Match {
    _type: 'match';
    id: string;
    tournamentId: string;
    eventId?: string;
    tournamentMatchId?: {
        s: number;
        r: number;
        m: number;
    };
    round: number;
    section?: number;
    teamA?: string;
    teamB?: string;
    teamAName?: string;
    teamBName?: string;
    eventName?: string;
    isComplete: boolean;
    winner?: string;
    finalScore?: {
        a: number;
        b: number;
    };
    scheduledTime?: string;
    startTime?: string;
    endTime?: string;
    mediaIds: string[];
    stationId?: string;
    referee?: string;
    notes?: string;
    hasDispute?: boolean;
    adminOverride?: {
        overriddenBy: string;
        overriddenAt: string;
        reason: string;
        originalValues: {
            winner?: string;
            score?: {
                a: number;
                b: number;
            };
            isComplete: boolean;
        };
    };
    createdAt: string;
    updatedAt?: string;
}
export interface BracketData {
    rounds: BracketRound[];
    format: TournamentFormat;
    isComplete: boolean;
}
export interface BracketRound {
    roundNumber: number;
    name: string;
    matches: BracketMatch[];
}
export interface BracketMatch {
    id: {
        s: number;
        r: number;
        m: number;
    };
    players: string[];
    scores?: number[];
    winner?: string;
    isComplete: boolean;
    scheduledTime?: string;
}
export interface Standings {
    tournamentId: string;
    format: TournamentFormat;
    lastUpdated: string;
    players: StandingEntry[];
    isComplete: boolean;
    currentRound?: number;
    totalRounds?: number;
}
export interface StandingEntry {
    seed: number;
    teamId: string;
    teamName: string;
    position: number;
    wins: number;
    losses: number;
    ties?: number;
    points: number;
    pointsFor: number;
    pointsAgainst: number;
    pointsDifferential: number;
    matchesPlayed: number;
    winPercentage: number;
    isEliminated?: boolean;
    advancesToNext?: boolean;
    buchholz?: number;
    sonnebornBerger?: number;
}
export interface Team {
    id: string;
    name: string;
    players?: string[];
    colorHex?: string;
    flagCode?: string;
}
export interface Standing {
    teamId: string;
    position: number;
    wins: number;
    losses: number;
    draws?: number;
    points: number;
    gamesPlayed: number;
    buchholz?: number;
    sonnebornBerger?: number;
    headToHead?: {
        [opponentId: string]: number;
    };
}
export interface TournamentStats {
    tournamentId: string;
    totalTeams: number;
    totalMatches: number;
    completedMatches: number;
    remainingMatches: number;
    currentRound: number;
    totalRounds: number;
    averageMatchDuration?: number;
    totalPoints: number;
    highestScore: number;
    lowestScore: number;
    mostWins: number;
    winningStreak: number;
    upsetCount: number;
    completionPercentage: number;
    estimatedTimeRemaining?: number;
}
export interface TournamentEvent {
    type: 'match_scored' | 'match_started' | 'round_completed' | 'tournament_completed' | 'bracket_updated';
    tournamentId: string;
    data: any;
    timestamp: string;
}
export interface MatchScoredEvent {
    matchId: string;
    scores: {
        a: number;
        b: number;
    };
    winner: string;
    round: number;
}
export interface RoundCompletedEvent {
    round: number;
    nextRoundMatches?: BracketMatch[];
}
export interface BracketUpdatedEvent {
    bracket: BracketData;
    standings: Standings;
}
export interface CreateTournamentRequest {
    name: string;
    date: string;
    format: TournamentFormat;
    maxTeams: number;
    settings?: Partial<TournamentSettings>;
}
export interface JoinTournamentRequest {
    tournamentSlug: string;
    teamName: string;
    colorHex: string;
    flagCode?: string;
    players: string[];
}
export interface TournamentAction {
    type: 'start_tournament' | 'generate_bracket' | 'advance_round' | 'reset_tournament' | 'close_registration';
    tournamentId: string;
    data?: any;
}
export interface SingleEliminationConfig extends TournamentConfig {
    format: 'single_elimination';
    bronzeMatch?: boolean;
    seeding?: 'random' | 'manual' | 'ranking';
}
export interface DoubleEliminationConfig extends TournamentConfig {
    format: 'double_elimination';
    short?: boolean;
    bronzeMatch?: boolean;
}
export interface RoundRobinConfig extends TournamentConfig {
    format: 'round_robin';
    homeAndAway?: boolean;
}
export interface GroupStageConfig extends TournamentConfig {
    format: 'group_stage';
    groupSize: number;
    advancers: number;
    groupNames?: string[];
}
export interface FFAConfig extends TournamentConfig {
    format: 'free_for_all';
    limit: number;
    advancers: number;
}
export interface MastersConfig extends TournamentConfig {
    format: 'masters';
    limit: number;
    maxRounds: number;
}
export interface SwissConfig extends TournamentConfig {
    format: 'swiss';
    maxRounds?: number;
    tiebreakers?: SwissTiebreaker[];
}
export type SwissTiebreaker = 'buchholz' | 'sonneborn_berger' | 'head_to_head' | 'wins' | 'random';
export type TournamentConfigByFormat<T extends TournamentFormat> = T extends 'single_elimination' ? SingleEliminationConfig : T extends 'double_elimination' ? DoubleEliminationConfig : T extends 'round_robin' ? RoundRobinConfig : T extends 'group_stage' ? GroupStageConfig : T extends 'free_for_all' ? FFAConfig : T extends 'masters' ? MastersConfig : T extends 'swiss' ? SwissConfig : TournamentConfig;
export type TournamentPhase = 'registration' | 'seeding' | 'group_stage' | 'knockout' | 'finals' | 'completed';
export interface TournamentPhaseInfo {
    current: TournamentPhase;
    completed: TournamentPhase[];
    next?: TournamentPhase;
    description: string;
    estimatedDuration?: number;
}
