#!/usr/bin/env node

const fetch = require('node-fetch');
const { nanoid } = require('nanoid');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5173';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'test-token';

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Test results tracking
let passed = 0;
let failed = 0;
const results = [];

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url, options = {}) {
  try {
    log(`\nTesting: ${name}`, 'blue');
    
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${AUTH_TOKEN}`,
        ...options.headers
      }
    });
    
    const data = await response.text();
    let jsonData;
    
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }
    
    if (response.ok) {
      log(`✓ ${name} - Status: ${response.status}`, 'green');
      passed++;
      results.push({ name, status: 'passed', code: response.status });
      return { success: true, data: jsonData };
    } else {
      log(`✗ ${name} - Status: ${response.status}`, 'red');
      console.log('Response:', jsonData);
      failed++;
      results.push({ name, status: 'failed', code: response.status, error: jsonData });
      return { success: false, error: jsonData };
    }
  } catch (error) {
    log(`✗ ${name} - Error: ${error.message}`, 'red');
    failed++;
    results.push({ name, status: 'error', error: error.message });
    return { success: false, error: error.message };
  }
}

// Test suites
async function testAuthEndpoints() {
  log('\n=== AUTH ENDPOINTS ===', 'yellow');
  
  await testEndpoint('GET /api/auth/google', 'GET', '/api/auth/google');
  await testEndpoint('GET /api/auth/me (unauthenticated)', 'GET', '/api/auth/me', {
    headers: { Cookie: '' }
  });
  await testEndpoint('POST /api/auth/logout', 'POST', '/api/auth/logout');
  await testEndpoint('GET /api/auth/test-env', 'GET', '/api/auth/test-env');
}

async function testTournamentEndpoints() {
  log('\n=== TOURNAMENT ENDPOINTS ===', 'yellow');
  
  const tournamentSlug = 'test-' + nanoid(6);
  
  // Create tournament
  const createResult = await testEndpoint(
    'POST /api/trpc/tournament.create',
    'POST',
    '/api/trpc/tournament.create?batch=1',
    {
      body: JSON.stringify({
        0: {
          json: {
            name: 'Test Tournament ' + Date.now(),
            date: '2024-07-15'
          }
        }
      })
    }
  );
  
  if (createResult.success && createResult.data?.[0]?.result?.data?.slug) {
    const slug = createResult.data[0].result.data.slug;
    
    // Get tournament
    await testEndpoint(
      'GET /api/trpc/tournament.getBySlug',
      'GET',
      `/api/trpc/tournament.getBySlug?batch=1&input=${encodeURIComponent(JSON.stringify({
        0: { slug }
      }))}`
    );
    
    // Update tournament
    await testEndpoint(
      'POST /api/trpc/tournament.setOpen',
      'POST',
      '/api/trpc/tournament.setOpen?batch=1',
      {
        body: JSON.stringify({
          0: {
            json: {
              slug,
              isOpen: false
            }
          }
        })
      }
    );
  }
  
  // Test mega tournament
  await testEndpoint(
    'POST /api/trpc/tournament.createMegaTournament',
    'POST',
    '/api/trpc/tournament.createMegaTournament?batch=1',
    {
      body: JSON.stringify({
        0: {
          json: {
            name: 'Test Mega Tournament',
            date: '2024-07-15',
            subTournaments: [{
              name: 'Sub Tournament 1',
              format: 'single_elimination',
              maxTeams: 8
            }],
            megaScoringMethod: 'placement'
          }
        }
      })
    }
  );
}

async function testTeamEndpoints() {
  log('\n=== TEAM ENDPOINTS ===', 'yellow');
  
  // First create a tournament
  const tournamentResult = await fetch(`${BASE_URL}/api/trpc/tournament.create?batch=1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth-token=${AUTH_TOKEN}`
    },
    body: JSON.stringify({
      0: {
        json: {
          name: 'Team Test Tournament',
          date: '2024-07-15'
        }
      }
    })
  });
  
  const tournamentData = await tournamentResult.json();
  const tournamentId = tournamentData?.[0]?.result?.data?.slug;
  
  if (tournamentId) {
    // Create team
    const teamResult = await testEndpoint(
      'POST /api/trpc/team.create',
      'POST',
      '/api/trpc/team.create?batch=1',
      {
        body: JSON.stringify({
          0: {
            json: {
              name: 'Test Team',
              playerName: 'Player 1',
              partnerName: 'Player 2',
              tournamentId
            }
          }
        })
      }
    );
    
    if (teamResult.success && teamResult.data?.[0]?.result?.data?.teamCode) {
      const teamCode = teamResult.data[0].result.data.teamCode;
      
      // Join team
      await testEndpoint(
        'POST /api/trpc/team.join',
        'POST',
        '/api/trpc/team.join?batch=1',
        {
          body: JSON.stringify({
            0: {
              json: {
                teamCode,
                playerName: 'Player 3'
              }
            }
          })
        }
      );
    }
  }
}

async function testLeaderboardEndpoints() {
  log('\n=== LEADERBOARD ENDPOINTS ===', 'yellow');
  
  await testEndpoint(
    'GET /api/trpc/leaderboard.getGlobal',
    'GET',
    `/api/trpc/leaderboard.getGlobal?batch=1&input=${encodeURIComponent(JSON.stringify({
      0: {
        timeframe: 'all',
        limit: 10
      }
    }))}`
  );
}

async function testHealthEndpoints() {
  log('\n=== HEALTH CHECK ===', 'yellow');
  
  await testEndpoint('GET /api/health', 'GET', '/api/health');
}

// Main test runner
async function runAllTests() {
  log('Starting API endpoint tests...', 'blue');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Auth Token: ${AUTH_TOKEN ? 'Set' : 'Not set'}`, 'blue');
  
  await testHealthEndpoints();
  await testAuthEndpoints();
  await testTournamentEndpoints();
  await testTeamEndpoints();
  await testLeaderboardEndpoints();
  
  // Summary
  log('\n=== TEST SUMMARY ===', 'yellow');
  log(`Total tests: ${passed + failed}`, 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');
  
  // Detailed failures
  if (failed > 0) {
    log('\nFailed tests:', 'red');
    results
      .filter(r => r.status === 'failed' || r.status === 'error')
      .forEach(r => {
        log(`  - ${r.name}: ${r.error?.message || r.error?.error || 'Unknown error'}`, 'red');
      });
  }
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});