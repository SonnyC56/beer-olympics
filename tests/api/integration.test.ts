import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fetch from 'node-fetch';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Test server setup
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001;

let server: any;
let app: any;

beforeAll(async () => {
  // Skip if in CI or if integration tests are disabled
  if (process.env.CI || process.env.SKIP_INTEGRATION_TESTS) {
    return;
  }

  app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  
  await app.prepare();
  
  server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });
  
  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`Test server running on http://${hostname}:${port}`);
      resolve();
    });
  });
}, 30000);

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

const baseUrl = `http://localhost:${port}`;

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return 200 for health endpoint', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('status', 'ok');
    });
  });

  describe('Auth Flow Integration', () => {
    it('should complete OAuth flow', async () => {
      // 1. Get auth URL
      const authResponse = await fetch(`${baseUrl}/api/auth/google`);
      expect(authResponse.status).toBe(200);
      const { url } = await authResponse.json();
      expect(url).toContain('accounts.google.com');
      
      // 2. Simulate callback (would need mock OAuth in real test)
      // This would redirect to /api/auth/callback with code
      
      // 3. Check auth status
      const meResponse = await fetch(`${baseUrl}/api/auth/me`);
      expect(meResponse.status).toBe(401); // Not logged in
    });
  });

  describe('Tournament Creation Flow', () => {
    let authCookie: string;
    
    beforeAll(async () => {
      // Simulate login for protected endpoints
      // In real tests, this would use a test auth provider
      authCookie = 'auth-token=test-token';
    });
    
    it('should create and retrieve tournament', async () => {
      // Create tournament
      const createResponse = await fetch(`${baseUrl}/api/trpc/tournament.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          json: {
            name: 'Integration Test Tournament',
            date: '2024-07-15',
          },
        }),
      });
      
      if (createResponse.ok) {
        const result = await createResponse.json();
        expect(result).toHaveProperty('result.data.slug');
        
        // Retrieve tournament
        const slug = result.result.data.slug;
        const getResponse = await fetch(
          `${baseUrl}/api/trpc/tournament.getBySlug?input=${encodeURIComponent(JSON.stringify({ slug }))}`
        );
        expect(getResponse.status).toBe(200);
      }
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await fetch(`${baseUrl}/api/non-existent`);
      expect(response.status).toBe(404);
    });
    
    it('should return 401 for protected endpoints without auth', async () => {
      const response = await fetch(`${baseUrl}/api/trpc/tournament.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: { name: 'Test', date: '2024-07-15' },
        }),
      });
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error.json.code).toBe('UNAUTHORIZED');
    });
  });
});