/**
 * Tournament Types and Interfaces
 * Enhanced with tournament-js integration
 */

import type { TournamentFormat, TournamentConfig, TournamentMatch, TournamentPlayer, TournamentResults } from '../services/tournament-engine';

// Export tournament engine types
export type { TournamentFormat, TournamentConfig, TournamentMatch, TournamentPlayer, TournamentResults };

// Enhanced tournament interface
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
  
  // Tournament hierarchy
  parentTournamentId?: string; // If this is a sub-tournament
  subTournamentIds?: string[]; // If this is a mega-tournament
  isMegaTournament?: boolean; // True if this contains multiple tournaments
  
  // Tournament-js integration
  config?: TournamentConfig;
  currentRound?: number;
  totalRounds?: number;
  isComplete?: boolean;
  
  // Additional settings
  settings?: TournamentSettings;
  
  // Tournament status
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
  matchDuration?: number; // in minutes
  breakBetweenMatches?: number; // in minutes
  venue?: string;
  prizes?: Prize[];
  rules?: string[];
  
  // Mega-tournament settings
  megaTournamentScoring?: MegaTournamentScoring;
  bonusChallenges?: BonusChallenge[];
}

export interface Prize {
  position: number;
  title: string;
  description?: string;
  value?: string;
}

// Mega-tournament scoring system
export interface MegaTournamentScoring {
  method: 'placement' | 'points' | 'hybrid';
  placementPoints?: { [position: number]: number }; // e.g., { 1: 100, 2: 75, 3: 50, 4: 25 }
  participationPoints?: number; // Points for just participating
  bonusPointsEnabled?: boolean;
}

// Bonus challenges that span across tournaments
export interface BonusChallenge {
  id: string;
  name: string;
  description: string;
  points: number;
  type: 'team' | 'individual';
  maxCompletions?: number; // How many times it can be completed
  availableIn?: string[]; // Which sub-tournament IDs it's available in
  requirements?: string[]; // What needs to be done to complete it
}

// Mega-tournament leaderboard entry
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

// Enhanced match interface
export interface Match {
  _type: 'match';
  id: string;
  tournamentId: string;
  eventId?: string;
  
  // Tournament-js integration
  tournamentMatchId?: { s: number; r: number; m: number };
  round: number;
  section?: number; // For multi-section tournaments
  
  // Teams/players
  teamA?: string;
  teamB?: string;
  teamAName?: string;
  teamBName?: string;
  
  // Event information
  eventName?: string;
  
  // Match state
  isComplete: boolean;
  winner?: string;
  
  // Scoring
  finalScore?: {
    a: number;
    b: number;
  };
  
  // Timing
  scheduledTime?: string;
  startTime?: string;
  endTime?: string;
  
  // Media and metadata
  mediaIds: string[];
  stationId?: string;
  referee?: string;
  notes?: string;
  
  // Disputes
  hasDispute?: boolean;
  
  // Admin override
  adminOverride?: {
    overriddenBy: string;
    overriddenAt: string;
    reason: string;
    originalValues: {
      winner?: string;
      score?: { a: number; b: number };
      isComplete: boolean;
    };
  };
  
  createdAt: string;
  updatedAt?: string;
}

// Bracket visualization data
export interface BracketData {
  rounds: BracketRound[];
  format: TournamentFormat;
  isComplete: boolean;
}

export interface BracketRound {
  roundNumber: number;
  name: string; // "Round 1", "Quarterfinals", "Semifinals", "Finals"
  matches: BracketMatch[];
}

export interface BracketMatch {
  id: { s: number; r: number; m: number };
  players: string[];
  scores?: number[];
  winner?: string;
  isComplete: boolean;
  scheduledTime?: string;
}

// Leaderboard and standings
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
}

// Tournament statistics
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
  upsetCount: number; // Lower seed beating higher seed
  completionPercentage: number;
  estimatedTimeRemaining?: number; // in minutes
}

// Event types for real-time updates
export interface TournamentEvent {
  type: 'match_scored' | 'match_started' | 'round_completed' | 'tournament_completed' | 'bracket_updated';
  tournamentId: string;
  data: any;
  timestamp: string;
}

export interface MatchScoredEvent {
  matchId: string;
  scores: { a: number; b: number };
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

// Tournament creation helpers
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

// Tournament management actions
export interface TournamentAction {
  type: 'start_tournament' | 'generate_bracket' | 'advance_round' | 'reset_tournament' | 'close_registration';
  tournamentId: string;
  data?: any;
}

// Format-specific configurations
export interface SingleEliminationConfig extends TournamentConfig {
  format: 'single_elimination';
  bronzeMatch?: boolean;
  seeding?: 'random' | 'manual' | 'ranking';
}

export interface DoubleEliminationConfig extends TournamentConfig {
  format: 'double_elimination';
  short?: boolean; // Skip some matches in losers bracket
  bronzeMatch?: boolean;
}

export interface RoundRobinConfig extends TournamentConfig {
  format: 'round_robin';
  homeAndAway?: boolean; // Play each matchup twice
}

export interface GroupStageConfig extends TournamentConfig {
  format: 'group_stage';
  groupSize: number;
  advancers: number; // Number of teams that advance from each group
  groupNames?: string[]; // Optional group names
}

export interface FFAConfig extends TournamentConfig {
  format: 'free_for_all';
  limit: number; // Players per match
  advancers: number; // Players that advance from each match
}

export interface MastersConfig extends TournamentConfig {
  format: 'masters';
  limit: number; // Players per match
  maxRounds: number; // Maximum number of rounds
}

// Utility types
export type TournamentConfigByFormat<T extends TournamentFormat> = 
  T extends 'single_elimination' ? SingleEliminationConfig :
  T extends 'double_elimination' ? DoubleEliminationConfig :
  T extends 'round_robin' ? RoundRobinConfig :
  T extends 'group_stage' ? GroupStageConfig :
  T extends 'free_for_all' ? FFAConfig :
  T extends 'masters' ? MastersConfig :
  TournamentConfig;

// Tournament phase tracking
export type TournamentPhase = 
  | 'registration'
  | 'seeding'
  | 'group_stage'
  | 'knockout'
  | 'finals'
  | 'completed';

export interface TournamentPhaseInfo {
  current: TournamentPhase;
  completed: TournamentPhase[];
  next?: TournamentPhase;
  description: string;
  estimatedDuration?: number; // in minutes
}