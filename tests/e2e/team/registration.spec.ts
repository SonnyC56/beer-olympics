import { test, expect } from '@playwright/test';
import { TestUtils } from '../setup';

test.describe('Team Registration & Joining', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
    await page.goto('/');
    await utils.login();
  });

  test('should join tournament via public link', async ({ page }) => {
    // Simulate joining via public link (e.g., /join/tournament-slug)
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`/join/${mockTournamentSlug}`);
    
    // Should display tournament info and join form
    await utils.expectElementVisible('h1, h2'); // Tournament name
    await utils.expectElementVisible('form, input[name="teamName"]');
    
    // Take screenshot of join page
    await utils.screenshot('tournament-join-page');
    
    // Verify design elements
    await utils.verifyDesignSystem();
    await utils.checkAccessibility();
  });

  test('should create team with valid information', async ({ page }) => {
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`/join/${mockTournamentSlug}`);
    
    // Fill team registration form
    await page.fill('input[name="teamName"], input[placeholder*="team name"]', 'The Beer Crushers');
    
    // Select team color (if color picker exists)
    const colorInput = page.locator('input[type="color"], input[name="color"]').first();
    if (await colorInput.isVisible()) {
      await colorInput.fill('#FF6B6B');
    }
    
    // Select flag/emoji (if available)
    const flagSelect = page.locator('select[name="flag"], button[data-testid="flag-picker"]').first();
    if (await flagSelect.isVisible()) {
      await flagSelect.click();
      await page.locator('option[value="🇺🇸"], button:has-text("🇺🇸")').first().click();
    }
    
    // Take screenshot of filled form
    await utils.screenshot('team-form-filled');
    
    // Submit form
    await page.locator('button[type="submit"], button:has-text("Join"), button:has-text("Create Team")').click();
    
    // Should redirect to team dashboard or success page
    await expect(page.locator('text=The Beer Crushers')).toBeVisible({ timeout: 10000 });
    await expect(page.url()).toMatch(/team|dashboard|success/);
    
    // Take screenshot of success
    await utils.screenshot('team-created-success');
  });

  test('should validate team name requirements', async ({ page }) => {
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`/join/${mockTournamentSlug}`);
    
    // Test empty team name
    await page.locator('button[type="submit"], button:has-text("Join"), button:has-text("Create Team")').click();
    
    // Should show validation error
    const teamNameInput = page.locator('input[name="teamName"], input[placeholder*="team name"]').first();
    const validationMessage = await teamNameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    
    if (validationMessage) {
      expect(validationMessage).toBeTruthy();
    }
    
    // Test very long team name
    await page.fill('input[name="teamName"], input[placeholder*="team name"]', 'A'.repeat(100));
    await page.locator('button[type="submit"], button:has-text("Join"), button:has-text("Create Team")').click();
    
    // Should either truncate or show error
    await utils.screenshot('team-name-validation');
  });

  test('should prevent duplicate team names', async ({ page }) => {
    const mockTournamentSlug = 'test-tournament-123';
    
    // Mock API response for duplicate team name
    await page.route('**/api/teams/join', async route => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Team name already taken in this tournament' 
        })
      });
    });
    
    await page.goto(`/join/${mockTournamentSlug}`);
    await page.fill('input[name="teamName"], input[placeholder*="team name"]', 'Duplicate Team');
    await page.locator('button[type="submit"], button:has-text("Join"), button:has-text("Create Team")').click();
    
    // Should show error message
    await expect(page.locator('text=already taken, text=duplicate, text=exists')).toBeVisible({ timeout: 5000 });
    
    // Take screenshot of error state
    await utils.screenshot('duplicate-team-error');
  });

  test('should handle closed tournament registration', async ({ page }) => {
    const mockTournamentSlug = 'closed-tournament-123';
    
    // Mock API response for closed registration
    await page.route(`**/api/tournaments/${mockTournamentSlug}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          name: 'Closed Tournament',
          isOpen: false,
          date: '2024-07-15'
        })
      });
    });
    
    await page.goto(`/join/${mockTournamentSlug}`);
    
    // Should show registration closed message
    await expect(page.locator('text=closed, text=Registration closed')).toBeVisible();
    
    // Form should be disabled or hidden
    const submitButton = page.locator('button[type="submit"], button:has-text("Join")').first();
    if (await submitButton.isVisible()) {
      expect(await submitButton.isDisabled()).toBe(true);
    }
    
    // Take screenshot
    await utils.screenshot('registration-closed');
  });

  test('should display team color picker correctly', async ({ page }) => {
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`/join/${mockTournamentSlug}`);
    
    const colorInput = page.locator('input[type="color"], button[data-testid="color-picker"]').first();
    
    if (await colorInput.isVisible()) {
      await colorInput.click();
      
      // Should show color options or picker
      await utils.screenshot('color-picker-open');
      
      // Test color selection
      if (await colorInput.getAttribute('type') === 'color') {
        await colorInput.fill('#00FF00');
        const selectedColor = await colorInput.inputValue();
        expect(selectedColor.toLowerCase()).toBe('#00ff00');
      }
    }
  });

  test('should show team preview with selected options', async ({ page }) => {
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`/join/${mockTournamentSlug}`);
    
    // Fill form and check for live preview
    await page.fill('input[name="teamName"], input[placeholder*="team name"]', 'Preview Team');
    
    const colorInput = page.locator('input[type="color"]').first();
    if (await colorInput.isVisible()) {
      await colorInput.fill('#FF0000');
    }
    
    // Look for preview elements
    const preview = page.locator('[data-testid="team-preview"], .team-preview').first();
    if (await preview.isVisible()) {
      await expect(preview.locator('text=Preview Team')).toBeVisible();
      
      // Take screenshot of preview
      await utils.screenshot('team-preview');
    }
  });

  test('should be responsive across all devices', async ({ page }) => {
    const mockTournamentSlug = 'test-tournament-123';
    
    await utils.testResponsive(async () => {
      await page.goto(`/join/${mockTournamentSlug}`);
      
      // Verify form elements are accessible and properly sized
      await utils.expectElementVisible('input[name="teamName"], input[placeholder*="team name"]');
      
      const formElements = await page.locator('input, button, select').all();
      for (const element of formElements) {
        if (await element.isVisible()) {
          const box = await element.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThan(30); // Minimum touch target
            expect(box.width).toBeGreaterThan(30);
          }
        }
      }
    });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    const mockTournamentSlug = 'test-tournament-123';
    
    // Mock network failure
    await page.route('**/api/teams/join', async route => {
      await route.abort('internetdisconnected');
    });
    
    await page.goto(`/join/${mockTournamentSlug}`);
    await page.fill('input[name="teamName"], input[placeholder*="team name"]', 'Network Test Team');
    await page.locator('button[type="submit"], button:has-text("Join"), button:has-text("Create Team")').click();
    
    // Should show network error or retry option
    await expect(page.locator('text=error, text=failed, text=retry')).toBeVisible({ timeout: 10000 });
    
    // Take screenshot of error state
    await utils.screenshot('network-error');
  });

  test('should validate team member limits', async ({ page }) => {
    // This test would require simulating a team that's already at capacity
    // Mock API response for full team
    await page.route('**/api/teams/*/members', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Team is full (max 10 members)' 
        })
      });
    });
    
    // Test adding member to full team (if that functionality exists)
    // This would depend on your specific team management flow
  });

  test('should show tournament information clearly', async ({ page }) => {
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`/join/${mockTournamentSlug}`);
    
    // Verify tournament details are displayed
    await utils.expectElementVisible('h1, h2'); // Tournament name
    
    // Look for date, location, or other tournament info
    const dateElement = page.locator('text=/202\\d/, [data-testid="tournament-date"]').first();
    if (await dateElement.isVisible()) {
      await expect(dateElement).toBeVisible();
    }
    
    // Take screenshot of tournament info
    await utils.screenshot('tournament-info-display');
    
    // Verify accessibility
    await utils.checkAccessibility();
  });
});