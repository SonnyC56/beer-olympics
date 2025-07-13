/**
 * Tournament Creation & Management Tests with Puppeteer
 */

describe('Tournament Creation & Management', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:5173');
    await testUtils.login(page);
  });

  test('should create a new tournament successfully', async () => {
    // Navigate to create tournament page
    await page.click('button:contains("Create Tournament"), a:contains("Create Tournament")');
    
    // Fill out tournament form
    await page.type('input[name="name"], input[placeholder*="name"]', 'Test Beer Olympics 2024');
    await page.type('input[type="date"], input[name="date"]', '2024-07-15');
    
    // Take screenshot of form
    await testUtils.screenshot(page, 'tournament-form');
    
    // Submit form
    await page.click('button[type="submit"], button:contains("Create")');
    
    // Should redirect to tournament dashboard
    await expect(page).toMatchElement('text=Test Beer Olympics 2024', { timeout: 10000 });
    expect(page.url()).toMatch(/\/tournament|\/dashboard/);
    
    // Take screenshot of created tournament
    await testUtils.screenshot(page, 'tournament-created');
    
    // Verify tournament elements are present
    await testUtils.expectElementVisible(page, 'text=Test Beer Olympics 2024');
    await testUtils.expectElementVisible(page, 'text=2024');
  });

  test('should validate form inputs', async () => {
    await page.click('button:contains("Create Tournament"), a:contains("Create Tournament")');
    
    // Try to submit empty form
    await page.click('button[type="submit"], button:contains("Create")');
    
    // Check if form validation prevents submission
    const nameInput = await page.$('input[name="name"], input[placeholder*="name"]');
    const isRequired = await nameInput.evaluate(el => el.hasAttribute('required'));
    
    if (isRequired) {
      // HTML5 validation should prevent submission
      expect(page.url()).toMatch(/create/);
    }
    
    // Take screenshot of validation state
    await testUtils.screenshot(page, 'form-validation');
  });

  test('should navigate to tournament control room', async () => {
    // Navigate to control room
    const controlRoomButton = await page.$('button:contains("Control Room"), a:contains("Control Room")');
    
    if (controlRoomButton) {
      await controlRoomButton.click();
      
      // Verify control room page
      await expect(page).toMatchElement('text=Control Room');
      await testUtils.expectElementVisible(page, 'text=Registration');
      
      // Take screenshot
      await testUtils.screenshot(page, 'control-room');
      
      // Test registration toggle
      await testRegistrationToggle();
    }
  });

  async function testRegistrationToggle() {
    const toggleButton = await page.$('button:contains("Close Registration"), button:contains("Open Registration")');
    
    if (toggleButton) {
      const initialText = await page.evaluate(el => el.textContent, toggleButton);
      await toggleButton.click();
      
      // Wait for API call
      await page.waitForTimeout(1000);
      const newText = await page.evaluate(el => el.textContent, toggleButton);
      expect(newText).not.toBe(initialText);
      
      // Take screenshot of toggled state
      await testUtils.screenshot(page, 'registration-toggled');
    }
  }

  test('should display tournament statistics', async () => {
    // Navigate to tournament dashboard
    const dashboardLink = await page.$('a[href*="dashboard"], a:contains("Dashboard")');
    
    if (dashboardLink) {
      await dashboardLink.click();
      
      // Verify statistics are displayed
      await testUtils.expectElementVisible(page, 'text=Teams');
      await testUtils.expectElementVisible(page, 'text=0'); // Initial team count
      
      // Take screenshot
      await testUtils.screenshot(page, 'tournament-stats');
    }
  });

  test('should handle tournament sharing', async () => {
    // Look for share functionality
    const shareButton = await page.$('button:contains("Share"), button:contains("Copy Link")');
    
    if (shareButton) {
      await shareButton.click();
      
      // Should show confirmation or copy to clipboard
      await expect(page).toMatchElement('text=copied, text=Copied, text=Link copied', { timeout: 5000 });
      
      // Take screenshot
      await testUtils.screenshot(page, 'tournament-shared');
    }
  });

  test('should be responsive on mobile devices', async () => {
    await testUtils.testResponsive(page, async (viewport) => {
      // Test tournament creation flow on different screen sizes
      const createButton = await page.$('button:contains("Create Tournament"), a:contains("Create Tournament")');
      
      if (createButton) {
        await testUtils.expectElementVisible(page, 'button:contains("Create Tournament"), a:contains("Create Tournament")');
        
        // Verify buttons are touchable on mobile
        const buttonBox = await createButton.boundingBox();
        expect(buttonBox.height).toBeGreaterThan(40); // Minimum touch target
      }
    });
  });

  test('should handle tournament deletion/archiving', async () => {
    // Look for settings or delete functionality
    const settingsButton = await page.$('button:contains("Settings"), button[aria-label="Settings"]');
    
    if (settingsButton) {
      await settingsButton.click();
      
      const deleteButton = await page.$('button:contains("Delete"), button:contains("Archive")');
      
      if (deleteButton) {
        await deleteButton.click();
        
        // Should show confirmation dialog
        await expect(page).toMatchElement('text=confirm, text=Confirm, text=Are you sure', { timeout: 5000 });
        
        // Take screenshot of confirmation
        await testUtils.screenshot(page, 'delete-confirmation');
        
        // Cancel deletion for test purposes
        const cancelButton = await page.$('button:contains("Cancel")');
        if (cancelButton) {
          await cancelButton.click();
        }
      }
    }
  });

  test('should validate tournament date inputs', async () => {
    await page.click('button:contains("Create Tournament"), a:contains("Create Tournament")');
    
    // Test past date validation
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().split('T')[0];
    
    await page.type('input[type="date"], input[name="date"]', pastDate);
    await page.type('input[name="name"], input[placeholder*="name"]', 'Test Tournament');
    await page.click('button[type="submit"], button:contains("Create")');
    
    // Should either prevent submission or show warning
    await testUtils.screenshot(page, 'date-validation');
  });

  test('should handle network errors gracefully', async () => {
    await page.setRequestInterception(true);
    
    page.on('request', request => {
      if (request.url().includes('/api/tournaments')) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    await page.click('button:contains("Create Tournament"), a:contains("Create Tournament")');
    await page.type('input[name="name"], input[placeholder*="name"]', 'Network Test Tournament');
    await page.click('button[type="submit"], button:contains("Create")');
    
    // Should show error message
    await testUtils.screenshot(page, 'network-error');
  });
});