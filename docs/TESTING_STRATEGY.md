# Testing Strategy Documentation

## Overview

The Beer Olympics platform uses a comprehensive testing strategy covering unit tests, integration tests, and end-to-end tests. We use Vitest for fast unit testing, React Testing Library for component tests, and Playwright for E2E testing.

## Testing Stack

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Unit Tests    │    │ Integration     │    │   E2E Tests     │
│   (Vitest)      │    │ Tests (Vitest)  │    │  (Playwright)   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Functions     │    │ • API Routes    │    │ • User Flows    │
│ • Components    │    │ • Database      │    │ • Auth Flow     │
│ • Utils         │    │ • tRPC Calls    │    │ • Tournament    │
│ • Types         │    │ • Services      │    │ • Scoring       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Project Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/         # Component tests
│   ├── services/          # Service layer tests
│   ├── utils/             # Utility function tests
│   └── api/               # API router tests
├── integration/            # Integration tests
│   ├── auth/              # Authentication flow tests
│   ├── tournaments/       # Tournament CRUD tests
│   ├── teams/             # Team management tests
│   └── scoring/           # Scoring system tests
├── e2e/                   # End-to-end tests
│   ├── auth.spec.ts       # Authentication E2E
│   ├── tournament.spec.ts # Tournament workflows
│   └── scoring.spec.ts    # Scoring workflows
├── fixtures/              # Test data and fixtures
├── mocks/                 # Mock implementations
└── setup/                 # Test configuration
```

## Configuration Files

### Vitest Config (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['tests/e2e/**/*'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        'coverage/',
        'api/',
        '*.config.{js,ts}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

### Playwright Config (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Setup Files

### Vitest Setup (`tests/setup/vitest.setup.ts`)

```typescript
import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.AUTH_SECRET = 'test-secret-key';
process.env.COUCHBASE_CONNECTION_STRING = 'mock://localhost';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global test setup
beforeAll(async () => {
  // Initialize test database
  await initTestDatabase();
});

afterAll(async () => {
  // Cleanup test database
  await cleanupTestDatabase();
});

// Mock functions
global.fetch = vi.fn();
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### Database Test Setup (`tests/setup/database.ts`)

```typescript
import { vi } from 'vitest';

// Mock Couchbase for tests
export const mockCouchbase = {
  documents: new Map<string, any>(),
  
  async get(key: string) {
    const doc = this.documents.get(key);
    if (!doc) throw new Error('DocumentNotFoundError');
    return { content: doc };
  },
  
  async upsert(key: string, value: any) {
    this.documents.set(key, value);
    return { cas: '123' };
  },
  
  async remove(key: string) {
    const existed = this.documents.delete(key);
    if (!existed) throw new Error('DocumentNotFoundError');
    return { cas: '123' };
  },
  
  async query(statement: string, options: any = {}) {
    // Simple mock query implementation
    const rows: any[] = [];
    
    if (statement.includes('tournament')) {
      for (const [key, doc] of this.documents) {
        if (key.startsWith('tournament::')) {
          rows.push(doc);
        }
      }
    }
    
    return { rows };
  },
  
  clear() {
    this.documents.clear();
  }
};

// Mock the couchbase service
vi.mock('@/services/couchbase', () => ({
  getCouchbaseConnection: vi.fn(() => ({
    cluster: mockCouchbase,
    bucket: { defaultScope: () => ({ collection: () => mockCouchbase }) }
  })),
  getDocument: vi.fn((key: string) => mockCouchbase.get(key).then(r => r.content)),
  upsertDocument: vi.fn((key: string, value: any) => mockCouchbase.upsert(key, value)),
  removeDocument: vi.fn((key: string) => mockCouchbase.remove(key)),
  query: vi.fn((statement: string, options?: any) => mockCouchbase.query(statement, options))
}));

export async function initTestDatabase() {
  mockCouchbase.clear();
  
  // Add test fixtures
  await mockCouchbase.upsert('tournament::test-tournament', {
    id: 'test-tournament',
    slug: 'test-tournament',
    name: 'Test Tournament',
    ownerId: 'test-user-1',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  });
  
  await mockCouchbase.upsert('user::test-user-1', {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg'
  });
}

export async function cleanupTestDatabase() {
  mockCouchbase.clear();
}
```

## Unit Tests

### Component Tests (`tests/unit/components/TournamentCard.test.tsx`)

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TournamentCard } from '@/components/TournamentCard';

