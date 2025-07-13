#!/usr/bin/env node

/**
 * Comprehensive E2E Test Runner
 * Runs both Playwright and Puppeteer tests with reporting
 * 
 * Usage:
 *   node scripts/test-all-e2e.js [options]
 * 
 * Options:
 *   --headed      Run tests in headed mode (visible browser)
 *   --smoke-only  Run only smoke tests
 *   --playwright  Run only Playwright tests
 *   --puppeteer   Run only Puppeteer tests
 *   --parallel    Run test suites in parallel
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  headed: args.includes('--headed'),
  smokeOnly: args.includes('--smoke-only'),
  playwrightOnly: args.includes('--playwright'),
  puppeteerOnly: args.includes('--puppeteer'),
  parallel: args.includes('--parallel')
};

// Test results
const results = {
  playwright: null,
  puppeteer: null,
  startTime: Date.now()
};

console.log('🧪 Running Comprehensive E2E Test Suite');
console.log('==========================================');
console.log(`Options: ${JSON.stringify(options, null, 2)}`);
console.log('');

async function runPlaywrightTests() {
  console.log('🎭 Running Playwright Tests...');
  console.log('------------------------------');
  
  try {
    let command = 'npm run test:e2e';
    
    if (options.headed) {
      command = 'npm run test:e2e:headed';
    }
    
    if (options.smokeOnly) {
      command += ' tests/e2e/smoke.spec.ts';
    }
    
    execSync(command, { stdio: 'inherit' });
    results.playwright = { status: 'passed', error: null };
    console.log('✅ Playwright tests passed!');
  } catch (error) {
    results.playwright = { status: 'failed', error: error.message };
    console.error('❌ Playwright tests failed!');
    console.error(error.message);
  }
  
  console.log('');
}

async function runPuppeteerTests() {
  console.log('🐕 Running Puppeteer Tests...');
  console.log('-----------------------------');
  
  try {
    let command = 'npm run test:puppeteer';
    
    if (options.headed) {
      command = 'npm run test:puppeteer:headed';
    }
    
    if (options.smokeOnly) {
      command = 'npm run test:puppeteer:smoke';
    }
    
    execSync(command, { stdio: 'inherit' });
    results.puppeteer = { status: 'passed', error: null };
    console.log('✅ Puppeteer tests passed!');
  } catch (error) {
    results.puppeteer = { status: 'failed', error: error.message };
    console.error('❌ Puppeteer tests failed!');
    console.error(error.message);
  }
  
  console.log('');
}

async function runTestsParallel() {
  console.log('🚀 Running tests in parallel...');
  
  const promises = [];
  
  if (!options.puppeteerOnly) {
    promises.push(runPlaywrightTests());
  }
  
  if (!options.playwrightOnly) {
    promises.push(runPuppeteerTests());
  }
  
  await Promise.all(promises);
}

async function runTestsSequential() {
  if (!options.puppeteerOnly) {
    await runPlaywrightTests();
  }
  
  if (!options.playwrightOnly) {
    await runPuppeteerTests();
  }
}

function printSummary() {
  const endTime = Date.now();
  const totalTime = Math.round((endTime - results.startTime) / 1000);
  
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`Total execution time: ${totalTime}s`);
  console.log('');
  
  if (results.playwright) {
    console.log(`🎭 Playwright: ${results.playwright.status === 'passed' ? '✅ PASSED' : '❌ FAILED'}`);
    if (results.playwright.error) {
      console.log(`   Error: ${results.playwright.error}`);
    }
  }
  
  if (results.puppeteer) {
    console.log(`🐕 Puppeteer:  ${results.puppeteer.status === 'passed' ? '✅ PASSED' : '❌ FAILED'}`);
    if (results.puppeteer.error) {
      console.log(`   Error: ${results.puppeteer.error}`);
    }
  }
  
  console.log('');
  
  // Overall status
  const allPassed = (!results.playwright || results.playwright.status === 'passed') &&
                    (!results.puppeteer || results.puppeteer.status === 'passed');
  
  if (allPassed) {
    console.log('🎉 All tests passed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('- View Playwright report: npx playwright show-report');
    console.log('- Check screenshots: test-results/');
    console.log('- Review any warnings or performance metrics');
  } else {
    console.log('💥 Some tests failed!');
    console.log('');
    console.log('🔍 Debug options:');
    console.log('- Run with --headed flag to see browser actions');
    console.log('- Check test-results/ for screenshots and traces');
    console.log('- Run individual test suites for detailed output');
    
    process.exit(1);
  }
}

async function main() {
  try {
    // Validate environment
    console.log('🔍 Checking environment...');
    
    // Check if dev server is running
    try {
      execSync('curl -f http://localhost:5173 > /dev/null 2>&1', { stdio: 'ignore' });
      console.log('✅ Dev server is running');
    } catch (error) {
      console.log('⚠️  Dev server not detected - tests will start their own server');
    }
    
    console.log('');
    
    // Run tests
    if (options.parallel) {
      await runTestsParallel();
    } else {
      await runTestsSequential();
    }
    
    // Print summary
    printSummary();
    
  } catch (error) {
    console.error('💥 Fatal error running tests:', error.message);
    process.exit(1);
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('');
  console.log('⚠️  Tests interrupted by user');
  printSummary();
  process.exit(1);
});

// Run the main function
main();