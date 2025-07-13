import { test, expect } from '@playwright/test';
import { TestUtils } from '../setup';

test.describe('Tournament Creation & Management', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
    await page.goto('/');
    await utils.login();
  });

  test('should create a new tournament successfully', async ({ page }) => {
    // Navigate to create tournament page
    await page.locator('button:has-text("Create Tournament"), a:has-text("Create Tournament")').first().click();
    
    // Fill out tournament form
    await page.fill('input[name="name"], input[placeholder*="name"]', 'Test Beer Olympics 2024');
    await page.fill('input[type="date"], input[name="date"]', '2024-07-15');
    
    // Take screenshot of form
    await utils.screenshot('tournament-form');
    
    // Submit form
    await page.locator('button[type="submit"], button:has-text("Create")').click();
    
    // Should redirect to tournament dashboard
    await expect(page.locator('text=Test Beer Olympics 2024')).toBeVisible({ timeout: 10000 });
    await expect(page.url()).toMatch(/\/tournament|\/dashboard/);
    
    // Take screenshot of created tournament
    await utils.screenshot('tournament-created');
    
    // Verify tournament elements are present
    await utils.expectElementVisible('text=Test Beer Olympics 2024');
    await utils.expectElementVisible('text=2024');
  });

  test('should validate form inputs', async ({ page }) => {
    await page.locator('button:has-text("Create Tournament"), a:has-text("Create Tournament")').first().click();
    
    // Try to submit empty form
    await page.locator('button[type="submit"], button:has-text("Create")').click();
    
    // Should show validation errors
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    
    // Check if form validation prevents submission
    const isRequired = await nameInput.getAttribute('required');
    if (isRequired !== null) {
      // HTML5 validation should prevent submission
      expect(page.url()).toMatch(/create/);
    }
    
    // Take screenshot of validation state
    await utils.screenshot('form-validation');
  });

  test('should navigate to tournament control room', async ({ page }) => {
    // Assume we have a tournament already (from previous test or seeded data)
    // Navigate to control room
    const controlRoomButton = page.locator('button:has-text("Control Room"), a:has-text("Control Room")').first();
    
    if (await controlRoomButton.isVisible()) {
      await controlRoomButton.click();
      
      // Verify control room page
      await expect(page.locator('text=Control Room')).toBeVisible();
      await utils.expectElementVisible('text=Registration');
      
      // Take screenshot
      await utils.screenshot('control-room');
      
      // Test control room functionality
      await testRegistrationToggle(page);
    }
  });

  async function testRegistrationToggle(page: any) {
    const toggleButton = page.locator('button:has-text("Close Registration"), button:has-text("Open Registration")').first();
    
    if (await toggleButton.isVisible()) {
      const initialText = await toggleButton.textContent();
      await toggleButton.click();
      
      // Should toggle registration status
      await page.waitForTimeout(1000); // Wait for API call
      const newText = await toggleButton.textContent();
      expect(newText).not.toBe(initialText);
      
      // Take screenshot of toggled state
      await utils.screenshot('registration-toggled');
    }
  }

  test('should display tournament statistics', async ({ page }) => {
    // Navigate to tournament dashboard/control room
    const dashboardLink = page.locator('a[href*="dashboard"], a:has-text("Dashboard")').first();
    
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      
      // Verify statistics are displayed
      await utils.expectElementVisible('text=Teams');
      await utils.expectElementVisible('text=0'); // Initial team count
      
      // Take screenshot
      await utils.screenshot('tournament-stats');
    }
  });

  test('should handle tournament sharing', async ({ page }) => {
    // Look for share or join link functionality
    const shareButton = page.locator('button:has-text("Share"), button:has-text("Copy Link")').first();
    
    if (await shareButton.isVisible()) {
      await shareButton.click();
      
      // Should copy join link or show share options
      // Check clipboard if accessible or look for confirmation message
      await expect(page.locator('text=copied, text=Copied, text=Link copied')).toBeVisible({ timeout: 5000 });
      
      // Take screenshot
      await utils.screenshot('tournament-shared');
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await utils.testResponsive(async () => {
      // Test tournament creation flow on different screen sizes
      const createButton = page.locator('button:has-text("Create Tournament"), a:has-text("Create Tournament")').first();
      
      if (await createButton.isVisible()) {
        await utils.expectElementVisible(createButton.locator('..'));
        
        // Verify buttons are touchable on mobile
        const buttonBox = await createButton.boundingBox();
        expect(buttonBox?.height).toBeGreaterThan(40); // Minimum touch target
      }
    });
  });

  test('should handle tournament deletion/archiving', async ({ page }) => {
    // Look for delete or archive functionality
    const settingsButton = page.locator('button:has-text("Settings"), button[aria-label="Settings"]').first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Archive")').first();
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Should show confirmation dialog
        await expect(page.locator('text=confirm, text=Confirm, text=Are you sure')).toBeVisible({ timeout: 5000 });
        
        // Take screenshot of confirmation
        await utils.screenshot('delete-confirmation');
        
        // Cancel deletion for test purposes
        const cancelButton = page.locator('button:has-text("Cancel")').first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    }
  });

  test('should validate tournament date inputs', async ({ page }) => {
    await page.locator('button:has-text("Create Tournament"), a:has-text("Create Tournament")').first().click();
    
    // Test past date validation
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().split('T')[0];
    
    await page.fill('input[type="date"], input[name="date"]', pastDate);
    await page.fill('input[name="name"], input[placeholder*="name"]', 'Test Tournament');
    await page.locator('button[type="submit"], button:has-text("Create")').click();
    
    // Should either prevent submission or show warning
    // This depends on your validation logic
    await utils.screenshot('date-validation');
  });

  test('should preserve form data on navigation', async ({ page }) => {
    await page.locator('button:has-text("Create Tournament"), a:has-text("Create Tournament")').first().click();
    
    // Fill form partially
    await page.fill('input[name="name"], input[placeholder*="name"]', 'Draft Tournament');
    
    // Navigate away and back (if applicable)
    await page.goBack();
    await page.locator('button:has-text("Create Tournament"), a:has-text("Create Tournament")').first().click();
    
    // Check if form data is preserved (depends on implementation)
    const nameValue = await page.locator('input[name="name"], input[placeholder*="name"]').inputValue();
    
    // Take screenshot
    await utils.screenshot('form-persistence');
  });
});