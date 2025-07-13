#!/usr/bin/env node

/**
 * E2E Test Runner for Beer Olympics
 * 
 * Usage:
 *   node scripts/test-e2e.js [category] [options]
 * 
 * Categories:
 *   auth, tournament, team, scoring, leaderboard, design, pwa, all
 * 
 * Options:
 *   --headed    Run tests in headed mode (visible browser)
 *   --ui        Run tests with Playwright UI
 *   --mobile    Run only mobile tests
 *   --desktop   Run only desktop tests
 *   --debug     Run in debug mode
 */

const { execSync } = require('child_process');
const path = require('path');

// Test categories and their corresponding paths
const categories = {
  auth: 'tests/e2e/auth/',
  tournament: 'tests/e2e/tournament/',
  team: 'tests/e2e/team/',
  scoring: 'tests/e2e/scoring/',
  leaderboard: 'tests/e2e/leaderboard/',
  design: 'tests/e2e/design/',
  pwa: 'tests/e2e/pwa/',
  all: 'tests/e2e/'
};

// Parse command line arguments
const args = process.argv.slice(2);
const category = args[0] || 'all';
const options = args.slice(1);

// Validate category
if (!categories[category]) {
  console.error(`❌ Invalid category: ${category}`);
  console.error(`✅ Valid categories: ${Object.keys(categories).join(', ')}`);
  process.exit(1);
}

// Build Playwright command
let command = 'npx playwright test';

// Add test path
command += ` ${categories[category]}`;

// Process options
if (options.includes('--headed')) {
  command += ' --headed';
}

if (options.includes('--ui')) {
  command += ' --ui';
}

if (options.includes('--debug')) {
  command += ' --debug';
}

if (options.includes('--mobile')) {
  command += ' --project="Mobile Chrome" --project="Mobile Safari"';
} else if (options.includes('--desktop')) {
  command += ' --project=chromium --project=firefox --project=webkit';
}

// Add common options
if (!options.includes('--ui') && !options.includes('--debug')) {
  command += ' --reporter=html';
}

console.log(`🧪 Running E2E tests for: ${category}`);
console.log(`📝 Command: ${command}`);
console.log('');

try {
  // Run the tests
  execSync(command, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('');
  console.log('✅ Tests completed successfully!');
  
  if (!options.includes('--ui') && !options.includes('--debug')) {
    console.log('📊 View test report: npx playwright show-report');
  }
  
} catch (error) {
  console.error('');
  console.error('❌ Tests failed!');
  console.error('📊 View test report: npx playwright show-report');
  console.error('🔍 Debug failing tests: npx playwright test --debug');
  process.exit(1);
}