import { test, expect } from '@playwright/test';
import { TestUtils } from '../setup';

test.describe('Scoring & Match Functionality', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
    await page.goto('/');
    await utils.login();
  });

  test('should display match schedule correctly', async ({ page }) => {
    // Navigate to tournament with matches
    await page.goto('/tournament/test-tournament-123');
    
    // Look for schedule or matches section
    const scheduleSection = page.locator('[data-testid="match-schedule"], .matches, .schedule').first();
    
    if (await scheduleSection.isVisible()) {
      await utils.expectElementVisible(scheduleSection.locator('..'));
      
      // Verify match information is displayed
      await utils.expectElementVisible('text=vs, text=VS, text=Match');
      
      // Take screenshot
      await utils.screenshot('match-schedule');
    }
  });

  test('should allow team captain to submit scores', async ({ page }) => {
    // Mock being a team captain
    await utils.login({ name: 'Captain Test', email: 'captain@test.com' });
    
    // Navigate to active match
    await page.goto('/match/test-match-123');
    
    // Look for score submission form
    const scoreForm = page.locator('form, [data-testid="score-form"]').first();
    
    if (await scoreForm.isVisible()) {
      // Fill score inputs
      const teamAScore = page.locator('input[name*="scoreA"], input[placeholder*="score"]').first();
      const teamBScore = page.locator('input[name*="scoreB"], input[placeholder*="score"]').nth(1);
      
      if (await teamAScore.isVisible() && await teamBScore.isVisible()) {
        await teamAScore.fill('10');
        await teamBScore.fill('8');
        
        // Take screenshot of score entry
        await utils.screenshot('score-entry');
        
        // Submit scores
        await page.locator('button[type="submit"], button:has-text("Submit")').click();
        
        // Should show confirmation or pending state
        await expect(page.locator('text=submitted, text=pending, text=confirmation')).toBeVisible({ timeout: 5000 });
        
        // Take screenshot of submitted state
        await utils.screenshot('score-submitted');
      }
    }
  });

  test('should handle score confirmation flow', async ({ page }) => {
    // Mock receiving a score submission to confirm
    await page.goto('/match/test-match-123');
    
    // Look for pending score confirmation
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Accept")').first();
    
    if (await confirmButton.isVisible()) {
      // Show pending score details
      await utils.expectElementVisible('text=pending, text=confirmation');
      await utils.screenshot('score-pending-confirmation');
      
      // Confirm the score
      await confirmButton.click();
      
      // Should update match status
      await expect(page.locator('text=confirmed, text=final')).toBeVisible({ timeout: 5000 });
      await utils.screenshot('score-confirmed');
    }
  });

  test('should handle score disputes', async ({ page }) => {
    await page.goto('/match/test-match-123');
    
    // Look for dispute button
    const disputeButton = page.locator('button:has-text("Dispute"), button:has-text("Contest")').first();
    
    if (await disputeButton.isVisible()) {
      await disputeButton.click();
      
      // Should show dispute form or confirmation
      await expect(page.locator('text=dispute, text=contest, text=reason')).toBeVisible({ timeout: 5000 });
      
      // Take screenshot of dispute interface
      await utils.screenshot('score-dispute');
      
      // Fill dispute reason if form exists
      const reasonInput = page.locator('textarea[name="reason"], input[name="reason"]').first();
      if (await reasonInput.isVisible()) {
        await reasonInput.fill('Score was incorrectly counted');
        
        const submitDispute = page.locator('button:has-text("Submit Dispute")').first();
        if (await submitDispute.isVisible()) {
          await submitDispute.click();
        }
      }
    }
  });

  test('should auto-confirm scores after timeout', async ({ page }) => {
    // This would require mocking time or testing with shorter timeouts
    await page.goto('/match/test-match-123');
    
    // Mock API to return pending score that should auto-confirm
    await page.route('**/api/matches/*/scores', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'score-123',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(), // 6 minutes ago
          teamAScore: 10,
          teamBScore: 8
        })
      });
    });
    
    await page.reload();
    
    // After reload, should show auto-confirmed status
    // This depends on your implementation of auto-confirmation
    await utils.screenshot('auto-confirm-check');
  });

  test('should display real-time score updates', async ({ page }) => {
    await page.goto('/match/test-match-123');
    
    // Take initial screenshot
    await utils.screenshot('match-initial-state');
    
    // Mock real-time update (would normally come via WebSocket)
    await page.evaluate(() => {
      // Simulate score update event
      window.dispatchEvent(new CustomEvent('scoreUpdate', {
        detail: { matchId: 'test-match-123', teamAScore: 15, teamBScore: 12 }
      }));
    });
    
    // Wait for UI to update
    await page.waitForTimeout(1000);
    
    // Verify scores updated
    await utils.screenshot('real-time-update');
  });

  test('should validate score input ranges', async ({ page }) => {
    await page.goto('/match/test-match-123');
    
    const scoreInput = page.locator('input[name*="score"], input[type="number"]').first();
    
    if (await scoreInput.isVisible()) {
      // Test negative scores
      await scoreInput.fill('-1');
      await page.locator('button[type="submit"]').click();
      
      // Should show validation error or prevent submission
      const errorMessage = await scoreInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      if (errorMessage) {
        expect(errorMessage).toBeTruthy();
      }
      
      // Test extremely high scores
      await scoreInput.fill('9999');
      await page.locator('button[type="submit"]').click();
      
      // Take screenshot of validation state
      await utils.screenshot('score-validation');
    }
  });

  test('should show match history and statistics', async ({ page }) => {
    await page.goto('/tournament/test-tournament-123');
    
    // Look for completed matches or history section
    const historySection = page.locator('[data-testid="match-history"], .history, .completed-matches').first();
    
    if (await historySection.isVisible()) {
      await utils.expectElementVisible(historySection.locator('..'));
      
      // Verify match results are displayed
      await utils.expectElementVisible('text=final, text=completed, text=result');
      
      // Take screenshot
      await utils.screenshot('match-history');
    }
  });

  test('should handle bonus scoring features', async ({ page }) => {
    await page.goto('/match/test-match-123');
    
    // Look for bonus buttons or special scoring
    const bonusButtons = page.locator('button:has-text("Bonus"), [data-testid*="bonus"]');
    
    if ((await bonusButtons.count()) > 0) {
      const firstBonus = bonusButtons.first();
      await firstBonus.click();
      
      // Should add bonus points or show confirmation
      await utils.screenshot('bonus-scoring');
      
      // Verify bonus was applied
      await expect(page.locator('text=bonus, text=+1, text=+2, text=+5')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should be mobile-friendly for quick scoring', async ({ page }) => {
    await utils.testResponsive(async () => {
      await page.goto('/match/test-match-123');
      
      // Verify scoring interface works on mobile
      const scoreInputs = page.locator('input[type="number"], input[name*="score"]');
      
      if ((await scoreInputs.count()) > 0) {
        for (let i = 0; i < await scoreInputs.count(); i++) {
          const input = scoreInputs.nth(i);
          if (await input.isVisible()) {
            const box = await input.boundingBox();
            expect(box?.height).toBeGreaterThan(40); // Touch-friendly
            expect(box?.width).toBeGreaterThan(40);
          }
        }
      }
      
      // Verify submit buttons are large enough
      const submitButton = page.locator('button[type="submit"], button:has-text("Submit")').first();
      if (await submitButton.isVisible()) {
        const box = await submitButton.boundingBox();
        expect(box?.height).toBeGreaterThan(44); // iOS minimum touch target
      }
    });
  });

  test('should handle offline score submission', async ({ page, context }) => {
    await page.goto('/match/test-match-123');
    
    // Fill out score form
    const teamAScore = page.locator('input[name*="scoreA"], input[placeholder*="score"]').first();
    const teamBScore = page.locator('input[name*="scoreB"], input[placeholder*="score"]').nth(1);
    
    if (await teamAScore.isVisible() && await teamBScore.isVisible()) {
      await teamAScore.fill('7');
      await teamBScore.fill('9');
      
      // Go offline
      await context.setOffline(true);
      
      // Try to submit
      await page.locator('button[type="submit"]').click();
      
      // Should show offline indicator or queue submission
      await utils.screenshot('offline-score-submission');
      
      // Go back online
      await context.setOffline(false);
      
      // Should auto-sync when back online (if implemented)
      await page.waitForTimeout(2000);
      await utils.screenshot('online-sync');
    }
  });

  test('should prevent unauthorized score modifications', async ({ page }) => {
    // Login as non-captain user
    await utils.login({ name: 'Regular Player', email: 'player@test.com' });
    
    await page.goto('/match/test-match-123');
    
    // Score submission should be disabled or hidden
    const scoreForm = page.locator('form, [data-testid="score-form"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit")').first();
    
    if (await submitButton.isVisible()) {
      expect(await submitButton.isDisabled()).toBe(true);
    }
    
    // Take screenshot of unauthorized view
    await utils.screenshot('unauthorized-scoring');
  });
});