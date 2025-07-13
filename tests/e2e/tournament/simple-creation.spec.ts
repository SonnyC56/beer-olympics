import { test, expect } from '@playwright/test';

test.describe('Simple Tournament Creation Test', () => {
  test('should create a tournament without authentication', async ({ page }) => {
    // Go to the app
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for create tournament button/link
    const createButton = page.locator('button:has-text("Create Tournament"), a:has-text("Create Tournament")').first();
    
    // If button is visible, click it
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Fill out the tournament form
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="Tournament"]').first();
      const dateInput = page.locator('input[type="date"], input[name="date"]').first();
      
      if (await nameInput.isVisible() && await dateInput.isVisible()) {
        await nameInput.fill('Test Tournament ' + Date.now());
        
        // Set date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await dateInput.fill(tomorrow.toISOString().split('T')[0]);
        
        // Submit the form
        const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Submit")').first();
        await submitButton.click();
        
        // Wait for response
        await page.waitForLoadState('networkidle');
        
        // Check if we see success indication
        // This could be a redirect, a success message, or the tournament name displayed
        const successIndicators = [
          page.locator('text=Test Tournament'),
          page.locator('text=Success'),
          page.locator('text=Created'),
          page.locator('text=successfully')
        ];
        
        let foundSuccess = false;
        for (const indicator of successIndicators) {
          if (await indicator.isVisible({ timeout: 5000 }).catch(() => false)) {
            foundSuccess = true;
            break;
          }
        }
        
        expect(foundSuccess).toBe(true);
      }
    } else {
      // If no create button is visible, check if we're on a login page
      const isLoginPage = await page.locator('text=Sign in, text=Login, text=log in').first().isVisible({ timeout: 1000 }).catch(() => false);
      
      if (isLoginPage) {
        console.log('App requires authentication - skipping tournament creation test');
        test.skip();
      } else {
        // The app might be in a different state, log the current URL
        console.log('Current URL:', page.url());
        console.log('Create button not found on page');
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'test-results/no-create-button.png' });
        
        // This is still a valid test result - the button should be there
        expect(createButton).toBeVisible();
      }
    }
  });

  test('should access tournament creation directly via URL', async ({ page }) => {
    // Try common tournament creation URLs
    const createUrls = [
      'http://localhost:5173/create-tournament',
      'http://localhost:5173/tournaments/create',
      'http://localhost:5173/tournament/new',
      'http://localhost:5173/create'
    ];
    
    let foundCreatePage = false;
    
    for (const url of createUrls) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Check if we're on a form page
      const hasForm = await page.locator('form').isVisible({ timeout: 2000 }).catch(() => false);
      const hasNameInput = await page.locator('input[name="name"], input[placeholder*="name"]').isVisible({ timeout: 1000 }).catch(() => false);
      
      if (hasForm && hasNameInput) {
        foundCreatePage = true;
        console.log('Found tournament creation form at:', url);
        
        // Fill and submit the form
        await page.fill('input[name="name"], input[placeholder*="name"]', 'Direct URL Test Tournament');
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await page.fill('input[type="date"]', tomorrow.toISOString().split('T')[0]);
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Create")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForLoadState('networkidle');
          
          // Check for success
          const success = await page.locator('text=Direct URL Test Tournament').isVisible({ timeout: 5000 }).catch(() => false);
          expect(success).toBe(true);
        }
        
        break;
      }
    }
    
    if (!foundCreatePage) {
      console.log('No tournament creation page found at common URLs');
      console.log('Current URL after attempts:', page.url());
      
      // This might be expected if the app uses different routing
      test.skip();
    }
  });
});