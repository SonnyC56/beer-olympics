# 🧪 Comprehensive Testing & Deployment Guide

## 📋 Table of Contents
1. [Testing Overview](#testing-overview)
2. [Local Testing](#local-testing)
3. [Automated Testing](#automated-testing)
4. [Manual Testing Checklist](#manual-testing-checklist)
5. [Deployment Instructions](#deployment-instructions)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

## 🧪 Testing Overview

The Beer Olympics app includes comprehensive test coverage across multiple layers:
- **Unit Tests**: Core business logic and services
- **Integration Tests**: API endpoints and service interactions
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Load and stress testing
- **Accessibility Tests**: WCAG compliance

## 🏠 Local Testing

### Prerequisites
```bash
# Ensure all dependencies are installed
npm install

# Set up environment variables
cp .env.example .env
cp .env.redis.example .env.redis

# Initialize local services
npm run init:couchbase
npm run test:redis
```

### Running Tests Locally

#### 1. Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run specific service tests
npm test scheduling-engine.test.ts
npm test swiss-tournament.test.ts
npm test websocket-manager.test.ts

# Run with coverage
npm run test:coverage
```

#### 2. Integration Tests
```bash
# Start required services
npm run dev:api

# In another terminal
npm run test:integration

# Test specific integrations
npm test notifications.test.ts
npm test rsvp-integration.test.ts
```

#### 3. E2E Tests
```bash
# Using Playwright
npm run test:e2e

# Run headed mode for debugging
npm run test:e2e:headed

# Run specific flows
npm run test:e2e -- checkin-flow.spec.ts
npm run test:e2e -- spectator-mode.spec.ts

# Using Puppeteer (legacy)
npm run test:puppeteer
npm run test:puppeteer:headed
```

#### 4. Performance Tests
```bash
# Load test the API
npm run test:load

# Test WebSocket scaling
node scripts/test-websocket-load.js

# Test database performance
npm run test:couchbase
```

### Development Testing Commands
```bash
# Run all tests
npm run test:all

# Watch mode for TDD
npm run test:watch

# UI test runner
npm run test:ui

# Smoke tests only
npm run test:e2e:smoke
```

## 🤖 Automated Testing

### CI/CD Pipeline (.github/workflows/test.yml)
```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
      
      couchbase:
        image: couchbase:community-7.0.0
        ports:
          - 8091:8091
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run typecheck
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          COUCHBASE_URL: localhost
          REDIS_URL: redis://localhost:6379
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## ✅ Manual Testing Checklist

### Core Tournament Features
- [ ] **Tournament Creation**
  - [ ] Create tournament with 20+ capacity
  - [ ] Configure Swiss format
  - [ ] Set up multiple game stations
  - [ ] Define game rules and scoring

- [ ] **RSVP & Check-in**
  - [ ] Complete RSVP form on mobile
  - [ ] Receive confirmation email
  - [ ] Scan QR code at check-in
  - [ ] Test kiosk mode
  - [ ] Verify team auto-assignment

- [ ] **Tournament Execution**
  - [ ] Start tournament from control room
  - [ ] Submit scores on mobile
  - [ ] Test offline score submission
  - [ ] Verify conflict detection
  - [ ] Test match rescheduling

- [ ] **Real-time Features**
  - [ ] Receive push notifications
  - [ ] View live leaderboard updates
  - [ ] Test spectator mode
  - [ ] Verify WebSocket reconnection

### Material Design 3 Testing
- [ ] **Visual Consistency**
  - [ ] Verify MD3 components render correctly
  - [ ] Test dark mode toggle
  - [ ] Check touch target sizes (48dp)
  - [ ] Verify elevation shadows

- [ ] **Theming**
  - [ ] Test Material You color generation
  - [ ] Upload image for theme
  - [ ] Select preset themes
  - [ ] Verify theme persistence

### Mobile Testing
- [ ] **PWA Features**
  - [ ] Install app on home screen
  - [ ] Test offline mode
  - [ ] Verify push notifications
  - [ ] Test background sync

- [ ] **Mobile UX**
  - [ ] One-handed score entry
  - [ ] Swipe gestures
  - [ ] Haptic feedback
  - [ ] Network-aware loading

### Performance Testing
- [ ] Load leaderboard (should be <100ms)
- [ ] Test with 50+ concurrent users
- [ ] Submit scores rapidly
- [ ] Switch between pages quickly

### Accessibility Testing
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast verification
- [ ] Focus indicators

## 🚀 Deployment Instructions

### 1. Pre-Deployment Checklist
```bash
# 1. Run full test suite
npm run test:all

# 2. Build production bundle
npm run build

# 3. Check bundle size
npm run analyze

# 4. Verify environment variables
node scripts/check-env.js
```

### 2. Environment Configuration

Create production environment files:

**.env.production**
```bash
# API Configuration
VITE_API_URL=https://your-domain.com/api
VITE_APP_URL=https://your-domain.com

# Authentication
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-secret
AUTH_SECRET=generate-with-openssl-rand-base64-32

# Database
COUCHBASE_URL=your-couchbase-cluster.com
COUCHBASE_BUCKET=beer-olympics-prod
COUCHBASE_USERNAME=prod-user
COUCHBASE_PASSWORD=prod-password

# Redis
REDIS_URL=redis://your-redis-instance.com:6379
REDIS_PASSWORD=your-redis-password

# Pusher (Real-time)
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=us2

# Cloudinary (Media)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Features
VITE_ENABLE_SCALABLE_WS=true
VITE_ENABLE_OFFLINE_MODE=true
```

### 3. Vercel Deployment

#### Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

#### Configure Vercel Project
```bash
# Set environment variables
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add AUTH_SECRET production
vercel env add COUCHBASE_URL production
vercel env add COUCHBASE_BUCKET production
vercel env add COUCHBASE_USERNAME production
vercel env add COUCHBASE_PASSWORD production
vercel env add REDIS_URL production
vercel env add REDIS_PASSWORD production
vercel env add PUSHER_APP_ID production
vercel env add PUSHER_KEY production
vercel env add PUSHER_SECRET production
vercel env add PUSHER_CLUSTER production
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_SECRET production
```

#### Deploy to Production
```bash
# Deploy to production
vercel --prod

# Or use npm script
npm run deploy
```

### 4. Database Setup

#### Couchbase Indexes
```sql
-- Run these in Couchbase Query Workbench
CREATE PRIMARY INDEX ON `beer-olympics-prod`;

CREATE INDEX idx_tournaments_slug ON `beer-olympics-prod`(slug) 
WHERE type = "tournament";

CREATE INDEX idx_users_email ON `beer-olympics-prod`(email) 
WHERE type = "user";

CREATE INDEX idx_matches_tournament ON `beer-olympics-prod`(tournamentId, status) 
WHERE type = "match";

CREATE INDEX idx_standings_tournament ON `beer-olympics-prod`(tournamentId, points DESC) 
WHERE type = "standing";

CREATE INDEX idx_rsvp_tournament ON `beer-olympics-prod`(tournamentId, status) 
WHERE type = "rsvp";

CREATE INDEX idx_checkin_tournament ON `beer-olympics-prod`(tournamentId, checkedIn) 
WHERE type = "checkin";
```

#### Redis Configuration
```bash
# Connect to Redis
redis-cli -h your-redis-instance.com -p 6379 -a your-redis-password

# Set max memory policy
CONFIG SET maxmemory-policy allkeys-lru

# Enable persistence
CONFIG SET save "900 1 300 10 60 10000"
```

### 5. CDN & Asset Optimization

#### Cloudflare Setup
1. Add your domain to Cloudflare
2. Configure caching rules:
   ```
   /assets/* - Cache for 1 year
   /api/* - No cache
   /*.js - Cache for 1 month
   /*.css - Cache for 1 month
   /sw.js - Cache for 1 hour
   ```
3. Enable Auto Minify for JS/CSS/HTML
4. Set up Page Rules for API bypass

### 6. Monitoring Setup

#### Vercel Analytics
```javascript
// Already configured in vercel.json
{
  "analytics": {
    "enable": true
  }
}
```

#### Custom Monitoring
```bash
# Add monitoring service
vercel env add SENTRY_DSN production
vercel env add LOGFLARE_API_KEY production
```

## 🔍 Post-Deployment Verification

### 1. Smoke Tests
```bash
# Run production smoke tests
ENVIRONMENT=production npm run test:e2e:smoke

# Test critical paths manually
- Create a test tournament
- RSVP as a participant
- Check in using QR code
- Submit a score
- View leaderboard
```

### 2. Performance Verification
```bash
# Run Lighthouse audit
npm run lighthouse https://your-domain.com

# Load test production
npm run test:load:production

# Check WebSocket connections
wscat -c wss://your-domain.com/ws
```

### 3. Health Checks
```bash
# API health
curl https://your-domain.com/api/health

# Database connectivity
curl https://your-domain.com/api/health/db

# Redis connectivity
curl https://your-domain.com/api/health/redis

# WebSocket health
curl https://your-domain.com/api/health/ws
```

### 4. Monitor Logs
```bash
# View Vercel logs
vercel logs --follow

# Check error logs
vercel logs --error
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Google OAuth Not Working
```bash
# Verify redirect URIs in Google Console
https://your-domain.com/api/auth/callback/google

# Check environment variables
vercel env ls production
```

#### 2. WebSocket Connection Issues
```bash
# Test Pusher connection
curl -X POST https://api.pusher.com/apps/YOUR_APP_ID/events \
  -H "Content-Type: application/json" \
  -d '{"name":"test","channels":["test-channel"],"data":"hello"}'

# Check CORS settings
vercel.json should include WebSocket endpoints
```

#### 3. Database Connection Errors
```bash
# Test Couchbase connection
curl -u username:password http://couchbase-url:8091/pools/default

# Verify network connectivity
vercel env pull production
```

#### 4. Redis Connection Issues
```bash
# Test Redis connection
redis-cli -h your-redis-url -p 6379 ping

# Check memory usage
redis-cli -h your-redis-url -p 6379 info memory
```

### Debug Mode
```bash
# Enable debug logging
vercel env add DEBUG "beer-olympics:*" production

# View debug logs
vercel logs --debug
```

### Rollback Procedure
```bash
# List deployments
vercel ls

# Rollback to previous version
vercel rollback [deployment-url]

# Or use alias
vercel alias [old-deployment-url] your-domain.com
```

## 📊 Monitoring Dashboard

Create a monitoring dashboard with:
1. **Uptime monitoring** - Pingdom/UptimeRobot
2. **Error tracking** - Sentry
3. **Performance monitoring** - New Relic/DataDog
4. **Log aggregation** - LogFlare/Papertrail
5. **Analytics** - Vercel Analytics + Google Analytics

## 🎯 Success Criteria

Your deployment is successful when:
- [ ] All health checks pass
- [ ] Lighthouse score > 90
- [ ] Load test handles 100+ concurrent users
- [ ] No errors in production logs
- [ ] OAuth flow works correctly
- [ ] WebSocket connections are stable
- [ ] Mobile PWA installs correctly
- [ ] Offline mode functions properly

## 🚨 Emergency Contacts

Keep these handy for production issues:
- **Vercel Support**: support.vercel.com
- **Couchbase Support**: support.couchbase.com
- **Pusher Status**: status.pusher.com
- **Cloudinary Status**: status.cloudinary.com

---

**Remember to test thoroughly in staging before deploying to production! 🍺🏆**