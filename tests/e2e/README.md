# Beer Olympics E2E Testing Suite

This comprehensive End-to-End testing suite uses Playwright to verify all functionality, design, and user experience aspects of the Beer Olympics platform.

## Test Coverage

### 🔐 Authentication (`/auth/`)
- Login/logout flows
- Google OAuth integration
- Session management
- Error handling
- Responsive authentication UI

### 🏆 Tournament Management (`/tournament/`)
- Tournament creation and validation
- Control room functionality
- Registration toggle
- Tournament statistics
- Sharing and join links

### 👥 Team Registration (`/team/`)
- Public tournament joining
- Team creation with validation
- Color and flag selection
- Duplicate name prevention
- Closed registration handling

### ⚽ Scoring & Matches (`/scoring/`)
- Score submission and confirmation
- Dispute handling
- Real-time updates
- Auto-confirmation timeouts
- Bonus scoring features
- Offline score queuing

### 📊 Leaderboard & Display (`/leaderboard/`)
- Real-time leaderboard updates
- TV display mode optimization
- Team statistics and details
- Sorting and filtering
- Public viewing (no auth required)

### 🎨 Design & Responsiveness (`/design/`)
- Consistent branding and typography
- Color system and accessibility
- Mobile, tablet, and desktop layouts
- Animation and interaction states
- Image optimization
- Spacing and layout consistency

### 📱 PWA Functionality (`/pwa/`)
- Manifest validation
- Service worker registration
- Offline functionality
- App installation
- Push notifications
- Background sync
- Update handling

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Specific Test Categories
```bash
# Authentication tests
npx playwright test tests/e2e/auth/

# Tournament tests
npx playwright test tests/e2e/tournament/

# Team registration tests
npx playwright test tests/e2e/team/

# Scoring tests
npx playwright test tests/e2e/scoring/

# Leaderboard tests
npx playwright test tests/e2e/leaderboard/

# Design tests
npx playwright test tests/e2e/design/

# PWA tests
npx playwright test tests/e2e/pwa/
```

### Test Options
```bash
# Run with UI
npm run test:e2e:ui

# Run headed (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/auth/login.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=webkit
npx playwright test --project="Mobile Chrome"
```

## Test Configuration

### Browser Coverage
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)
- **Tablet**: iPad layouts

### Responsive Breakpoints Tested
- **Mobile**: 320px, 375px, 414px
- **Tablet**: 768px, 1024px
- **Desktop**: 1280px, 1440px, 1920px, 2560px

### PWA Features Tested
- ✅ Manifest validation
- ✅ Service worker functionality
- ✅ Offline capabilities
- ✅ Install prompts
- ✅ Push notifications
- ✅ Background sync
- ✅ App shortcuts
- ✅ Share targets

## Test Features

### 📸 Automatic Screenshots
- Screenshots taken at key interaction points
- Full-page screenshots for design verification
- Before/after states for dynamic content
- Multi-viewport screenshots for responsive testing

### 🎯 Design Verification
- Brand consistency checking
- Color contrast validation
- Typography consistency
- Animation performance
- Touch target sizing (44px minimum)

### 🌐 Accessibility Testing
- Proper heading hierarchy
- Alt text validation
- Focus indicator verification
- ARIA label checking
- Keyboard navigation

### 📱 Mobile-First Testing
- Touch-friendly interfaces
- Swipe gesture support
- Portrait/landscape orientation
- Device-specific optimizations

### ⚡ Performance Monitoring
- Page load time validation (<3s)
- Image loading optimization
- Animation performance
- Bundle size impact

## Test Data & Mocking

### Mock Data
Tests use consistent mock data for:
- Tournament slugs: `test-tournament-123`
- User accounts: `Test User <test@example.com>`
- Team names: Predictable test names
- Match IDs: Sequential test identifiers

### API Mocking
- Google OAuth flows
- Tournament API endpoints
- Real-time update events
- Network failure scenarios
- Offline/online state changes

## Debugging Tests

### View Test Reports
```bash
npx playwright show-report
```

### Debug Specific Test
```bash
npx playwright test tests/e2e/auth/login.spec.ts --debug
```

### Screenshots & Videos
- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/` (on failure)
- Traces: `test-results/traces/` (on retry)

## CI/CD Integration

Tests are configured for:
- Parallel execution in CI
- Retry on failure (2x in CI)
- HTML report generation
- Screenshot/video artifacts
- Multi-browser testing

## Test Maintenance

### Adding New Tests
1. Create spec file in appropriate category
2. Use `TestUtils` class for common operations
3. Follow existing naming conventions
4. Include responsive testing
5. Add accessibility checks

### Best Practices
- ✅ Use data-testid attributes for reliable selectors
- ✅ Test user journeys, not just features
- ✅ Include error scenarios
- ✅ Verify design consistency
- ✅ Test offline functionality
- ✅ Mock external dependencies
- ✅ Take meaningful screenshots

## Troubleshooting

### Common Issues
1. **Service worker conflicts**: Clear browser data between tests
2. **Timeout errors**: Increase timeout for slow operations
3. **Flaky tests**: Add proper wait conditions
4. **Screenshot differences**: Update expected screenshots

### Debug Commands
```bash
# Run single test with debug
npx playwright test --debug tests/e2e/auth/login.spec.ts

# Generate new screenshots
npx playwright test --update-snapshots

# Trace viewer
npx playwright show-trace test-results/trace.zip
```

This testing suite ensures the Beer Olympics platform provides an exceptional user experience across all devices, browsers, and usage scenarios.