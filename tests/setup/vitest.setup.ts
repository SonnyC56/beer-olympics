import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.AUTH_SECRET = 'test-secret-key-for-jwt-signing';
process.env.AUTH_URL = 'http://localhost:3000';
process.env.COUCHBASE_CONNECTION_STRING = 'mock://localhost';
process.env.COUCHBASE_USERNAME = 'test';
process.env.COUCHBASE_PASSWORD = 'test';
process.env.COUCHBASE_BUCKET = 'test_bucket';

// Global mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear();
});

// Global test database setup
let testDatabase: Map<string, any>;

beforeAll(async () => {
  // Initialize mock test database
  testDatabase = new Map();
  
  // Add default test fixtures
  testDatabase.set('user::test-user-1', {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
    lastLogin: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  });
  
  testDatabase.set('tournament::test-tournament', {
    id: 'test-tournament',
    slug: 'test-tournament',
    name: 'Test Tournament',
    description: 'A test tournament for unit tests',
    ownerId: 'test-user-1',
    status: 'active',
    maxTeams: 16,
    isOpen: true,
    events: ['beer-pong', 'flip-cup'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  });
  
  console.log('Test setup complete');
});

afterAll(async () => {
  // Cleanup test database
  testDatabase?.clear();
  console.log('Test cleanup complete');
});

// Export test database for use in tests
export { testDatabase };