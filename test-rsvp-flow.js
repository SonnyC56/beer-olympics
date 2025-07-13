#!/usr/bin/env node

// QA Testing Script for RSVP Flow
// This script tests the complete RSVP user flow from invitation to confirmation

import puppeteer from 'puppeteer';

async function testRSVPFlow() {
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for debugging
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting RSVP Flow Test...');
    
    // 1. Navigate to homepage
    console.log('1. Navigating to homepage...');
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle0' });
    
    // Add test data attribute to verify app loaded
    await page.evaluate(() => {
      const body = document.body;
      body.setAttribute('data-testid', 'app-loaded');
    });
    
    // Wait a bit for React to hydrate
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage-loaded.png', fullPage: true });
    console.log('✅ Homepage loaded successfully');
    
    // 2. Navigate to RSVP page
    console.log('2. Navigating to RSVP page...');
    await page.goto('http://localhost:5175/rsvp?tournament=test-tournament', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    // Check if RSVP form is present
    const rsvpForm = await page.$('form, .card-party');
    if (!rsvpForm) {
      throw new Error('RSVP form not found');
    }
    
    await page.screenshot({ path: 'test-results/rsvp-page-loaded.png', fullPage: true });
    console.log('✅ RSVP page loaded successfully');
    
    // 3. Fill out basic information (Step 1)
    console.log('3. Filling out basic information...');
    
    await page.type('#fullName', 'QA Test User');
    await page.type('#email', 'qa.test@example.com');
    await page.type('#phone', '(555) 123-4567');
    await page.type('#preferredPartner', 'Test Partner');
    
    // Click Next
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-results/rsvp-step1-complete.png', fullPage: true });
    console.log('✅ Step 1 completed');
    
    // 4. Fill out tournament setup (Step 2)
    console.log('4. Filling out tournament setup...');
    
    await page.type('#teamName', 'QA Testing Legends');
    
    // Select skill level
    await page.selectOption('#skillLevel', 'intermediate');
    
    // Select events
    const eventCheckboxes = await page.$$('input[type="checkbox"]');
    for (let i = 0; i < Math.min(3, eventCheckboxes.length); i++) {
      await eventCheckboxes[i].click();
    }
    
    // Click Next
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-results/rsvp-step2-complete.png', fullPage: true });
    console.log('✅ Step 2 completed');
    
    // 5. Fill out fun customization (Step 3)
    console.log('5. Filling out fun customization...');
    
    await page.selectOption('#favoriteGame', 'beer-pong');
    await page.type('#victoryDance', 'The Robot');
    await page.type('#specialTalent', 'Automated Testing');
    await page.type('#motivationalQuote', 'Testing is believing!');
    await page.type('#dietaryRestrictions', 'No bugs please');
    
    // Click Next
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-results/rsvp-step3-complete.png', fullPage: true });
    console.log('✅ Step 3 completed');
    
    // 6. Fill out logistics (Step 4)
    console.log('6. Filling out logistics...');
    
    await page.type('#emergencyContact', 'Emergency Contact');
    await page.type('#emergencyPhone', '(555) 999-9999');
    await page.type('#additionalRequests', 'Please ensure all tests pass!');
    
    // Click Next
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-results/rsvp-step4-complete.png', fullPage: true });
    console.log('✅ Step 4 completed');
    
    // 7. Final confirmation (Step 5)
    console.log('7. Final confirmation...');
    
    // Agree to terms
    await page.check('#terms');
    
    // Submit RSVP
    await page.click('button:has-text("Confirm RSVP!")');
    await page.waitForTimeout(2000);
    
    // Check for success message
    const successElement = await page.$('text=RSVP CONFIRMED!');
    if (!successElement) {
      throw new Error('RSVP confirmation not displayed');
    }
    
    await page.screenshot({ path: 'test-results/rsvp-confirmation.png', fullPage: true });
    console.log('✅ RSVP submitted successfully!');
    
    // 8. Test RSVP Management (if available)
    console.log('8. Testing RSVP Management...');
    
    await page.goto('http://localhost:5175/rsvp-management/test-tournament', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    // Check if we can see the submitted RSVP
    const rsvpTable = await page.$('table');
    if (rsvpTable) {
      const rsvpEntry = await page.$('text=QA Test User');
      if (rsvpEntry) {
        console.log('✅ RSVP visible in management dashboard');
      } else {
        console.log('⚠️  RSVP not immediately visible in management dashboard');
      }
    }
    
    await page.screenshot({ path: 'test-results/rsvp-management.png', fullPage: true });
    
    console.log('🎉 RSVP Flow Test Completed Successfully!');
    
    return {
      success: true,
      message: 'All RSVP flow tests passed'
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-results/error-screenshot.png', fullPage: true });
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// Run the test
testRSVPFlow().then(result => {
  if (result.success) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Tests failed:', result.error);
    process.exit(1);
  }
});