const mockTournament = {
  id: 'test-tournament',
  slug: 'test-tournament',
  name: 'Test Tournament',
  description: 'A test tournament',
  status: 'active' as const,
  ownerId: 'test-user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('TournamentCard', () => {
  it('renders tournament information correctly', () => {
    render(<TournamentCard tournament={mockTournament} />);
    
    expect(screen.getByText('Test Tournament')).toBeInTheDocument();
    expect(screen.getByText('A test tournament')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
  
  it('displays correct status badge color', () => {
    const { rerender } = render(<TournamentCard tournament={mockTournament} />);
    
    expect(screen.getByText('Active')).toHaveClass('bg-green-100');
    
    rerender(<TournamentCard tournament={{...mockTournament, status: 'draft'}} />);
    expect(screen.getByText('Draft')).toHaveClass('bg-gray-100');
  });
  
  it('shows join button for open tournaments', () => {
    render(<TournamentCard tournament={{...mockTournament, isOpen: true}} />);
    
    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
  });
});
```

### Service Tests (`tests/unit/services/auth.test.ts`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateJWT, verifyJWT } from '@/services/auth';

describe('Auth Service', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret-key';
  });
  
  describe('JWT handling', () => {
    it('generates valid JWT token', () => {
      const user = {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg'
      };
      
      const token = generateJWT(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
    
    it('verifies valid JWT token', () => {
      const user = {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg'
      };
      
      const token = generateJWT(user);
      const decoded = verifyJWT(token);
      
      expect(decoded).toEqual(user);
    });
    
    it('rejects invalid JWT token', () => {
      const invalidToken = 'invalid.jwt.token';
      const decoded = verifyJWT(invalidToken);
      
      expect(decoded).toBeNull();
    });
    
    it('rejects expired JWT token', () => {
      // Mock date to create expired token
      const originalNow = Date.now;
      Date.now = vi.fn(() => 1000000000000); // Past date
      
      const user = {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg'
      };
      
      const token = generateJWT(user);
      
      // Restore current time
      Date.now = originalNow;
      
      const decoded = verifyJWT(token);
      expect(decoded).toBeNull();
    });
  });
});
```

### tRPC Router Tests (`tests/unit/api/tournament.test.ts`)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '@/api/routers';
import { mockCouchbase, initTestDatabase, cleanupTestDatabase } from '../setup/database';

const createCaller = createCallerFactory(appRouter);

describe('Tournament Router', () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
    await initTestDatabase();
  });
  
  describe('tournament.get', () => {
    it('returns tournament by slug', async () => {
      const caller = createCaller({
        req: {} as any,
        res: {} as any,
        user: null
      });
      
      const tournament = await caller.tournament.get({ slug: 'test-tournament' });
      
      expect(tournament).toBeDefined();
      expect(tournament.slug).toBe('test-tournament');
      expect(tournament.name).toBe('Test Tournament');
    });
    
    it('throws NOT_FOUND for invalid slug', async () => {
      const caller = createCaller({
        req: {} as any,
        res: {} as any,
        user: null
      });
      
      await expect(
        caller.tournament.get({ slug: 'nonexistent' })
      ).rejects.toThrow('NOT_FOUND');
    });
  });
  
  describe('tournament.create', () => {
    it('creates tournament for authenticated user', async () => {
      const caller = createCaller({
        req: {} as any,
        res: {} as any,
        user: {
          id: 'test-user-1',
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg'
        }
      });
      
      const tournament = await caller.tournament.create({
        name: 'New Tournament',
        slug: 'new-tournament',
        description: 'A new tournament'
      });
      
      expect(tournament).toBeDefined();
      expect(tournament.name).toBe('New Tournament');
      expect(tournament.slug).toBe('new-tournament');
      expect(tournament.ownerId).toBe('test-user-1');
    });
    
    it('throws UNAUTHORIZED for unauthenticated user', async () => {
      const caller = createCaller({
        req: {} as any,
        res: {} as any,
        user: null
      });
      
      await expect(
        caller.tournament.create({
          name: 'New Tournament',
          slug: 'new-tournament'
        })
      ).rejects.toThrow('UNAUTHORIZED');
    });
  });
});
```

## Integration Tests

### Auth Integration (`tests/integration/auth/flow.test.ts`)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/server'; // Your Express/API server

describe('Authentication Flow', () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });
  
  it('completes OAuth callback flow', async () => {
    // Mock Google OAuth response
    const mockCode = 'mock-auth-code';
    
    const response = await request(app)
      .get('/api/auth/callback')
      .query({ code: mockCode })
      .expect(302); // Redirect
    
    // Check that user was created
    const user = await mockCouchbase.get('user::google-123456');
    expect(user.content.email).toBe('test@example.com');
    
    // Check that login event was recorded
    const loginEvents = Array.from(mockCouchbase.documents.entries())
      .filter(([key]) => key.startsWith('login::'));
    expect(loginEvents).toHaveLength(1);
  });
  
  it('verifies user session', async () => {
    // Create test user and session
    const user = {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg'
    };
    
    const token = generateJWT(user);
    
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `auth-token=${token}`)
      .expect(200);
    
    expect(response.body.user).toEqual(user);
  });
});
```

### Tournament CRUD Integration (`tests/integration/tournaments/crud.test.ts`)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createTRPCMsw } from 'msw-trpc';
import { setupServer } from 'msw/node';
import { trpc } from '@/utils/trpc';
import type { AppRouter } from '@/api/routers';

const trpcMsw = createTRPCMsw<AppRouter>();

const server = setupServer();

