import { test, expect, Page } from '@playwright/test';

test.describe('Spectator Mode', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
  });

  test.describe('Public View', () => {
    test('should access spectator mode without authentication', async () => {
      // Navigate to active tournament
      await page.goto('/tournament/active/spectator');
      
      // Verify spectator view is accessible
      await expect(page.locator('[data-testid="spectator-view"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-prompt"]')).not.toBeVisible();
      
      // Check main components are visible
      await expect(page.locator('[data-testid="live-leaderboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-matches"]')).toBeVisible();
      await expect(page.locator('[data-testid="upcoming-matches"]')).toBeVisible();
    });

    test('should display tournament information', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Check tournament header
      await expect(page.locator('[data-testid="tournament-name"]')).toContainText('Summer Beer Olympics 2024');
      await expect(page.locator('[data-testid="tournament-status"]')).toContainText('In Progress');
      await expect(page.locator('[data-testid="tournament-round"]')).toContainText('Round 3 of 5');
    });

    test('should show QR code for easy sharing', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Click share button
      await page.click('[data-testid="share-spectator-link"]');
      
      // Verify QR code modal
      await expect(page.locator('[data-testid="share-qr-code"]')).toBeVisible();
      await expect(page.locator('[data-testid="share-url"]')).toContainText('/tournament/active/spectator');
      
      // Test copy to clipboard
      await page.click('[data-testid="copy-link-button"]');
      await expect(page.locator('[data-testid="copy-success"]')).toBeVisible();
    });
  });

  test.describe('Live Updates', () => {
    test('should receive real-time score updates', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Get initial score
      const initialScore = await page.locator('[data-testid="team-alpha-score"]').textContent();
      
      // Simulate WebSocket message for score update
      await page.evaluate(() => {
        window.postMessage({
          type: 'ws-message',
          data: {
            type: 'score-update',
            matchId: 'match-1',
            teamId: 'team-alpha',
            score: parseInt(initialScore || '0') + 10
          }
        }, '*');
      });
      
      // Wait for update
      await page.waitForTimeout(500);
      
      // Verify score updated
      const updatedScore = await page.locator('[data-testid="team-alpha-score"]').textContent();
      expect(parseInt(updatedScore || '0')).toBeGreaterThan(parseInt(initialScore || '0'));
      
      // Check update animation
      await expect(page.locator('[data-testid="team-alpha-score"]')).toHaveClass(/score-updated/);
    });

    test('should update leaderboard positions in real-time', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Record initial positions
      const team1Position = await page.locator('[data-testid="team-1-position"]').textContent();
      const team2Position = await page.locator('[data-testid="team-2-position"]').textContent();
      
      // Simulate leaderboard change
      await page.evaluate(() => {
        window.postMessage({
          type: 'ws-message',
          data: {
            type: 'leaderboard-update',
            changes: [
              { teamId: 'team-1', oldPosition: 2, newPosition: 1 },
              { teamId: 'team-2', oldPosition: 1, newPosition: 2 }
            ]
          }
        }, '*');
      });
      
      // Wait for animation
      await page.waitForTimeout(1000);
      
      // Verify positions changed
      await expect(page.locator('[data-testid="team-1-position"]')).toContainText('1');
      await expect(page.locator('[data-testid="team-2-position"]')).toContainText('2');
      
      // Check transition animation occurred
      await expect(page.locator('[data-testid="team-1-row"]')).toHaveClass(/position-improved/);
      await expect(page.locator('[data-testid="team-2-row"]')).toHaveClass(/position-dropped/);
    });

    test('should show match status updates', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Simulate match start
      await page.evaluate(() => {
        window.postMessage({
          type: 'ws-message',
          data: {
            type: 'match-status',
            matchId: 'match-upcoming-1',
            status: 'in-progress',
            teams: ['Team Alpha', 'Team Beta'],
            game: 'Beer Pong'
          }
        }, '*');
      });
      
      // Verify match moved from upcoming to current
      await expect(page.locator('[data-testid="current-match-1"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-match-1"]')).toContainText('Team Alpha vs Team Beta');
      await expect(page.locator('[data-testid="match-status-1"]')).toContainText('In Progress');
      
      // Simulate match completion
      await page.evaluate(() => {
        window.postMessage({
          type: 'ws-message',
          data: {
            type: 'match-complete',
            matchId: 'match-1',
            winner: 'Team Alpha',
            finalScore: { teamAlpha: 10, teamBeta: 6 }
          }
        }, '*');
      });
      
      // Verify match completion
      await expect(page.locator('[data-testid="completed-match-1"]')).toBeVisible();
      await expect(page.locator('[data-testid="match-winner-1"]')).toContainText('Team Alpha');
    });

    test('should display live notifications', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Simulate achievement notification
      await page.evaluate(() => {
        window.postMessage({
          type: 'ws-message',
          data: {
            type: 'achievement',
            player: 'John Doe',
            achievement: 'Perfect Game',
            description: 'Won without missing a shot!'
          }
        }, '*');
      });
      
      // Verify notification appears
      await expect(page.locator('[data-testid="live-notification"]')).toBeVisible();
      await expect(page.locator('[data-testid="live-notification"]')).toContainText('John Doe earned Perfect Game');
      
      // Wait for auto-dismiss
      await page.waitForTimeout(5000);
      await expect(page.locator('[data-testid="live-notification"]')).not.toBeVisible();
    });
  });

  test.describe('Interactive Features', () => {
    test('should allow spectators to predict winners', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Click on upcoming match
      await page.click('[data-testid="upcoming-match-1"]');
      
      // Make prediction
      await page.click('[data-testid="predict-team-alpha"]');
      
      // Verify prediction recorded
      await expect(page.locator('[data-testid="prediction-confirmed"]')).toBeVisible();
      await expect(page.locator('[data-testid="your-prediction"]')).toContainText('Team Alpha');
      
      // Show prediction statistics
      await expect(page.locator('[data-testid="prediction-stats"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-alpha-predictions"]')).toContainText('%');
    });

    test('should display live polls', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Simulate poll creation
      await page.evaluate(() => {
        window.postMessage({
          type: 'ws-message',
          data: {
            type: 'poll',
            question: 'Who will win the tournament?',
            options: ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta']
          }
        }, '*');
      });
      
      // Verify poll appears
      await expect(page.locator('[data-testid="live-poll"]')).toBeVisible();
      await expect(page.locator('[data-testid="poll-question"]')).toContainText('Who will win the tournament?');
      
      // Vote in poll
      await page.click('[data-testid="poll-option-team-alpha"]');
      
      // Verify vote recorded
      await expect(page.locator('[data-testid="poll-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-alpha-votes"]')).toBeVisible();
    });

    test('should show match timeline', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Click on active match
      await page.click('[data-testid="current-match-1"]');
      
      // Verify timeline view
      await expect(page.locator('[data-testid="match-timeline"]')).toBeVisible();
      
      // Check timeline events
      await expect(page.locator('[data-testid="timeline-event-start"]')).toBeVisible();
      await expect(page.locator('[data-testid="timeline-event-score"]')).toBeVisible();
      
      // Simulate new timeline event
      await page.evaluate(() => {
        window.postMessage({
          type: 'ws-message',
          data: {
            type: 'timeline-event',
            matchId: 'match-1',
            event: {
              type: 'spectacular-play',
              team: 'Team Alpha',
              player: 'John Doe',
              description: 'Amazing trick shot!'
            }
          }
        }, '*');
      });
      
      // Verify new event appears
      await expect(page.locator('[data-testid="timeline-event-spectacular"]')).toBeVisible();
    });
  });

  test.describe('Mobile Spectator Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should have mobile-optimized layout', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Check mobile layout
      await expect(page.locator('[data-testid="mobile-spectator-view"]')).toBeVisible();
      
      // Verify swipeable views
      await expect(page.locator('[data-testid="view-tabs"]')).toBeVisible();
      
      // Test tab navigation
      await page.click('[data-testid="tab-leaderboard"]');
      await expect(page.locator('[data-testid="leaderboard-view"]')).toBeVisible();
      
      await page.click('[data-testid="tab-matches"]');
      await expect(page.locator('[data-testid="matches-view"]')).toBeVisible();
    });

    test('should support swipe gestures', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Simulate swipe left
      await page.locator('[data-testid="swipeable-container"]').evaluate(el => {
        const touch = new Touch({
          identifier: 0,
          target: el,
          clientX: 300,
          clientY: 200
        });
        
        el.dispatchEvent(new TouchEvent('touchstart', {
          touches: [touch],
          targetTouches: [touch],
          changedTouches: [touch]
        }));
        
        const moveTouch = new Touch({
          identifier: 0,
          target: el,
          clientX: 50,
          clientY: 200
        });
        
        el.dispatchEvent(new TouchEvent('touchmove', {
          touches: [moveTouch],
          targetTouches: [moveTouch],
          changedTouches: [moveTouch]
        }));
        
        el.dispatchEvent(new TouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [moveTouch]
        }));
      });
      
      // Verify view changed
      await expect(page.locator('[data-testid="matches-view"]')).toBeVisible();
    });
  });

  test.describe('Statistics and Analytics', () => {
    test('should display tournament statistics', async () => {
      await page.goto('/tournament/active/spectator/stats');
      
      // Check statistics sections
      await expect(page.locator('[data-testid="total-matches-played"]')).toBeVisible();
      await expect(page.locator('[data-testid="average-match-duration"]')).toBeVisible();
      await expect(page.locator('[data-testid="highest-scoring-team"]')).toBeVisible();
      await expect(page.locator('[data-testid="closest-match"]')).toBeVisible();
      
      // Verify charts
      await expect(page.locator('[data-testid="score-distribution-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="win-rate-chart"]')).toBeVisible();
    });

    test('should show player performance stats', async () => {
      await page.goto('/tournament/active/spectator/stats');
      
      // Click on player stats tab
      await page.click('[data-testid="tab-player-stats"]');
      
      // Check player leaderboards
      await expect(page.locator('[data-testid="top-scorers"]')).toBeVisible();
      await expect(page.locator('[data-testid="mvp-candidates"]')).toBeVisible();
      await expect(page.locator('[data-testid="best-win-rate"]')).toBeVisible();
      
      // Click on specific player
      await page.click('[data-testid="player-john-doe"]');
      
      // Verify player details
      await expect(page.locator('[data-testid="player-stats-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="player-matches-played"]')).toBeVisible();
      await expect(page.locator('[data-testid="player-win-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="player-avg-score"]')).toBeVisible();
    });
  });

  test.describe('Multi-Language Support', () => {
    test('should switch languages', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Open language selector
      await page.click('[data-testid="language-selector"]');
      
      // Select Spanish
      await page.click('[data-testid="language-es"]');
      
      // Verify content changed
      await expect(page.locator('[data-testid="tournament-status"]')).toContainText('En Progreso');
      await expect(page.locator('[data-testid="live-leaderboard"] h2')).toContainText('Tabla de Posiciones');
    });

    test('should persist language preference', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Change language
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-testid="language-fr"]');
      
      // Reload page
      await page.reload();
      
      // Verify language persisted
      await expect(page.locator('[data-testid="tournament-status"]')).toContainText('En Cours');
    });
  });

  test.describe('Social Features', () => {
    test('should allow spectators to react to plays', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Simulate exciting play
      await page.evaluate(() => {
        window.postMessage({
          type: 'ws-message',
          data: {
            type: 'exciting-play',
            matchId: 'match-1',
            description: 'Incredible comeback!'
          }
        }, '*');
      });
      
      // React to play
      await page.click('[data-testid="reaction-fire"]');
      
      // Verify reaction recorded
      await expect(page.locator('[data-testid="reaction-count"]')).toBeVisible();
      
      // See other reactions
      await expect(page.locator('[data-testid="reaction-animation"]')).toBeVisible();
    });

    test('should display live chat for spectators', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Open chat
      await page.click('[data-testid="toggle-chat"]');
      
      // Verify chat panel
      await expect(page.locator('[data-testid="spectator-chat"]')).toBeVisible();
      
      // Send message
      await page.fill('[data-testid="chat-input"]', 'Go Team Alpha!');
      await page.keyboard.press('Enter');
      
      // Verify message appears
      await expect(page.locator('[data-testid="chat-message-own"]')).toContainText('Go Team Alpha!');
      
      // Simulate incoming message
      await page.evaluate(() => {
        window.postMessage({
          type: 'ws-message',
          data: {
            type: 'chat-message',
            user: 'Spectator123',
            message: 'Great match!',
            timestamp: new Date().toISOString()
          }
        }, '*');
      });
      
      // Verify incoming message
      await expect(page.locator('[data-testid="chat-message-other"]')).toContainText('Great match!');
    });
  });

  test.describe('Performance', () => {
    test('should handle high-frequency updates', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Simulate rapid score updates
      for (let i = 0; i < 20; i++) {
        await page.evaluate((score) => {
          window.postMessage({
            type: 'ws-message',
            data: {
              type: 'score-update',
              matchId: 'match-1',
              teamId: 'team-alpha',
              score: score
            }
          }, '*');
        }, i);
        
        await page.waitForTimeout(100);
      }
      
      // Verify page remains responsive
      await page.click('[data-testid="tab-stats"]');
      await expect(page.locator('[data-testid="stats-view"]')).toBeVisible();
      
      // Check final score is correct
      await expect(page.locator('[data-testid="team-alpha-score"]')).toContainText('19');
    });

    test('should lazy load images', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Scroll to team photos section
      await page.locator('[data-testid="team-photos-section"]').scrollIntoViewIfNeeded();
      
      // Verify images are loading
      const images = page.locator('[data-testid^="team-photo-"]');
      const count = await images.count();
      
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        await expect(img).toHaveAttribute('loading', 'lazy');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should announce live updates to screen readers', async () => {
      await page.goto('/tournament/active/spectator');
      
      // Check ARIA live regions
      await expect(page.locator('[data-testid="score-updates"]')).toHaveAttribute('aria-live', 'polite');
      await expect(page.locator('[data-testid="match-status"]')).toHaveAttribute('aria-live', 'polite');
      await expect(page.locator('[data-testid="notifications"]')).toHaveAttribute('aria-live', 'assertive');
    });

    test('should support reduced motion preference', async () => {
      // Enable reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.goto('/tournament/active/spectator');
      
      // Simulate leaderboard change
      await page.evaluate(() => {
        window.postMessage({
          type: 'ws-message',
          data: {
            type: 'leaderboard-update',
            changes: [{ teamId: 'team-1', oldPosition: 2, newPosition: 1 }]
          }
        }, '*');
      });
      
      // Verify no animation classes applied
      await expect(page.locator('[data-testid="team-1-row"]')).not.toHaveClass(/animate/);
    });
  });
});