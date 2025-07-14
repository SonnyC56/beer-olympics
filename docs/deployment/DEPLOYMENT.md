# 🚀 Beer Olympics Deployment Guide

## Overview

This guide covers the complete deployment process for the Beer Olympics application, including all integrated components and enhanced features.

## 📋 Prerequisites

### Required Services
- **Vercel Account** (for hosting)
- **Supabase Project** (for database)
- **Google OAuth App** (for authentication)
- **Pusher Account** (for real-time features) - Optional
- **Custom Domain** (optional but recommended)

### Development Tools
- Node.js 18+
- npm or yarn
- Git
- Vercel CLI (optional)

## 🔧 Environment Configuration

### Environment Variables

Create the following environment files:

#### `.env.local` (Development)
```bash
# Database
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication  
VITE_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Real-time (Optional)
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=your_pusher_cluster
VITE_PUSHER_SECRET=your_pusher_secret
VITE_ENABLE_REALTIME=true

# Push Notifications (Optional)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Application
VITE_APP_URL=http://localhost:5173
NEXTAUTH_URL=http://localhost:5173
NEXTAUTH_SECRET=your_nextauth_secret
```

#### Production Environment (Vercel)
Set the same variables in Vercel dashboard with production values.

## 🏗️ Database Setup

### Supabase Configuration

1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   ```

2. **Run Database Migrations**
   ```bash
   # Apply database schema
   supabase db push
   
   # Seed with sample data (optional)
   supabase db seed
   ```

3. **Configure Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
   ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   
   -- Create policies (see supabase/migrations for full policies)
   ```

### Database Schema

The database includes the following enhanced tables:

- `tournaments` - Tournament configurations with enhanced formats
- `teams` - Team profiles with social features  
- `matches` - Match data with enhanced scoring
- `players` - Player profiles and statistics
- `team_invites` - QR code invite system
- `push_subscriptions` - Push notification subscriptions
- `rsvp_data` - Event RSVP information

## 🔐 Authentication Setup

### Google OAuth Configuration

1. **Create Google OAuth App**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials

2. **Configure Redirect URLs**
   ```
   Development: http://localhost:5173/api/auth/callback/google
   Production: https://yourdomain.com/api/auth/callback/google
   ```

3. **Update Environment Variables**
   ```bash
   VITE_GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

## 🌐 Real-time Features Setup

### Pusher Configuration (Optional)

1. **Create Pusher App**
   - Sign up at [Pusher.com](https://pusher.com)
   - Create new app
   - Get credentials

2. **Environment Configuration**
   ```bash
   VITE_PUSHER_KEY=your_app_key
   VITE_PUSHER_CLUSTER=your_cluster
   VITE_PUSHER_SECRET=your_secret
   ```

### WebSocket Fallback

If Pusher is not configured, the app automatically falls back to:
- WebSocket connections (if `VITE_WS_URL` is provided)
- Mock real-time service (for offline functionality)

## 📱 Push Notifications Setup

### VAPID Keys Generation

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys

# Add to environment variables
VITE_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### Service Worker Configuration

The service worker (`public/sw.js`) is automatically registered and handles:
- Push notifications
- Offline caching
- Background sync

## 🚀 Deployment Process

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Go to Vercel Dashboard > Project > Settings > Environment Variables
   - Add all production environment variables

### Option 2: Manual Deployment

1. **Build Application**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Static Hosting**
   - Upload `dist/` folder to your hosting provider
   - Configure redirects for SPA routing
   - Set up SSL certificate

### Option 3: Docker Deployment

```dockerfile
# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "preview"]
```

## 🔧 Post-Deployment Configuration

### 1. Domain Configuration

```bash
# Custom domain setup in Vercel
vercel domains add yourdomain.com
vercel domains add www.yourdomain.com
```

### 2. SSL Certificate

- Vercel provides automatic SSL
- For custom hosting, configure Let's Encrypt or similar

### 3. CDN Setup (Optional)

Configure CDN for static assets:
```bash
# Example with Cloudflare
# Update image URLs to use CDN
# Configure cache headers
```

### 4. Analytics Setup (Optional)

```typescript
// Add to main.tsx or App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

