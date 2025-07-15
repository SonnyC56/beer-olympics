// Export enhanced tournament types
export * from './tournament';

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
  previousRank?: number;
  // Enhanced fields
  inviteCode?: string;
  qrCodeUrl?: string;
  motto?: string;
  logoUrl?: string;
  stats?: TeamStats;
  preferences?: TeamPreferences;
  updatedAt?: string;
  // Admin fields
  isRemoved?: boolean;
  removedAt?: string;
  removedReason?: string;
  warnings?: TeamWarning[];
}

export interface TeamWarning {
  reason: string;
  issuedBy: string;
  issuedAt: string;
}

export interface TeamStats {
  wins: number;
  losses: number;
  totalPoints: number;
  currentStreak: number;
  bestPlacement: number;
  averagePosition: number;
  totalGamesPlayed: number;
  favoriteGame?: string;
  nemesisTeam?: string;
}

export interface TeamPreferences {
  preferredGames?: string[];
  availableTimeSlots?: TimeSlot[];
  playerRotationStrategy?: 'fixed' | 'rotating' | 'matchup';
  notificationPreferences?: NotificationPreference[];
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
  scoring?: {
    win: number;
    loss: number;
    draw?: number;
  };
  stationIds?: string[];
  createdAt: string;
}

// Match interface is now exported from ./tournament

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
  confirmedAt?: string;
  disputedBy?: string;
  disputedAt?: string;
  createdAt: string;
}

export interface Dispute {
  _type: 'dispute';
  id: string;
  submissionId: string;
  matchId: string;
  tournamentId: string;
  disputedBy: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
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
  // Enhanced fields
  uploaderName?: string;
  tags?: string[];
  duration?: number; // For videos
  fileSize?: number;
  format?: string;
  width?: number;
  height?: number;
  aiTags?: string[];
  confidence?: number; // AI detection confidence
  isHighlight?: boolean;
  highlightType?: 'fastestChug' | 'biggestUpset' | 'funnyMoments';
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: 'owner' | 'captain' | 'player';
}

export interface PlayerProfile {
  _type: 'player_profile';
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  nationality?: string;
  favoriteGame?: string;
  motto?: string;
  stats: PlayerStats;
  achievements: Achievement[];
  preferences: PlayerPreferences;
  socialLinks?: SocialLinks;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerStats {
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  totalPoints: number;
  averagePointsPerGame: number;
  currentStreak: number;
  longestStreak: number;
  gameStats: { [gameType: string]: GameSpecificStats };
  tournamentHistory: TournamentHistoryEntry[];
}

export interface GameSpecificStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  averageScore: number;
  bestScore: number;
  lastPlayed: string;
}

export interface TournamentHistoryEntry {
  tournamentId: string;
  tournamentName: string;
  teamId: string;
  teamName: string;
  placement: number;
  totalTeams: number;
  date: string;
  mvpAwards: number;
  totalPoints: number;
}

export interface Achievement {
  id: string;
  type: 'milestone' | 'special' | 'tournament' | 'social';
  name: string;
  description: string;
  iconUrl?: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PlayerPreferences {
  visibility: 'public' | 'team' | 'private';
  allowTeamInvites: boolean;
  showStats: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
}

export interface TimeSlot {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface NotificationPreference {
  type: 'match_start' | 'score_update' | 'team_invite' | 'tournament_update';
  enabled: boolean;
  method: 'email' | 'push' | 'sms';
}

export interface Station {
  id: string;
  name: string;
  color: string;
}