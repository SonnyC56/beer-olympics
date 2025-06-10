import type { User, Tournament, Team, Match } from '@/types';

// User fixtures
export const createUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg',
  ...overrides
});

export const createOwnerUser = (overrides: Partial<User> = {}): User => ({
  id: 'owner-user-1',
  email: 'owner@example.com',
  name: 'Tournament Owner',
  image: 'https://example.com/owner-avatar.jpg',
  ...overrides
});

// Tournament fixtures
export const createTournament = (overrides: Partial<Tournament> = {}): Tournament => ({
  id: 'test-tournament',
  slug: 'test-tournament',
  name: 'Test Tournament',
  description: 'A test tournament for unit tests',
  ownerId: 'owner-user-1',
  status: 'active',
  maxTeams: 16,
  isOpen: true,
  events: ['beer-pong', 'flip-cup', 'cornhole'],
  settings: {
    maxTeams: 16,
    autoConfirmScores: true,
    confirmationTimeout: 300000
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
});

export const createDraftTournament = (overrides: Partial<Tournament> = {}): Tournament => 
  createTournament({
    status: 'draft',
    isOpen: false,
    ...overrides
  });

export const createCompletedTournament = (overrides: Partial<Tournament> = {}): Tournament => 
  createTournament({
    status: 'completed',
    isOpen: false,
    ...overrides
  });

// Team fixtures
export const createTeam = (overrides: Partial<Team> = {}): Team => ({
  id: 'test-team-1',
  tournamentId: 'test-tournament',
  name: 'Test Team',
  colorHex: '#FF6B6B',
  flagCode: '🏁',
  members: ['test-user-1'],
  captainId: 'test-user-1',
  stats: {
    wins: 0,
    losses: 0,
    totalPoints: 0,
    matchesPlayed: 0
  },
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides
});

export const createTeamWithStats = (overrides: Partial<Team> = {}): Team => 
  createTeam({
    stats: {
      wins: 5,
      losses: 2,
      totalPoints: 47,
      matchesPlayed: 7
    },
    ...overrides
  });

// Match fixtures
export const createMatch = (overrides: Partial<Match> = {}): Match => ({
  id: 'test-match-1',
  tournamentId: 'test-tournament',
  eventId: 'beer-pong',
  team1Id: 'test-team-1',
  team2Id: 'test-team-2',
  round: 1,
  bracket: 'winners',
  status: 'pending',
  scheduledTime: '2024-01-15T14:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
});

export const createCompletedMatch = (overrides: Partial<Match> = {}): Match => 
  createMatch({
    status: 'completed',
    winnerId: 'test-team-1',
    scores: {
      'test-team-1': 21,
      'test-team-2': 18
    },
    completedAt: '2024-01-15T14:30:00Z',
    ...overrides
  });

// Event fixtures
export const createEvent = (overrides: any = {}) => ({
  id: 'beer-pong',
  tournamentId: 'test-tournament',
  name: 'Beer Pong',
  description: 'Classic beer pong tournament',
  type: 'SINGLE_ELIM',
  maxTeams: 16,
  pointMatrix: {
    1: 10, // First place
    2: 7,  // Second place
    3: 5,  // Third place
    4: 3   // Fourth place
  },
  scoring: {
    win: 10,
    loss: 5,
    bonus: 2
  },
  rules: [
    'Standard beer pong rules apply',
    'Best of 3 games per match',
    'No re-racks allowed'
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
});

// Score submission fixtures
export const createScoreSubmission = (overrides: any = {}) => ({
  id: 'score-submission-1',
  matchId: 'test-match-1',
  submittedBy: 'test-user-1',
  submittedFor: 'test-team-1',
  scores: {
    'test-team-1': 21,
    'test-team-2': 18
  },
  winnerId: 'test-team-1',
  status: 'pending',
  submittedAt: '2024-01-15T14:30:00Z',
  expiresAt: '2024-01-15T14:35:00Z',
  ...overrides
});

// Media fixtures
export const createMedia = (overrides: any = {}) => ({
  id: 'media-1',
  matchId: 'test-match-1',
  type: 'video',
  url: 'https://example.com/video.mp4',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  uploadedBy: 'test-user-1',
  duration: 30,
  size: 1024000,
  metadata: {
    width: 1920,
    height: 1080,
    codec: 'h264'
  },
  createdAt: '2024-01-15T14:35:00Z',
  ...overrides
});

// Utility functions for creating multiple fixtures
export const createMultipleTeams = (count: number, tournamentId = 'test-tournament'): Team[] => {
  return Array.from({ length: count }, (_, i) => 
    createTeam({
      id: `test-team-${i + 1}`,
      name: `Team ${i + 1}`,
      tournamentId,
      colorHex: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][i % 5],
      captainId: `test-user-${i + 1}`,
      members: [`test-user-${i + 1}`]
    })
  );
};

export const createMultipleUsers = (count: number): User[] => {
  return Array.from({ length: count }, (_, i) =>
    createUser({
      id: `test-user-${i + 1}`,
      email: `user${i + 1}@example.com`,
      name: `Test User ${i + 1}`
    })
  );
};

export const createTournamentWithTeams = (teamCount = 4) => {
  const tournament = createTournament();
  const teams = createMultipleTeams(teamCount, tournament.id);
  const users = createMultipleUsers(teamCount);
  
  return {
    tournament,
    teams,
    users
  };
};

// Mock API responses
export const mockTournamentListResponse = (tournaments: Tournament[]) => ({
  tournaments,
  total: tournaments.length,
  page: 1,
  limit: 10
});

export const mockLeaderboardResponse = (teams: Team[]) => ({
  leaderboard: teams
    .map(team => ({
      teamId: team.id,
      name: team.name,
      colorHex: team.colorHex,
      ...team.stats
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints),
  lastUpdated: '2024-01-15T14:00:00Z'
});