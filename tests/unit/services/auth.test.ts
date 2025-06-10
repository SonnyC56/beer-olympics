import { describe, it, expect, beforeEach } from 'vitest';
import { generateJWT, verifyJWT } from '../../../src/services/auth';

describe('Auth Service', () => {
  beforeEach(() => {
    // Ensure we have a test secret
    process.env.AUTH_SECRET = 'test-secret-key-for-jwt-signing';
  });
  
  describe('JWT handling', () => {
    it('generates a valid JWT token', () => {
      const user = {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg'
      };
      
      const token = generateJWT(user);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
    
    it('verifies a valid JWT token', () => {
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
    
    it('rejects an invalid JWT token', () => {
      const invalidToken = 'invalid.jwt.token';
      const decoded = verifyJWT(invalidToken);
      
      expect(decoded).toBeNull();
    });
    
    it('rejects a JWT with wrong signature', () => {
      const user = {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg'
      };
      
      // Generate token with one secret
      const token = generateJWT(user);
      
      // Try to verify with different secret
      process.env.AUTH_SECRET = 'different-secret';
      const decoded = verifyJWT(token);
      
      expect(decoded).toBeNull();
    });
  });
  
  describe('parseAuthCookie', () => {
    it('extracts auth token from cookie string', async () => {
      // Dynamic import to avoid issues with module mocking
      const { parseAuthCookie } = await import('../../../src/services/auth');
      
      const cookieString = 'auth-token=abc123; other-cookie=value';
      const token = parseAuthCookie(cookieString);
      
      expect(token).toBe('abc123');
    });
    
    it('returns null for missing auth cookie', async () => {
      const { parseAuthCookie } = await import('../../../src/services/auth');
      
      const cookieString = 'other-cookie=value';
      const token = parseAuthCookie(cookieString);
      
      expect(token).toBeNull();
    });
    
    it('returns null for undefined cookie string', async () => {
      const { parseAuthCookie } = await import('../../../src/services/auth');
      
      const token = parseAuthCookie(undefined);
      
      expect(token).toBeNull();
    });
  });
});