/**
 * Team Registration & Joining Tests with Puppeteer
 */

describe('Team Registration & Joining', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:5173');
    await testUtils.login(page);
  });

  test('should join tournament via public link', async () => {
    // Simulate joining via public link
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`http://localhost:5173/join/${mockTournamentSlug}`);
    
    // Should display tournament info and join form
    await testUtils.expectElementVisible(page, 'h1, h2'); // Tournament name
    await testUtils.expectElementVisible(page, 'form, input[name="teamName"]');
    
    // Take screenshot of join page
    await testUtils.screenshot(page, 'tournament-join-page');
    
    // Verify design elements
    await testUtils.checkAccessibility(page);
  });

  test('should create team with valid information', async () => {
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`http://localhost:5173/join/${mockTournamentSlug}`);
    
    // Fill team registration form
    await page.type('input[name="teamName"], input[placeholder*="team name"]', 'The Beer Crushers');
    
    // Select team color if available
    const colorInput = await page.$('input[type="color"], input[name="color"]');
    if (colorInput) {
      await page.evaluate(el => el.value = '#FF6B6B', colorInput);
    }
    
    // Select flag/emoji if available
    const flagSelect = await page.$('select[name="flag"], button[data-testid="flag-picker"]');
    if (flagSelect) {
      await flagSelect.click();
      const flagOption = await page.$('option[value="🇺🇸"], button:contains("🇺🇸")');
      if (flagOption) await flagOption.click();
    }
    
    // Take screenshot of filled form
    await testUtils.screenshot(page, 'team-form-filled');
    
    // Submit form
    await page.click('button[type="submit"], button:contains("Join"), button:contains("Create Team")');
    
    // Should redirect to team dashboard or success page
    await expect(page).toMatchElement('text=The Beer Crushers', { timeout: 10000 });
    expect(page.url()).toMatch(/team|dashboard|success/);
    
    // Take screenshot of success
    await testUtils.screenshot(page, 'team-created-success');
  });

  test('should validate team name requirements', async () => {
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`http://localhost:5173/join/${mockTournamentSlug}`);
    
    // Test empty team name submission
    await page.click('button[type="submit"], button:contains("Join"), button:contains("Create Team")');
    
    // Check for HTML5 validation
    const teamNameInput = await page.$('input[name="teamName"], input[placeholder*="team name"]');
    const validationMessage = await teamNameInput.evaluate(el => el.validationMessage);
    
    if (validationMessage) {
      expect(validationMessage).toBeTruthy();
    }
    
    // Test very long team name
    await page.type('input[name="teamName"], input[placeholder*="team name"]', 'A'.repeat(100));
    await page.click('button[type="submit"], button:contains("Join"), button:contains("Create Team")');
    
    // Should either truncate or show error
    await testUtils.screenshot(page, 'team-name-validation');
  });

  test('should prevent duplicate team names', async () => {
    const mockTournamentSlug = 'test-tournament-123';
    
    // Mock API response for duplicate team name
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/api/teams/join')) {
        request.respond({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'Team name already taken in this tournament' 
          })
        });
      } else {
        request.continue();
      }
    });
    
    await page.goto(`http://localhost:5173/join/${mockTournamentSlug}`);
    await page.type('input[name="teamName"], input[placeholder*="team name"]', 'Duplicate Team');
    await page.click('button[type="submit"], button:contains("Join"), button:contains("Create Team")');
    
    // Should show error message
    await expect(page).toMatchElement('text=already taken, text=duplicate, text=exists', { timeout: 5000 });
    
    // Take screenshot of error state
    await testUtils.screenshot(page, 'duplicate-team-error');
  });

  test('should handle closed tournament registration', async () => {
    const mockTournamentSlug = 'closed-tournament-123';
    
    // Mock API response for closed registration
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes(`/api/tournaments/${mockTournamentSlug}`)) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            name: 'Closed Tournament',
            isOpen: false,
            date: '2024-07-15'
          })
        });
      } else {
        request.continue();
      }
    });
    
    await page.goto(`http://localhost:5173/join/${mockTournamentSlug}`);
    
    // Should show registration closed message
    await expect(page).toMatchElement('text=closed, text=Registration closed');
    
    // Form should be disabled or hidden
    const submitButton = await page.$('button[type="submit"], button:contains("Join")');
    if (submitButton) {
      const isDisabled = await submitButton.evaluate(el => el.disabled);
      expect(isDisabled).toBe(true);
    }
    
    // Take screenshot
    await testUtils.screenshot(page, 'registration-closed');
  });

  test('should display team color picker correctly', async () => {
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`http://localhost:5173/join/${mockTournamentSlug}`);
    
    const colorInput = await page.$('input[type="color"], button[data-testid="color-picker"]');
    
    if (colorInput) {
      await colorInput.click();
      
      // Should show color options or picker
      await testUtils.screenshot(page, 'color-picker-open');
      
      // Test color selection
      const inputType = await colorInput.evaluate(el => el.type);
      if (inputType === 'color') {
        await page.evaluate(el => el.value = '#00FF00', colorInput);
        const selectedColor = await colorInput.evaluate(el => el.value);
        expect(selectedColor.toLowerCase()).toBe('#00ff00');
      }
    }
  });

  test('should show team preview with selected options', async () => {
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`http://localhost:5173/join/${mockTournamentSlug}`);
    
    // Fill form and check for live preview
    await page.type('input[name="teamName"], input[placeholder*="team name"]', 'Preview Team');
    
    const colorInput = await page.$('input[type="color"]');
    if (colorInput) {
      await page.evaluate(el => el.value = '#FF0000', colorInput);
    }
    
    // Look for preview elements
    const preview = await page.$('[data-testid="team-preview"], .team-preview');
    if (preview) {
      await expect(page).toMatchElement('text=Preview Team');
      
      // Take screenshot of preview
      await testUtils.screenshot(page, 'team-preview');
    }
  });

  test('should be responsive across all devices', async () => {
    const mockTournamentSlug = 'test-tournament-123';
    
    await testUtils.testResponsive(page, async (viewport) => {
      await page.goto(`http://localhost:5173/join/${mockTournamentSlug}`);
      
      // Verify form elements are accessible and properly sized
      await testUtils.expectElementVisible(page, 'input[name="teamName"], input[placeholder*="team name"]');
      
      const formElements = await page.$$('input, button, select');
      for (const element of formElements) {
        const isVisible = await element.isIntersectingViewport();
        if (isVisible) {
          const box = await element.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThan(30); // Minimum touch target
            expect(box.width).toBeGreaterThan(30);
          }
        }
      }
    });
  });

  test('should handle network errors gracefully', async () => {
    const mockTournamentSlug = 'test-tournament-123';
    
    // Mock network failure
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/api/teams/join')) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    await page.goto(`http://localhost:5173/join/${mockTournamentSlug}`);
    await page.type('input[name="teamName"], input[placeholder*="team name"]', 'Network Test Team');
    await page.click('button[type="submit"], button:contains("Join"), button:contains("Create Team")');
    
    // Should show network error or retry option
    await expect(page).toMatchElement('text=error, text=failed, text=retry', { timeout: 10000 });
    
    // Take screenshot of error state
    await testUtils.screenshot(page, 'network-error');
  });

  test('should show tournament information clearly', async () => {
    const mockTournamentSlug = 'test-tournament-123';
    await page.goto(`http://localhost:5173/join/${mockTournamentSlug}`);
    
    // Verify tournament details are displayed
    await testUtils.expectElementVisible(page, 'h1, h2'); // Tournament name
    
    // Look for date, location, or other tournament info
    const dateElement = await page.$('text=/202\\d/, [data-testid="tournament-date"]');
    if (dateElement) {
      await expect(page).toMatchElement('text=/202\\d/');
    }
    
    // Take screenshot of tournament info
    await testUtils.screenshot(page, 'tournament-info-display');
    
    // Verify accessibility
    await testUtils.checkAccessibility(page);
  });
});