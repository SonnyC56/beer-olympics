export interface Tournament {
  _type: 'tournament';
  slug: string;
  name: string;
  date: string;
  ownerId: string;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  _type: 'team';
  id: string;
  tournamentId: string;
  name: string;
  colorHex: string;
  flagCode: string;
  memberIds: string[];
  captainId: string;
  createdAt: string;
}

export interface Event {
  _type: 'event';
  id: string;
  tournamentId: string;
  name: string;
  type: 'SINGLE_ELIM' | 'DOUBLE_ELIM' | 'ROUND_ROBIN';
  pointMatrix: {
    1: number;
    2: number;
    3: number;
    [key: string]: number;
  };
  stationIds?: string[];
  createdAt: string;
}

export interface Match {
  _type: 'match';
  id: string;
  eventId: string;
  round: number;
  stationId?: string;
  teamA: string;
  teamB: string;
  winner?: string;
  isComplete: boolean;
  mediaIds: string[];
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface ScoreSubmission {
  _type: 'score_submission';
  id: string;
  matchId: string;
  reporterId: string;
  winnerId: string;
  score: {
    a: number;
    b: number;
  };
  status: 'PENDING' | 'CONFIRMED' | 'DISPUTED';
  createdAt: string;
}

export interface ScoreEntry {
  _type: 'score_entry';
  id: string;
  tournamentId: string;
  eventId: string;
  teamId: string;
  points: number;
  reason: string;
  createdAt: string;
}

export interface Media {
  _type: 'media';
  id: string;
  matchId: string;
  uploaderId: string;
  kind: 'video' | 'photo';
  providerId: string;
  testimonial?: string;
  url?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: 'owner' | 'captain' | 'player';
}

export interface Station {
  id: string;
  name: string;
  color: string;
}