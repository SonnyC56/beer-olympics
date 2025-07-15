import { test, expect, Page } from '@playwright/test';

test.describe('Check-in and RSVP Flow', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
  });

  test.describe('RSVP Flow', () => {
    test('should allow participants to RSVP for a tournament', async () => {
      // Navigate to tournaments page
      await page.click('[data-testid="nav-tournaments"]');
      
      // Click on upcoming tournament
      await page.click('[data-testid="tournament-card-upcoming"]');
      
      // Click RSVP button
      await page.click('[data-testid="rsvp-button"]');
      
      // Fill out RSVP form
      await page.fill('[data-testid="rsvp-name"]', 'John Doe');
      await page.fill('[data-testid="rsvp-email"]', 'john@example.com');
      await page.fill('[data-testid="rsvp-phone"]', '+1234567890');
      
      // Select team preference
      await page.click('[data-testid="team-preference"]');
      await page.click('[data-testid="team-option-random"]');
      
      // Select dietary restrictions
      await page.check('[data-testid="dietary-vegetarian"]');
      
      // Add emergency contact
      await page.fill('[data-testid="emergency-name"]', 'Jane Doe');
      await page.fill('[data-testid="emergency-phone"]', '+0987654321');
      
      // Submit RSVP
      await page.click('[data-testid="submit-rsvp"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="rsvp-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="rsvp-success"]')).toContainText('RSVP confirmed');
      
      // Verify QR code is displayed
      await expect(page.locator('[data-testid="rsvp-qr-code"]')).toBeVisible();
    });

    test('should validate RSVP form fields', async () => {
      await page.goto('/tournament/upcoming');
      await page.click('[data-testid="rsvp-button"]');
      
      // Try to submit without filling required fields
      await page.click('[data-testid="submit-rsvp"]');
      
      // Check for validation errors
      await expect(page.locator('[data-testid="error-name"]')).toContainText('Name is required');
      await expect(page.locator('[data-testid="error-email"]')).toContainText('Email is required');
      
      // Fill invalid email
      await page.fill('[data-testid="rsvp-email"]', 'invalid-email');
      await page.click('[data-testid="submit-rsvp"]');
      
      await expect(page.locator('[data-testid="error-email"]')).toContainText('Invalid email format');
    });

    test('should handle duplicate RSVP attempts', async () => {
      await page.goto('/tournament/upcoming');
      
      // First RSVP
      await page.click('[data-testid="rsvp-button"]');
      await page.fill('[data-testid="rsvp-name"]', 'John Doe');
      await page.fill('[data-testid="rsvp-email"]', 'john@example.com');
      await page.click('[data-testid="submit-rsvp"]');
      
      // Try to RSVP again with same email
      await page.goto('/tournament/upcoming');
      await page.click('[data-testid="rsvp-button"]');
      await page.fill('[data-testid="rsvp-email"]', 'john@example.com');
      
      // Should show already registered message
      await expect(page.locator('[data-testid="already-registered"]')).toBeVisible();
      await expect(page.locator('[data-testid="view-rsvp-button"]')).toBeVisible();
    });

    test('should allow RSVP cancellation', async () => {
      // Navigate to RSVP management page
      await page.goto('/rsvp/manage/abc123');
      
      // Click cancel RSVP
      await page.click('[data-testid="cancel-rsvp-button"]');
      
      // Confirm cancellation
      await page.click('[data-testid="confirm-cancel"]');
      
      // Verify cancellation success
      await expect(page.locator('[data-testid="cancellation-success"]')).toBeVisible();
    });
  });

  test.describe('Check-in Flow', () => {
    test('should allow organizers to check in participants', async () => {
      // Login as organizer
      await page.goto('/auth/login');
      await page.fill('[data-testid="email"]', 'organizer@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to check-in page
      await page.goto('/tournament/upcoming/checkin');
      
      // Search for participant
      await page.fill('[data-testid="search-participant"]', 'John Doe');
      
      // Click check-in button
      await page.click('[data-testid="checkin-participant-john"]');
      
      // Verify check-in success
      await expect(page.locator('[data-testid="checkin-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="participant-status-john"]')).toContainText('Checked In');
    });

    test('should support QR code check-in', async () => {
      // Login as organizer
      await page.goto('/auth/login');
      await page.fill('[data-testid="email"]', 'organizer@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to QR scanner
      await page.goto('/tournament/upcoming/checkin');
      await page.click('[data-testid="qr-scanner-button"]');
      
      // Mock camera permission
      await page.context().grantPermissions(['camera']);
      
      // Verify scanner is active
      await expect(page.locator('[data-testid="qr-scanner-view"]')).toBeVisible();
      
      // Simulate QR code scan (would need to mock in real test)
      await page.evaluate(() => {
        window.postMessage({ type: 'qr-scanned', data: 'RSVP-12345' }, '*');
      });
      
      // Verify check-in processed
      await expect(page.locator('[data-testid="qr-checkin-success"]')).toBeVisible();
    });

    test('should show check-in statistics', async () => {
      // Login as organizer
      await page.goto('/auth/login');
      await page.fill('[data-testid="email"]', 'organizer@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to check-in dashboard
      await page.goto('/tournament/upcoming/checkin/dashboard');
      
      // Verify statistics are displayed
      await expect(page.locator('[data-testid="total-rsvps"]')).toBeVisible();
      await expect(page.locator('[data-testid="checked-in-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="no-show-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="checkin-percentage"]')).toBeVisible();
      
      // Verify real-time updates
      const initialCount = await page.locator('[data-testid="checked-in-count"]').textContent();
      
      // Simulate check-in from another source
      await page.evaluate(() => {
        window.postMessage({ type: 'checkin-update', count: 1 }, '*');
      });
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      const updatedCount = await page.locator('[data-testid="checked-in-count"]').textContent();
      expect(parseInt(updatedCount || '0')).toBeGreaterThan(parseInt(initialCount || '0'));
    });

    test('should handle late arrivals', async () => {
      // Login as organizer
      await page.goto('/auth/login');
      await page.fill('[data-testid="email"]', 'organizer@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to check-in page
      await page.goto('/tournament/upcoming/checkin');
      
      // Mark participant as late
      await page.click('[data-testid="participant-menu-john"]');
      await page.click('[data-testid="mark-late-arrival"]');
      
      // Add late arrival note
      await page.fill('[data-testid="late-arrival-note"]', 'Traffic delay');
      await page.click('[data-testid="save-late-note"]');
      
      // Verify status update
      await expect(page.locator('[data-testid="participant-status-john"]')).toContainText('Late Arrival');
    });

    test('should support walk-in registrations', async () => {
      // Login as organizer
      await page.goto('/auth/login');
      await page.fill('[data-testid="email"]', 'organizer@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to check-in page
      await page.goto('/tournament/upcoming/checkin');
      
      // Click walk-in registration
      await page.click('[data-testid="walk-in-registration"]');
      
      // Fill walk-in form
      await page.fill('[data-testid="walkin-name"]', 'Walk-in Player');
      await page.fill('[data-testid="walkin-email"]', 'walkin@example.com');
      await page.fill('[data-testid="walkin-phone"]', '+1234567890');
      
      // Select available team
      await page.click('[data-testid="walkin-team-select"]');
      await page.click('[data-testid="team-option-available"]');
      
      // Submit walk-in registration
      await page.click('[data-testid="submit-walkin"]');
      
      // Verify success
      await expect(page.locator('[data-testid="walkin-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="participant-walkin"]')).toContainText('Walk-in Player');
    });
  });

  test.describe('Mobile Check-in Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should work seamlessly on mobile devices', async () => {
      await page.goto('/rsvp/checkin/mobile');
      
      // Show QR code for self check-in
      await page.fill('[data-testid="checkin-code"]', 'RSVP-12345');
      await page.click('[data-testid="display-qr"]');
      
      // Verify QR code is displayed
      await expect(page.locator('[data-testid="checkin-qr"]')).toBeVisible();
      
      // Verify mobile-optimized layout
      await expect(page.locator('[data-testid="mobile-checkin-container"]')).toHaveCSS('padding', '16px');
    });

    test('should support NFC check-in on compatible devices', async () => {
      // Check if NFC is available
      const hasNFC = await page.evaluate(() => 'NDEFReader' in window);
      
      if (hasNFC) {
        await page.goto('/rsvp/checkin/nfc');
        
        // Request NFC permission
        await page.click('[data-testid="enable-nfc"]');
        
        // Simulate NFC tap
        await page.evaluate(() => {
          window.postMessage({ type: 'nfc-read', data: 'RSVP-12345' }, '*');
        });
        
        // Verify check-in
        await expect(page.locator('[data-testid="nfc-checkin-success"]')).toBeVisible();
      }
    });
  });

  test.describe('Team Assignment During Check-in', () => {
    test('should assign teams to participants without preference', async () => {
      // Login as organizer
      await page.goto('/auth/login');
      await page.fill('[data-testid="email"]', 'organizer@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to check-in
      await page.goto('/tournament/upcoming/checkin');
      
      // Find participant without team
      await page.click('[data-testid="participant-no-team"]');
      
      // Auto-assign team
      await page.click('[data-testid="auto-assign-team"]');
      
      // Verify team assignment
      await expect(page.locator('[data-testid="team-assigned-notification"]')).toBeVisible();
      await expect(page.locator('[data-testid="participant-team"]')).not.toBeEmpty();
    });

    test('should balance team assignments', async () => {
      // Login as organizer
      await page.goto('/auth/login');
      await page.fill('[data-testid="email"]', 'organizer@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to team balance view
      await page.goto('/tournament/upcoming/teams/balance');
      
      // Check team sizes
      const teamSizes = await page.locator('[data-testid^="team-size-"]').allTextContents();
      const sizes = teamSizes.map(s => parseInt(s));
      
      // Verify teams are balanced (no more than 1 player difference)
      const maxSize = Math.max(...sizes);
      const minSize = Math.min(...sizes);
      expect(maxSize - minSize).toBeLessThanOrEqual(1);
    });
  });

  test.describe('Check-in Notifications', () => {
    test('should send confirmation when checked in', async () => {
      // Setup notification mock
      await page.addInitScript(() => {
        window.notificationsSent = [];
        window.Notification = class {
          constructor(title: string, options: any) {
            window.notificationsSent.push({ title, ...options });
          }
          static permission = 'granted';
          static requestPermission = async () => 'granted';
        };
      });
      
      await page.goto('/rsvp/checkin/self');
      await page.fill('[data-testid="checkin-code"]', 'RSVP-12345');
      await page.click('[data-testid="self-checkin"]');
      
      // Wait for notification
      await page.waitForTimeout(1000);
      
      // Verify notification was sent
      const notifications = await page.evaluate(() => window.notificationsSent);
      expect(notifications).toContainEqual(
        expect.objectContaining({
          title: expect.stringContaining('Checked In'),
          body: expect.stringContaining('successfully checked in'),
        })
      );
    });

    test('should notify team members when all checked in', async () => {
      // Login as organizer
      await page.goto('/auth/login');
      await page.fill('[data-testid="email"]', 'organizer@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Check in last team member
      await page.goto('/tournament/upcoming/checkin');
      await page.click('[data-testid="checkin-last-member"]');
      
      // Verify team ready notification
      await expect(page.locator('[data-testid="team-ready-notification"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-ready-notification"]')).toContainText('Team Alpha is ready');
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async () => {
      await page.goto('/tournament/upcoming/rsvp');
      
      // Tab through form fields
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="rsvp-name"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="rsvp-email"]')).toBeFocused();
      
      // Fill form with keyboard
      await page.keyboard.type('John Doe');
      await page.keyboard.press('Tab');
      await page.keyboard.type('john@example.com');
      
      // Submit with Enter
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Verify submission
      await expect(page.locator('[data-testid="rsvp-success"]')).toBeVisible();
    });

    test('should have proper ARIA labels', async () => {
      await page.goto('/tournament/upcoming/rsvp');
      
      // Check form accessibility
      await expect(page.locator('[data-testid="rsvp-form"]')).toHaveAttribute('role', 'form');
      await expect(page.locator('[data-testid="rsvp-name"]')).toHaveAttribute('aria-label', 'Your name');
      await expect(page.locator('[data-testid="rsvp-email"]')).toHaveAttribute('aria-label', 'Email address');
      
      // Check error announcements
      await page.click('[data-testid="submit-rsvp"]');
      await expect(page.locator('[data-testid="error-name"]')).toHaveAttribute('role', 'alert');
    });

    test('should work with screen readers', async () => {
      await page.goto('/tournament/upcoming/checkin');
      
      // Check live regions for updates
      await expect(page.locator('[data-testid="checkin-status"]')).toHaveAttribute('aria-live', 'polite');
      await expect(page.locator('[data-testid="checkin-count"]')).toHaveAttribute('aria-live', 'polite');
    });
  });
});