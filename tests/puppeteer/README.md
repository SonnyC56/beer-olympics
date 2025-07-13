# Beer Olympics Puppeteer Testing Suite

This comprehensive Puppeteer testing suite provides browser automation and E2E testing for the Beer Olympics platform, complementing our Playwright test suite.

## Why Both Puppeteer and Playwright?

- **Puppeteer**: Excellent for Chrome-specific features, advanced debugging, and fine-grained control
- **Playwright**: Superior cross-browser testing and modern features
- **Together**: Complete coverage of all scenarios and testing approaches

## Test Coverage

### 🔐 Authentication (`/auth/`)
- Google OAuth login/logout flows
- Session management and persistence
- Error handling and edge cases
- Responsive authentication interface

### 🏆 Tournament Management (`/tournament/`)
- Tournament creation with validation
- Control room functionality
- Registration management
- Statistics and sharing

### 👥 Team Registration (`/team/`)
- Public tournament joining flows
- Team creation with customization
- Form validation and error handling
- Color/flag selection interface

### ⚽ Scoring & Matches (`/scoring/`)
- Score submission and confirmation
- Real-time update handling
- Dispute management system
- Offline functionality

### 🎨 Design & Performance
- Responsive layout testing
- Image loading verification
- Performance monitoring
- Accessibility validation

## Running Puppeteer Tests

### All Puppeteer Tests
```bash
npm run test:puppeteer
```

### Headed Mode (Visible Browser)
```bash
npm run test:puppeteer:headed
```

### Smoke Tests Only
```bash
npm run test:puppeteer:smoke
```

### Specific Test Files
```bash
# Authentication tests
npx jest --config=jest.config.puppeteer.js tests/puppeteer/auth/

# Tournament tests
npx jest --config=jest.config.puppeteer.js tests/puppeteer/tournament/

# Team registration tests
npx jest --config=jest.config.puppeteer.js tests/puppeteer/team/

# Scoring tests
npx jest --config=jest.config.puppeteer.js tests/puppeteer/scoring/
```

## Test Features

### 📸 Screenshot Capture
- Automatic screenshots at key points
- Full-page screenshots for layout verification
- Timestamped screenshot naming
- Error state documentation

### 🎯 Mock Management
- Google OAuth flow mocking
- API response simulation
- Network condition testing
- Offline/online state handling

### 📱 Responsive Testing
- Multiple viewport testing
- Touch target validation
- Layout reflow verification
- Cross-device compatibility

### 🔍 Debug Capabilities
- Headless/headed mode switching
- DevTools integration
- Slow motion execution
- Request/response monitoring

## Configuration

### Browser Settings
```javascript
// jest-puppeteer.config.js
{
  headless: process.env.CI !== undefined,
  slowMo: process.env.CI ? 0 : 50,
  devtools: !process.env.CI,
  defaultViewport: { width: 1280, height: 720 }
}
```

### Test Environment
- **Headless**: CI environments
- **Headed**: Local development
- **DevTools**: Debug mode enabled
- **SlowMo**: 50ms delay for visibility

## Test Utilities

### `testUtils.waitForAppLoad(page)`
Waits for the application to fully load with proper hydration.

### `testUtils.login(page, user)`
Simulates user authentication with mocked OAuth flow.

### `testUtils.mockGoogleAuth(page, user)`
Sets up Google OAuth mocking for testing authentication.

### `testUtils.screenshot(page, name)`
Captures timestamped screenshots for debugging and verification.

### `testUtils.testResponsive(page, callback)`
Tests functionality across mobile, tablet, and desktop viewports.

### `testUtils.expectElementVisible(page, selector)`
Verifies element visibility with proper styling checks.

### `testUtils.verifyImagesLoad(page)`
Ensures all images load correctly without broken sources.

### `testUtils.checkAccessibility(page)`
Performs basic accessibility validation checks.

### `testUtils.testPWAFeatures(page)`
Validates Progressive Web App functionality and requirements.

## Debugging Tests

### Run with DevTools
```bash
HEADLESS=false npm run test:puppeteer
```

### Debug Specific Test
```bash
npx jest --config=jest.config.puppeteer.js tests/puppeteer/auth/login.test.js --detectOpenHandles
```

### View Screenshots
Screenshots are saved to: `test-results/puppeteer-screenshots/`

### Console Logging
Enable verbose logging:
```bash
DEBUG=puppeteer:* npm run test:puppeteer
```

## Test Data

### Mock Users
```javascript
{ name: 'Test User', email: 'test@example.com' }
{ name: 'Captain Test', email: 'captain@test.com' }
{ name: 'Regular Player', email: 'player@test.com' }
```

### Mock Tournaments
- `test-tournament-123`: Active tournament
- `closed-tournament-123`: Closed registration

### Mock Teams
- `The Beer Crushers`: Standard team
- `Preview Team`: UI preview team
- `Network Test Team`: Error testing

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Puppeteer Tests
  run: npm run test:puppeteer
  env:
    CI: true
```

### Docker Support
```dockerfile
RUN npx puppeteer browsers install chrome
```

## Performance Monitoring

### Load Time Validation
- Page load < 3 seconds
- Time to interactive measurement
- Resource loading optimization

### Memory Usage
- Memory leak detection
- Garbage collection monitoring
- Performance profiling

## Error Handling

### Network Failures
- Request interception
- Offline mode simulation
- Retry mechanisms
- Graceful degradation

### Browser Crashes
- Process monitoring
- Automatic restart
- Error reporting
- State recovery

## Best Practices

### ✅ Test Structure
- Use descriptive test names
- Group related tests in suites
- Follow AAA pattern (Arrange, Act, Assert)
- Clean up resources properly

### ✅ Selectors
- Prefer data-testid attributes
- Use semantic selectors when possible
- Avoid brittle CSS selectors
- Test multiple selector strategies

### ✅ Assertions
- Use meaningful error messages
- Test both positive and negative cases
- Verify visual states with screenshots
- Check for proper error handling

### ✅ Maintenance
- Update selectors when UI changes
- Keep mock data current
- Review and update screenshots
- Monitor test execution times

## Troubleshooting

### Common Issues

1. **Browser Launch Failures**
   ```bash
   npx puppeteer browsers install chrome
   ```

2. **Timeout Errors**
   - Increase timeout values
   - Add proper wait conditions
   - Check for network issues

3. **Flaky Tests**
   - Add explicit waits
   - Use retry mechanisms
   - Improve selector stability

4. **Screenshot Differences**
   - Update expected screenshots
   - Account for font differences
   - Consider viewport variations

### Debug Commands
```bash
# Run with full debugging
DEBUG=puppeteer:* npm run test:puppeteer:headed

# Run single test with debugging
npx jest --config=jest.config.puppeteer.js tests/puppeteer/smoke.test.js --verbose

# Check browser installation
npx puppeteer browsers list
```

This Puppeteer testing suite ensures comprehensive coverage of the Beer Olympics platform with detailed browser automation and visual verification capabilities.