## 🧪 Testing in Production

### 1. Smoke Tests

```bash
# Run production smoke tests
npm run test:e2e:prod

# Check critical user flows
npm run test:smoke
```

### 2. Performance Testing

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Load testing
npm run test:load
```

### 3. Security Testing

```bash
# Security audit
npm audit
npm run test:security
```

## 📊 Monitoring and Maintenance

### Application Monitoring

1. **Performance Monitoring**
   - Vercel Analytics (built-in)
   - Custom performance metrics in app

2. **Error Tracking**
   ```typescript
   // Add error tracking service
   import * as Sentry from '@sentry/react';
   
   Sentry.init({
     dsn: 'your_sentry_dsn',
   });
   ```

3. **Uptime Monitoring**
   - UptimeRobot or similar service
   - Health check endpoint: `/api/health`

### Database Monitoring

1. **Supabase Dashboard**
   - Monitor query performance
   - Check connection limits
   - Review logs

2. **Backup Strategy**
   ```bash
   # Automated backups via Supabase
   # Additional backup script
   supabase db dump > backup.sql
   ```

## 🔒 Security Considerations

### 1. Environment Security

- Never commit `.env` files
- Use Vercel's encrypted environment variables
- Rotate secrets regularly

### 2. Authentication Security

- Configure CSRF protection
- Set secure cookie options
- Implement rate limiting

### 3. Database Security

- Enable RLS on all tables
- Use least-privilege access
- Regular security audits

### 4. API Security

```typescript
// Rate limiting example
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variable Issues**
   ```bash
   # Check environment loading
   console.log('Env check:', {
     supabase: !!import.meta.env.VITE_SUPABASE_URL,
     google: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
   });
   ```

3. **Real-time Connection Issues**
   ```bash
   # Check Pusher configuration
   # Verify WebSocket fallback
   # Test with mock service
   ```

4. **Push Notification Issues**
   ```bash
   # Verify VAPID keys
   # Check service worker registration
   # Test notification permissions
   ```

### Performance Issues

1. **Slow Loading**
   - Enable lazy loading for components
   - Optimize images with performance utils
   - Check bundle size analysis

2. **Memory Leaks**
   - Use performance monitoring hooks
   - Check real-time connection cleanup
   - Monitor component unmounting

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Database Scaling**
   - Supabase automatically scales
   - Consider read replicas for high traffic

2. **CDN Configuration**
   - Serve static assets from CDN
   - Cache API responses appropriately

3. **Real-time Scaling**
   - Pusher handles scaling automatically
   - WebSocket fallback may need load balancing

### Vertical Scaling

1. **Vercel Functions**
   - Serverless functions auto-scale
   - Monitor function duration and memory

2. **Database Performance**
   - Add indexes for frequently queried data
   - Optimize complex queries

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📚 Additional Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Pusher Documentation](https://pusher.com/docs)

### Monitoring Tools
- [Vercel Analytics](https://vercel.com/analytics)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Sentry](https://sentry.io/)

### Security Tools
- [OWASP ZAP](https://owasp.org/www-project-zap/)
- [Snyk](https://snyk.io/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

## 🎯 Post-Launch Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Authentication working
- [ ] Real-time features functional
- [ ] Push notifications enabled
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Analytics tracking enabled
- [ ] Error monitoring setup
- [ ] Backup strategy implemented
- [ ] Performance monitoring active
- [ ] Security scan completed
- [ ] Load testing passed
- [ ] Documentation updated

## 🆘 Support

For deployment issues:
1. Check Vercel deployment logs
2. Review Supabase dashboard
3. Test with local production build
4. Contact support channels

---

**Happy Deploying! 🍺🏆**