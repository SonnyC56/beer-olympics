// Pusher event types for type safety
export interface PusherEvents {
  'score-update': {
    tournamentId: string;
    matchId: string;
    teamId: string;
    points: number;
  };
  'match-complete': {
    tournamentId: string;
    matchId: string;
    winner: string;
  };
  'team-joined': {
    tournamentId: string;
    team: {
      id: string;
      name: string;
      colorHex: string;
      flagCode: string;
    };
  };
  'tournament-status': {
    tournamentId: string;
    isOpen: boolean;
  };
}