describe('Tournament CRUD Integration', () => {
  beforeEach(() => {
    server.listen();
  });
  
  afterEach(() => {
    server.resetHandlers();
  });
  
  afterAll(() => {
    server.close();
  });
  
  it('creates, reads, updates, and deletes tournament', async () => {
    // Setup authenticated user context
    const mockUser = {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg'
    };
    
    // Test CREATE
    const created = await trpc.tournament.create.mutate({
      name: 'Integration Test Tournament',
      slug: 'integration-test',
      description: 'A tournament for integration testing'
    });
    
    expect(created.name).toBe('Integration Test Tournament');
    expect(created.ownerId).toBe(mockUser.id);
    
    // Test READ
    const retrieved = await trpc.tournament.get.query({
      slug: 'integration-test'
    });
    
    expect(retrieved).toEqual(created);
    
    // Test UPDATE
    const updated = await trpc.tournament.update.mutate({
      slug: 'integration-test',
      updates: {
        name: 'Updated Tournament Name',
        status: 'active'
      }
    });
    
    expect(updated.name).toBe('Updated Tournament Name');
    expect(updated.status).toBe('active');
    
    // Test LIST
    const tournaments = await trpc.tournament.list.query();
    expect(tournaments).toContainEqual(
      expect.objectContaining({ slug: 'integration-test' })
    );
  });
});
```

## End-to-End Tests

### Authentication E2E (`tests/e2e/auth.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign in with Google', async ({ page }) => {
    await page.goto('/');
    
    // Click sign in button
    await page.click('button:has-text("Sign In")');
    
    // Should redirect to Google OAuth (or mock in test)
    await expect(page).toHaveURL(/google\.com\/oauth|localhost:5173\/auth\/callback/);
    
    // In test environment, we might mock the OAuth flow
    if (page.url().includes('localhost')) {
      // Mock successful OAuth callback
      await page.goto('/auth/callback?code=mock-code&state=/dashboard');
    }
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should see user name in header
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User');
  });
  
  test('user can sign out', async ({ page }) => {
    // First sign in (using mock or setup)
    await page.goto('/dashboard');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg'
      }));
    });
    await page.reload();
    
    // Click user menu and sign out
    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Sign Out")');
    
    // Should be redirected to home page
    await expect(page).toHaveURL('/');
    
    // Should see sign in button again
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });
});
```

### Tournament E2E (`tests/e2e/tournament.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tournament Management', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authenticated user
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg'
      }));
    });
  });
  
  test('user can create a tournament', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click create tournament button
    await page.click('button:has-text("Create Tournament")');
    
    // Fill out tournament form
    await page.fill('[data-testid="tournament-name"]', 'E2E Test Tournament');
    await page.fill('[data-testid="tournament-slug"]', 'e2e-test-tournament');
    await page.fill('[data-testid="tournament-description"]', 'A tournament created by E2E tests');
    
    // Submit form
    await page.click('button:has-text("Create")');
    
    // Should redirect to tournament page
    await expect(page).toHaveURL('/tournaments/e2e-test-tournament');
    
    // Should display tournament details
    await expect(page.locator('h1')).toContainText('E2E Test Tournament');
    await expect(page.locator('[data-testid="tournament-description"]'))
      .toContainText('A tournament created by E2E tests');
  });
  
  test('user can join a tournament', async ({ page }) => {
    // Navigate to a public tournament
    await page.goto('/tournaments/public-tournament');
    
    // Click join tournament button
    await page.click('button:has-text("Join Tournament")');
    
    // Fill out team creation form
    await page.fill('[data-testid="team-name"]', 'E2E Test Team');
    await page.selectOption('[data-testid="team-color"]', '#FF6B6B');
    
    // Submit team creation
    await page.click('button:has-text("Create Team")');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Successfully joined tournament');
    
    // Should display team in tournament
    await expect(page.locator('[data-testid="team-list"]'))
      .toContainText('E2E Test Team');
  });
});
```

## Test Data & Fixtures

### Fixture Factory (`tests/fixtures/index.ts`)

```typescript
export const createUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg',
  ...overrides
});

export const createTournament = (overrides: Partial<Tournament> = {}): Tournament => ({
  id: 'test-tournament',
  slug: 'test-tournament',
  name: 'Test Tournament',
  description: 'A test tournament',
  ownerId: 'test-user-1',
  status: 'active',
  maxTeams: 16,
  isOpen: true,
  events: ['beer-pong', 'flip-cup'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
});

export const createTeam = (overrides: Partial<Team> = {}): Team => ({
  id: 'test-team-1',
  tournamentId: 'test-tournament',
  name: 'Test Team',
  colorHex: '#FF6B6B',
  flagCode: '🏁',
  members: ['test-user-1'],
  captainId: 'test-user-1',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides
});
```

## Test Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:ui": "playwright test --ui",
    "test:integration": "vitest run tests/integration",
    "test:unit": "vitest run tests/unit",
    "test:watch": "vitest watch",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

## CI/CD Integration

### GitHub Actions (`.github/workflows/test.yml`)

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

This comprehensive testing strategy ensures code quality, prevents regressions, and provides confidence when deploying to production.