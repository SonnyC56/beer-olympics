import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tournamentRouter } from '../../../src/api/routers/tournament';
import { TRPCError } from '@trpc/server';

// Mock the couchbase service
vi.mock('../../../src/services/couchbase', () => ({
  couchbaseService: {
    ensureConnection: vi.fn(),
    getTournament: vi.fn(),
    createTournament: vi.fn(),
    updateTournament: vi.fn(),
    searchTournaments: vi.fn(),
  },
  executeQuery: vi.fn(),
}));

// Mock the auth service
vi.mock('../../../src/services/auth', () => ({
  getUserId: vi.fn(() => 'test-user-123'),
  checkTournamentOwnership: vi.fn(),
}));

// Import mocked modules
import { couchbaseService, executeQuery } from '../../../src/services/couchbase';
import { getUserId, checkTournamentOwnership } from '../../../src/services/auth';

describe('Tournament API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create tournament', () => {
    it('should create a tournament successfully', async () => {
      // Mock successful tournament creation
      const mockTournament = {
        id: 'tournament-123',
        name: 'Test Tournament',
        slug: 'test-tournament',
        createdBy: 'test-user-123',
        teams: [],
        matches: [],
        status: 'pending',
        date: '2024-07-15',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(couchbaseService.ensureConnection).mockResolvedValue(undefined);
      vi.mocked(couchbaseService.createTournament).mockResolvedValue(mockTournament);

      // Create a mock context
      const mockCtx = {
        session: { userId: 'test-user-123' },
      };

      // Get the create procedure
      const createProcedure = tournamentRouter._def.procedures.create;
      
      // Mock input
      const input = {
        name: 'Test Tournament',
        date: '2024-07-15',
      };

      // Call the resolver function
      const result = await createProcedure.resolver({
        ctx: mockCtx,
        input,
        type: 'mutation',
      });

      // Verify the result
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Tournament');
      expect(result.slug).toBe('test-tournament');
      expect(result.createdBy).toBe('test-user-123');
      expect(result.status).toBe('pending');

      // Verify couchbase methods were called
      expect(couchbaseService.ensureConnection).toHaveBeenCalled();
      expect(couchbaseService.createTournament).toHaveBeenCalled();
    });

    it('should throw error when not authenticated', async () => {
      // Mock no session
      const mockCtx = {
        session: null,
      };

      const createProcedure = tournamentRouter._def.procedures.create;
      
      const input = {
        name: 'Test Tournament',
        date: '2024-07-15',
      };

      // Should throw authentication error
      await expect(
        createProcedure.resolver({
          ctx: mockCtx,
          input,
          type: 'mutation',
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should validate tournament name', async () => {
      const mockCtx = {
        session: { userId: 'test-user-123' },
      };

      const createProcedure = tournamentRouter._def.procedures.create;
      
      // Empty name should fail validation
      const input = {
        name: '',
        date: '2024-07-15',
      };

      await expect(
        createProcedure.resolver({
          ctx: mockCtx,
          input,
          type: 'mutation',
        })
      ).rejects.toThrow();
    });

    it('should generate unique slug', async () => {
      const mockTournament = {
        id: 'tournament-123',
        name: 'Test Tournament!!!',
        slug: 'test-tournament',
        createdBy: 'test-user-123',
        teams: [],
        matches: [],
        status: 'pending',
        date: '2024-07-15',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(couchbaseService.ensureConnection).mockResolvedValue(undefined);
      vi.mocked(couchbaseService.createTournament).mockResolvedValue(mockTournament);

      const mockCtx = {
        session: { userId: 'test-user-123' },
      };

      const createProcedure = tournamentRouter._def.procedures.create;
      
      const input = {
        name: 'Test Tournament!!!',
        date: '2024-07-15',
      };

      const result = await createProcedure.resolver({
        ctx: mockCtx,
        input,
        type: 'mutation',
      });

      // Slug should be URL-friendly
      expect(result.slug).toMatch(/^[a-z0-9-]+$/);
      expect(result.slug).not.toContain('!');
    });
  });

  describe('list tournaments', () => {
    it('should list tournaments successfully', async () => {
      const mockTournaments = [
        {
          id: 'tournament-1',
          name: 'Tournament 1',
          slug: 'tournament-1',
          status: 'active',
          date: '2024-07-15',
        },
        {
          id: 'tournament-2', 
          name: 'Tournament 2',
          slug: 'tournament-2',
          status: 'completed',
          date: '2024-07-10',
        },
      ];

      vi.mocked(couchbaseService.ensureConnection).mockResolvedValue(undefined);
      vi.mocked(executeQuery).mockResolvedValue({ rows: mockTournaments });

      const listProcedure = tournamentRouter._def.procedures.list;
      
      const result = await listProcedure.resolver({
        ctx: {},
        input: undefined,
        type: 'query',
      });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Tournament 1');
      expect(result[1].name).toBe('Tournament 2');
    });
  });

  describe('get tournament by slug', () => {
    it('should get tournament successfully', async () => {
      const mockTournament = {
        id: 'tournament-123',
        name: 'Test Tournament',
        slug: 'test-tournament',
        teams: [],
        matches: [],
        status: 'active',
      };

      vi.mocked(couchbaseService.ensureConnection).mockResolvedValue(undefined);
      vi.mocked(couchbaseService.getTournament).mockResolvedValue(mockTournament);

      const getBySlugProcedure = tournamentRouter._def.procedures.getBySlug;
      
      const result = await getBySlugProcedure.resolver({
        ctx: {},
        input: { slug: 'test-tournament' },
        type: 'query',
      });

      expect(result.slug).toBe('test-tournament');
      expect(result.name).toBe('Test Tournament');
    });

    it('should throw 404 when tournament not found', async () => {
      vi.mocked(couchbaseService.ensureConnection).mockResolvedValue(undefined);
      vi.mocked(couchbaseService.getTournament).mockResolvedValue(null);

      const getBySlugProcedure = tournamentRouter._def.procedures.getBySlug;
      
      await expect(
        getBySlugProcedure.resolver({
          ctx: {},
          input: { slug: 'non-existent' },
          type: 'query',
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});