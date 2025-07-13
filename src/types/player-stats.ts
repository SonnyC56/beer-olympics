export interface PlayerStats {
  playerId: string;
  tournamentId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalPointsScored: number;
  totalPointsConceded: number;
  winRate: number;
  avgPointsPerGame: number;
  achievements: string[];
  xp: number;
  level: number;
  totalWins?: number;
  totalGamesPlayed?: number;
  tournamentHistory?: Array<{ id: string; name: string; placement: number }>;
}