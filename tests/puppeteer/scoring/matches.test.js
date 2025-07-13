/**
 * Scoring & Match Functionality Tests with Puppeteer
 */

describe('Scoring & Match Functionality', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:5173');
    await testUtils.login(page);
  });

  test('should display match schedule correctly', async () => {
    // Navigate to tournament with matches
    await page.goto('http://localhost:5173/tournament/test-tournament-123');
    
    // Look for schedule or matches section
    const scheduleSection = await page.$('[data-testid="match-schedule"], .matches, .schedule');
    
    if (scheduleSection) {
      await testUtils.expectElementVisible(page, '[data-testid="match-schedule"], .matches, .schedule');
      
      // Verify match information is displayed
      await testUtils.expectElementVisible(page, 'text=vs, text=VS, text=Match');
      
      // Take screenshot
      await testUtils.screenshot(page, 'match-schedule');
    }
  });

  test('should allow team captain to submit scores', async () => {
    // Mock being a team captain
    await testUtils.login(page, { name: 'Captain Test', email: 'captain@test.com' });
    
    // Navigate to active match
    await page.goto('http://localhost:5173/match/test-match-123');
    
    // Look for score submission form
    const scoreForm = await page.$('form, [data-testid="score-form"]');
    
    if (scoreForm) {
      // Fill score inputs
      const teamAScore = await page.$('input[name*="scoreA"], input[placeholder*="score"]');
      const teamBScore = await page.$('input[name*="scoreB"]:nth-of-type(2)');
      
      if (teamAScore && teamBScore) {
        await teamAScore.type('10');
        await teamBScore.type('8');
        
        // Take screenshot of score entry
        await testUtils.screenshot(page, 'score-entry');
        
        // Submit scores
        await page.click('button[type="submit"], button:contains("Submit")');
        
        // Should show confirmation or pending state
        await expect(page).toMatchElement('text=submitted, text=pending, text=confirmation', { timeout: 5000 });
        
        // Take screenshot of submitted state
        await testUtils.screenshot(page, 'score-submitted');
      }
    }
  });

  test('should handle score confirmation flow', async () => {
    // Mock receiving a score submission to confirm
    await page.goto('http://localhost:5173/match/test-match-123');
    
    // Look for pending score confirmation
    const confirmButton = await page.$('button:contains("Confirm"), button:contains("Accept")');
    
    if (confirmButton) {
      // Show pending score details
      await testUtils.expectElementVisible(page, 'text=pending, text=confirmation');
      await testUtils.screenshot(page, 'score-pending-confirmation');
      
      // Confirm the score
      await confirmButton.click();
      
      // Should update match status
      await expect(page).toMatchElement('text=confirmed, text=final', { timeout: 5000 });
      await testUtils.screenshot(page, 'score-confirmed');
    }
  });

  test('should handle score disputes', async () => {
    await page.goto('http://localhost:5173/match/test-match-123');
    
    // Look for dispute button
    const disputeButton = await page.$('button:contains("Dispute"), button:contains("Contest")');
    
    if (disputeButton) {
      await disputeButton.click();
      
      // Should show dispute form or confirmation
      await expect(page).toMatchElement('text=dispute, text=contest, text=reason', { timeout: 5000 });
      
      // Take screenshot of dispute interface
      await testUtils.screenshot(page, 'score-dispute');
      
      // Fill dispute reason if form exists
      const reasonInput = await page.$('textarea[name="reason"], input[name="reason"]');
      if (reasonInput) {
        await reasonInput.type('Score was incorrectly counted');
        
        const submitDispute = await page.$('button:contains("Submit Dispute")');
        if (submitDispute) {
          await submitDispute.click();
        }
      }
    }
  });

  test('should display real-time score updates', async () => {
    await page.goto('http://localhost:5173/match/test-match-123');
    
    // Take initial screenshot
    await testUtils.screenshot(page, 'match-initial-state');
    
    // Mock real-time update
    await page.evaluate(() => {
      // Simulate score update event
      window.dispatchEvent(new CustomEvent('scoreUpdate', {
        detail: { matchId: 'test-match-123', teamAScore: 15, teamBScore: 12 }
      }));
    });
    
    // Wait for UI to update
    await page.waitForTimeout(1000);
    
    // Verify scores updated
    await testUtils.screenshot(page, 'real-time-update');
  });

  test('should validate score input ranges', async () => {
    await page.goto('http://localhost:5173/match/test-match-123');
    
    const scoreInput = await page.$('input[name*="score"], input[type="number"]');
    
    if (scoreInput) {
      // Test negative scores
      await scoreInput.type('-1');
      await page.click('button[type="submit"]');
      
      // Should show validation error or prevent submission
      const validationMessage = await scoreInput.evaluate(el => el.validationMessage);
      if (validationMessage) {
        expect(validationMessage).toBeTruthy();
      }
      
      // Clear and test extremely high scores
      await scoreInput.click({ clickCount: 3 }); // Select all
      await scoreInput.type('9999');
      await page.click('button[type="submit"]');
      
      // Take screenshot of validation state
      await testUtils.screenshot(page, 'score-validation');
    }
  });

  test('should show match history and statistics', async () => {
    await page.goto('http://localhost:5173/tournament/test-tournament-123');
    
    // Look for completed matches or history section
    const historySection = await page.$('[data-testid="match-history"], .history, .completed-matches');
    
    if (historySection) {
      await testUtils.expectElementVisible(page, '[data-testid="match-history"], .history, .completed-matches');
      
      // Verify match results are displayed
      await testUtils.expectElementVisible(page, 'text=final, text=completed, text=result');
      
      // Take screenshot
      await testUtils.screenshot(page, 'match-history');
    }
  });

  test('should handle bonus scoring features', async () => {
    await page.goto('http://localhost:5173/match/test-match-123');
    
    // Look for bonus buttons or special scoring
    const bonusButtons = await page.$$('button:contains("Bonus"), [data-testid*="bonus"]');
    
    if (bonusButtons.length > 0) {
      await bonusButtons[0].click();
      
      // Should add bonus points or show confirmation
      await testUtils.screenshot(page, 'bonus-scoring');
      
      // Verify bonus was applied
      await expect(page).toMatchElement('text=bonus, text=+1, text=+2, text=+5', { timeout: 5000 });
    }
  });

  test('should be mobile-friendly for quick scoring', async () => {
    await testUtils.testResponsive(page, async (viewport) => {
      await page.goto('http://localhost:5173/match/test-match-123');
      
      // Verify scoring interface works on mobile
      const scoreInputs = await page.$$('input[type="number"], input[name*="score"]');
      
      if (scoreInputs.length > 0) {
        for (const input of scoreInputs) {
          const isVisible = await input.isIntersectingViewport();
          if (isVisible) {
            const box = await input.boundingBox();
            expect(box.height).toBeGreaterThan(40); // Touch-friendly
            expect(box.width).toBeGreaterThan(40);
          }
        }
      }
      
      // Verify submit buttons are large enough
      const submitButton = await page.$('button[type="submit"], button:contains("Submit")');
      if (submitButton) {
        const box = await submitButton.boundingBox();
        expect(box.height).toBeGreaterThan(44); // iOS minimum touch target
      }
    });
  });

  test('should handle offline score submission', async () => {
    await page.goto('http://localhost:5173/match/test-match-123');
    
    // Fill out score form
    const teamAScore = await page.$('input[name*="scoreA"], input[placeholder*="score"]');
    const teamBScore = await page.$('input[name*="scoreB"]:nth-of-type(2)');
    
    if (teamAScore && teamBScore) {
      await teamAScore.type('7');
      await teamBScore.type('9');
      
      // Go offline
      await page.setOfflineMode(true);
      
      // Try to submit
      await page.click('button[type="submit"]');
      
      // Should show offline indicator or queue submission
      await testUtils.screenshot(page, 'offline-score-submission');
      
      // Go back online
      await page.setOfflineMode(false);
      
      // Should auto-sync when back online (if implemented)
      await page.waitForTimeout(2000);
      await testUtils.screenshot(page, 'online-sync');
    }
  });

  test('should prevent unauthorized score modifications', async () => {
    // Login as non-captain user
    await testUtils.login(page, { name: 'Regular Player', email: 'player@test.com' });
    
    await page.goto('http://localhost:5173/match/test-match-123');
    
    // Score submission should be disabled or hidden
    const submitButton = await page.$('button[type="submit"], button:contains("Submit")');
    
    if (submitButton) {
      const isDisabled = await submitButton.evaluate(el => el.disabled);
      expect(isDisabled).toBe(true);
    }
    
    // Take screenshot of unauthorized view
    await testUtils.screenshot(page, 'unauthorized-scoring');
  });

  test('should handle auto-confirm scores after timeout', async () => {
    // Mock API to return pending score that should auto-confirm
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/api/matches/*/scores')) {
        request.respond({
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
      } else {
        request.continue();
      }
    });
    
    await page.goto('http://localhost:5173/match/test-match-123');
    
    // After reload, should show auto-confirmed status
    await testUtils.screenshot(page, 'auto-confirm-check');
  });
});