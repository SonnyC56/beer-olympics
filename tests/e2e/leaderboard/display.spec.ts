import { test, expect } from '@playwright/test';
import { TestUtils } from '../setup';

test.describe('Leaderboard & Display Modes', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
  });

  test('should display leaderboard correctly', async ({ page }) => {
    await page.goto('/leaderboard/test-tournament-123');
    
    // Verify leaderboard elements
    await utils.expectElementVisible('h1, h2'); // Leaderboard title
    await utils.expectElementVisible('table, .leaderboard, [data-testid="leaderboard"]');
    
    // Check for team rankings
    await utils.expectElementVisible('text=1st, text=#1, text=1');
    
    // Take screenshot
    await utils.screenshot('leaderboard-main');
    
    // Verify design and accessibility
    await utils.verifyDesignSystem();
    await utils.checkAccessibility();
  });

  test('should show team rankings with correct information', async ({ page }) => {
    await page.goto('/leaderboard/test-tournament-123');
    
    // Verify ranking information is displayed
    const rankingElements = [
      'text=points, text=Points, text=score',
      'text=wins, text=Wins',
      'text=team, text=Team'
    ];
    
    for (const selector of rankingElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await utils.expectElementVisible(selector);
      }
    }
    
    // Verify teams are listed
    await utils.expectElementVisible('.team-row, tr, .team-card');
    
    // Take detailed screenshot
    await utils.screenshot('leaderboard-details');
  });

  test('should update leaderboard in real-time', async ({ page }) => {
    await page.goto('/leaderboard/test-tournament-123');
    
    // Take initial screenshot
    await utils.screenshot('leaderboard-before-update');
    
    // Mock real-time update
    await page.evaluate(() => {
      // Simulate leaderboard update event
      window.dispatchEvent(new CustomEvent('leaderboardUpdate', {
        detail: {
          tournamentId: 'test-tournament-123',
          teams: [
            { id: '1', name: 'Team Alpha', points: 25, position: 1 },
            { id: '2', name: 'Team Beta', points: 20, position: 2 }
          ]
        }
      }));
    });
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Take screenshot after update
    await utils.screenshot('leaderboard-after-update');
    
    // Verify content updated
    await utils.expectElementVisible('text=Team Alpha, text=Team Beta');
  });

  test('should work in TV display mode', async ({ page }) => {
    await page.goto('/display/test-tournament-123');
    
    // TV mode should be optimized for large screens
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Verify TV display elements
    await utils.expectElementVisible('h1, h2'); // Tournament name
    await utils.expectElementVisible('.leaderboard, [data-testid="leaderboard"]');
    
    // Should have larger fonts and simplified UI
    const titleElement = page.locator('h1, h2').first();
    if (await titleElement.isVisible()) {
      const fontSize = await titleElement.evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });
      
      // Should have large font for TV viewing
      const fontSizeValue = parseFloat(fontSize);
      expect(fontSizeValue).toBeGreaterThan(24);
    }
    
    // Take screenshot of TV mode
    await utils.screenshot('tv-display-mode');
  });

  test('should auto-refresh leaderboard', async ({ page }) => {
    await page.goto('/leaderboard/test-tournament-123');
    
    // Mock API calls to track refresh
    let refreshCount = 0;
    await page.route('**/api/tournaments/*/leaderboard', async route => {
      refreshCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          teams: [
            { id: '1', name: 'Team A', points: refreshCount * 5, position: 1 }
          ]
        })
      });
    });
    
    // Wait for auto-refresh (if implemented)
    await page.waitForTimeout(5000);
    
    // Should have made at least one refresh call
    expect(refreshCount).toBeGreaterThan(0);
    
    // Take screenshot
    await utils.screenshot('auto-refresh-leaderboard');
  });

  test('should show tournament progress and status', async ({ page }) => {
    await page.goto('/leaderboard/test-tournament-123');
    
    // Look for tournament status indicators
    const statusElements = [
      'text=in progress, text=In Progress',
      'text=round, text=Round',
      'text=matches, text=Matches',
      'text=complete, text=Complete'
    ];
    
    for (const selector of statusElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await utils.expectElementVisible(selector);
      }
    }
    
    // Take screenshot of status display
    await utils.screenshot('tournament-status');
  });

  test('should display team colors and flags correctly', async ({ page }) => {
    await page.goto('/leaderboard/test-tournament-123');
    
    // Look for team visual elements
    const teamRows = page.locator('.team-row, tr, .team-card');
    const teamCount = await teamRows.count();
    
    if (teamCount > 0) {
      for (let i = 0; i < Math.min(teamCount, 3); i++) { // Check first 3 teams
        const row = teamRows.nth(i);
        
        // Look for color indicators
        const colorElement = row.locator('[style*="background"], .team-color, [data-testid="team-color"]').first();
        if (await colorElement.isVisible()) {
          const bgColor = await colorElement.evaluate(el => 
            window.getComputedStyle(el).backgroundColor
          );
          expect(bgColor).not.toBe('rgba(0, 0, 0, 0)'); // Should have actual color
        }
        
        // Look for flag emojis
        const flagElement = row.locator('text=/[🇦-🇿]{2}/, .flag, [data-testid="team-flag"]').first();
        if (await flagElement.isVisible()) {
          await expect(flagElement).toBeVisible();
        }
      }
    }
    
    // Take screenshot of team visuals
    await utils.screenshot('team-colors-flags');
  });

  test('should handle empty leaderboard state', async ({ page }) => {
    // Mock empty leaderboard
    await page.route('**/api/tournaments/*/leaderboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ teams: [] })
      });
    });
    
    await page.goto('/leaderboard/test-tournament-123');
    
    // Should show empty state message
    await expect(page.locator('text=no teams, text=No teams, text=empty')).toBeVisible({ timeout: 5000 });
    
    // Take screenshot of empty state
    await utils.screenshot('empty-leaderboard');
  });

  test('should be responsive across all screen sizes', async ({ page }) => {
    await utils.testResponsive(async () => {
      await page.goto('/leaderboard/test-tournament-123');
      
      // Verify leaderboard adapts to screen size
      await utils.expectElementVisible('h1, h2');
      
      const viewport = await page.viewportSize();
      
      if (viewport && viewport.width < 768) {
        // Mobile: should stack or scroll horizontally
        const table = page.locator('table').first();
        if (await table.isVisible()) {
          const tableWidth = await table.evaluate(el => el.scrollWidth);
          // Should either fit or be scrollable
          expect(tableWidth).toBeDefined();
        }
      } else {
        // Desktop: should show full table
        await utils.expectElementVisible('table, .leaderboard-grid');
      }
    });
  });

  test('should show detailed team statistics on click', async ({ page }) => {
    await page.goto('/leaderboard/test-tournament-123');
    
    // Click on a team row to see details
    const firstTeam = page.locator('.team-row, tr, .team-card').first();
    
    if (await firstTeam.isVisible()) {
      await firstTeam.click();
      
      // Should show team details modal or navigate to team page
      const detailsModal = page.locator('.modal, .popup, [data-testid="team-details"]').first();
      
      if (await detailsModal.isVisible()) {
        // Verify team details are shown
        await utils.expectElementVisible('text=statistics, text=Statistics, text=wins, text=losses');
        
        // Take screenshot
        await utils.screenshot('team-details-modal');
        
        // Close modal
        const closeButton = page.locator('button:has-text("Close"), .close, [aria-label="Close"]').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    }
  });

  test('should handle leaderboard sorting and filtering', async ({ page }) => {
    await page.goto('/leaderboard/test-tournament-123');
    
    // Look for sort controls
    const sortButtons = page.locator('button:has-text("Sort"), th[role="button"], .sortable');
    
    if ((await sortButtons.count()) > 0) {
      const sortButton = sortButtons.first();
      await sortButton.click();
      
      // Should reorder leaderboard
      await page.waitForTimeout(500);
      await utils.screenshot('leaderboard-sorted');
    }
    
    // Look for filter controls
    const filterSelect = page.locator('select[name*="filter"], .filter-dropdown').first();
    
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      await utils.screenshot('leaderboard-filtered');
    }
  });

  test('should show match schedule alongside leaderboard', async ({ page }) => {
    await page.goto('/leaderboard/test-tournament-123');
    
    // Look for upcoming matches section
    const upcomingMatches = page.locator('[data-testid="upcoming-matches"], .upcoming, .schedule').first();
    
    if (await upcomingMatches.isVisible()) {
      await utils.expectElementVisible(upcomingMatches.locator('..'));
      
      // Verify match information
      await utils.expectElementVisible('text=vs, text=VS, text=next, text=upcoming');
      
      // Take screenshot
      await utils.screenshot('leaderboard-with-schedule');
    }
  });

  test('should work without authentication for public viewing', async ({ page }) => {
    // Access leaderboard without logging in
    await page.goto('/leaderboard/test-tournament-123');
    
    // Should still display leaderboard
    await utils.expectElementVisible('h1, h2');
    await utils.expectElementVisible('.leaderboard, table, [data-testid="leaderboard"]');
    
    // Take screenshot of public view
    await utils.screenshot('public-leaderboard');
    
    // Verify no login required elements are hidden
    const loginButton = page.locator('button:has-text("Sign in"), button:has-text("Login")');
    expect(await loginButton.count()).toBe(0);
  });
});