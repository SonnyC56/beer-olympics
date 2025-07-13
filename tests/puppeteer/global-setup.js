/**
 * Puppeteer Global Setup
 * Runs once before all tests
 */

module.exports = async () => {
  console.log('🚀 Setting up Puppeteer tests...');
  
  // Wait for dev server to be ready
  const fetch = require('node-fetch');
  const maxRetries = 30;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch('http://localhost:5173');
      if (response.ok) {
        console.log('✅ Dev server is ready');
        break;
      }
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw new Error('❌ Dev server failed to start');
      }
      console.log(`⏳ Waiting for dev server... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};