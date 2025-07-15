import { vi } from 'vitest';
import type { User } from '@/types';

// Must be hoisted to work properly
vi.hoisted(() => {
  // Mock Couchbase operations
  vi.mock('@/services/couchbase', () => ({
  getCouchbaseConnection: vi.fn().mockResolvedValue({
    cluster: {},
    bucket: {},
  }),
  getCollection: vi.fn().mockResolvedValue({
    get: vi.fn(),
    insert: vi.fn(),
    upsert: vi.fn(),
    remove: vi.fn(),
    exists: vi.fn(),
  }),
  query: vi.fn().mockResolvedValue({
    rows: [],
    meta: {},
  }),
  getDocument: vi.fn(),
  upsertDocument: vi.fn(),
  deleteDocument: vi.fn(),
  closeConnection: vi.fn(),
}));

// Mock Pusher
vi.mock('@/api/services/pusher-server', () => ({
  pusherServer: {
    trigger: vi.fn(),
    triggerBatch: vi.fn(),
  },
  safeBroadcast: vi.fn(),
}));

// Mock auth functions
vi.mock('@/services/auth', () => ({
  generateJWT: vi.fn((user: User) => 'mock-jwt-token'),
  verifyJWT: vi.fn((token: string) => ({
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
  })),
  verifyGoogleToken: vi.fn(),
  generateAuthUrl: vi.fn().mockResolvedValue('https://accounts.google.com/mock'),
}));
});

// Mock environment variables
process.env.COUCHBASE_BUCKET = 'test_bucket';
process.env.AUTH_SECRET = 'test-secret';
process.env.AUTH_URL = 'http://localhost:5173';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

// Test data factory
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg',
  ...overrides,
});

export const createMockTournament = (overrides?: any) => ({
  _type: 'tournament',
  slug: 'test-tournament-' + Date.now(),
  name: 'Test Tournament',
  date: '2024-07-15',
  ownerId: 'test-user-123',
  isOpen: true,
  format: 'single_elimination',
  maxTeams: 16,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockTeam = (overrides?: any) => ({
  _type: 'team',
  id: 'team-' + Date.now(),
  name: 'Test Team',
  tournamentId: 'test-tournament',
  playerIds: ['player-1', 'player-2'],
  teamCode: 'ABC123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockMatch = (overrides?: any) => ({
  _type: 'match',
  id: 'match-' + Date.now(),
  tournamentId: 'test-tournament',
  teamAId: 'team-1',
  teamBId: 'team-2',
  status: 'scheduled',
  scheduledTime: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});