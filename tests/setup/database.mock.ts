import { vi } from 'vitest';

// Mock Couchbase implementation for testing
export class MockCouchbase {
  private documents = new Map<string, any>();
  
  async get(key: string) {
    const doc = this.documents.get(key);
    if (!doc) {
      const error = new Error('DocumentNotFoundError');
      error.name = 'DocumentNotFoundError';
      throw error;
    }
    return { content: doc };
  }
  
  async upsert(key: string, value: any) {
    this.documents.set(key, value);
    return { 
      cas: '123456789',
      token: 'mock-token' 
    };
  }
  
  async insert(key: string, value: any) {
    if (this.documents.has(key)) {
      const error = new Error('DocumentExistsError');
      error.name = 'DocumentExistsError';
      throw error;
    }
    return this.upsert(key, value);
  }
  
  async replace(key: string, value: any) {
    if (!this.documents.has(key)) {
      const error = new Error('DocumentNotFoundError');
      error.name = 'DocumentNotFoundError';
      throw error;
    }
    return this.upsert(key, value);
  }
  
  async remove(key: string) {
    const existed = this.documents.delete(key);
    if (!existed) {
      const error = new Error('DocumentNotFoundError');
      error.name = 'DocumentNotFoundError';
      throw error;
    }
    return { 
      cas: '123456789' 
    };
  }
  
  async query(statement: string, options: any = {}) {
    const rows: any[] = [];
    
    // Simple mock query implementation
    if (statement.includes('tournament')) {
      for (const [key, doc] of this.documents) {
        if (key.startsWith('tournament::')) {
          rows.push(doc);
        }
      }
    } else if (statement.includes('team')) {
      for (const [key, doc] of this.documents) {
        if (key.startsWith('team::')) {
          rows.push(doc);
        }
      }
    } else if (statement.includes('user')) {
      for (const [key, doc] of this.documents) {
        if (key.startsWith('user::')) {
          rows.push(doc);
        }
      }
    }
    
    // Apply WHERE conditions (very basic)
    if (options.tournamentId) {
      return {
        rows: rows.filter(row => row.tournamentId === options.tournamentId),
        metaData: { metrics: { resultCount: rows.length } }
      };
    }
    
    return {
      rows,
      metaData: { metrics: { resultCount: rows.length } }
    };
  }
  
  async exists(key: string) {
    return { exists: this.documents.has(key) };
  }
  
  clear() {
    this.documents.clear();
  }
  
  size() {
    return this.documents.size;
  }
  
  // Helper method to seed test data
  seedData(data: Record<string, any>) {
    for (const [key, value] of Object.entries(data)) {
      this.documents.set(key, value);
    }
  }
  
  // Helper method to get all documents (for debugging)
  getAllDocuments() {
    return Object.fromEntries(this.documents);
  }
}

// Create singleton mock instance
export const mockCouchbase = new MockCouchbase();

// Mock the collection methods
const mockCollection = {
  get: vi.fn().mockImplementation((key: string) => mockCouchbase.get(key)),
  upsert: vi.fn().mockImplementation((key: string, value: any) => mockCouchbase.upsert(key, value)),
  insert: vi.fn().mockImplementation((key: string, value: any) => mockCouchbase.insert(key, value)),
  replace: vi.fn().mockImplementation((key: string, value: any) => mockCouchbase.replace(key, value)),
  remove: vi.fn().mockImplementation((key: string) => mockCouchbase.remove(key)),
  exists: vi.fn().mockImplementation((key: string) => mockCouchbase.exists(key)),
};

// Mock the cluster and bucket
const mockCluster = {
  query: vi.fn().mockImplementation((statement: string, options?: any) => 
    mockCouchbase.query(statement, options)
  ),
  close: vi.fn().mockResolvedValue(undefined),
};

const mockBucket = {
  name: 'test_bucket',
  defaultScope: vi.fn(() => ({
    collection: vi.fn(() => mockCollection)
  })),
  defaultCollection: vi.fn(() => mockCollection),
};

// Mock the Couchbase service
vi.mock('@/services/couchbase', () => ({
  getCouchbaseConnection: vi.fn().mockResolvedValue({
    cluster: mockCluster,
    bucket: mockBucket
  }),
  getCollection: vi.fn().mockResolvedValue(mockCollection),
  getDocument: vi.fn().mockImplementation(async (key: string) => {
    try {
      const result = await mockCouchbase.get(key);
      return result.content;
    } catch (error) {
      if (error.name === 'DocumentNotFoundError') {
        return null;
      }
      throw error;
    }
  }),
  upsertDocument: vi.fn().mockImplementation((key: string, value: any) => 
    mockCouchbase.upsert(key, value)
  ),
  removeDocument: vi.fn().mockImplementation(async (key: string) => {
    try {
      return await mockCouchbase.remove(key);
    } catch (error) {
      if (error.name === 'DocumentNotFoundError') {
        return null;
      }
      throw error;
    }
  }),
  query: vi.fn().mockImplementation((statement: string, options?: any) => 
    mockCouchbase.query(statement, options)
  ),
  CouchbaseError: class extends Error {
    constructor(message: string, public code?: string) {
      super(message);
      this.name = 'CouchbaseError';
    }
  }
}));

// Test utilities
export const initTestDatabase = async () => {
  mockCouchbase.clear();
  
  // Seed with default test data
  mockCouchbase.seedData({
    'user::test-user-1': {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
      lastLogin: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    'tournament::test-tournament': {
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
      updatedAt: '2024-01-01T00:00:00Z'
    },
    'team::test-team-1': {
      id: 'test-team-1',
      tournamentId: 'test-tournament',
      name: 'Test Team',
      colorHex: '#FF6B6B',
      flagCode: '🏁',
      members: ['test-user-1'],
      captainId: 'test-user-1',
      createdAt: '2024-01-01T00:00:00Z'
    }
  });
};

export const cleanupTestDatabase = async () => {
  mockCouchbase.clear();
  // Clear all mocks
  vi.clearAllMocks();
};