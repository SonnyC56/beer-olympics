# Beer Olympics - Production Deployment Guide

This guide covers deploying the Beer Olympics app to production with all services configured.

## Prerequisites

1. **Vercel Account** - For hosting the application
2. **Couchbase Capella Account** - For the database
3. **Google Cloud Console** - For OAuth authentication
4. **Pusher Account** - For real-time updates
5. **Domain** - Optional but recommended

## Database Setup (Couchbase Capella)

### 1. Create Couchbase Cluster
1. Go to [Couchbase Capella](https://cloud.couchbase.com/)
2. Create a new cluster
3. Choose your cloud provider and region
4. Wait for cluster deployment

### 2. Create Database
1. Create a new bucket named `beer_olympics`
2. Create database user with read/write permissions
3. Configure IP allowlist (or allow all for development)
4. Note down connection string and credentials

### 3. Initialize Database
```bash
# Set environment variables
export COUCHBASE_CONNECTION_STRING="couchbases://cb.xxxxx.cloud.couchbase.com"
export COUCHBASE_USERNAME="your-username"
export COUCHBASE_PASSWORD="your-password"
export COUCHBASE_BUCKET="beer_olympics"
export CREATE_SAMPLE_DATA="true"

# Run initialization script
npm run build
node scripts/init-couchbase.js
```

## Authentication Setup (Google OAuth)

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API

### 2. Configure OAuth Consent Screen
1. Go to "OAuth consent screen"
2. Choose "External" user type
3. Fill in app information:
   - App name: "Beer Olympics"
   - User support email: your email
   - Developer contact: your email

### 3. Create OAuth Credentials
1. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
2. Application type: "Web application"
3. Name: "Beer Olympics Web Client"
4. Authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://your-domain.com` (production)
5. Authorized redirect URIs:
   - `http://localhost:5173/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)
6. Save Client ID and Client Secret

## Real-time Updates Setup (Pusher)

### 1. Create Pusher App
1. Go to [Pusher](https://pusher.com/)
2. Create new app
3. Choose region closest to your users
4. Note down App ID, Key, Secret, and Cluster

### 2. Configure Channels
No additional configuration needed - channels are created dynamically.

## Deployment

### 1. Deploy to Vercel

#### Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add COUCHBASE_CONNECTION_STRING
vercel env add COUCHBASE_USERNAME
vercel env add COUCHBASE_PASSWORD
vercel env add COUCHBASE_BUCKET
vercel env add AUTH_SECRET
vercel env add AUTH_GOOGLE_ID
vercel env add AUTH_GOOGLE_SECRET
vercel env add PUSHER_APP_ID
vercel env add PUSHER_KEY
vercel env add PUSHER_SECRET
vercel env add PUSHER_CLUSTER
vercel env add VITE_PUSHER_KEY
vercel env add VITE_PUSHER_CLUSTER
```

#### Using GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### 2. Environment Variables

Set these environment variables in your deployment platform:

```env
# Database
COUCHBASE_CONNECTION_STRING=couchbases://cb.xxxxx.cloud.couchbase.com
COUCHBASE_USERNAME=your-username
COUCHBASE_PASSWORD=your-password
COUCHBASE_BUCKET=beer_olympics

# Authentication
AUTH_SECRET=your-32-character-random-string
AUTH_URL=https://your-domain.com
AUTH_GOOGLE_ID=your-google-client-id.googleusercontent.com
AUTH_GOOGLE_SECRET=your-google-client-secret

# Real-time Updates
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=us2
VITE_PUSHER_KEY=your-pusher-key
VITE_PUSHER_CLUSTER=us2

# Application
VITE_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 3. Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Go to "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed
5. Update OAuth redirect URLs in Google Cloud Console

## Post-Deployment Configuration

### 1. Update OAuth Redirect URLs
Update Google OAuth configuration with your production domain.

### 2. Test Core Functionality
- [ ] User authentication (Google OAuth)
- [ ] Tournament creation
- [ ] Team registration
- [ ] Real-time leaderboard updates
- [ ] Score submission workflow

### 3. Performance Optimization

#### Enable Vercel Analytics
```bash
vercel env add VERCEL_ANALYTICS_ID your-analytics-id
```

#### Configure Caching
The app includes proper caching headers and service worker for optimal performance.

## Monitoring and Maintenance

### 1. Error Tracking
Configure Sentry for production error tracking:
```bash
vercel env add SENTRY_DSN your-sentry-dsn
```

### 2. Database Monitoring
- Monitor Couchbase Capella dashboard for performance
- Set up alerts for high resource usage
- Regular backup strategy

### 3. Rate Limiting
The app includes built-in rate limiting. For production scale, consider:
- Redis for distributed rate limiting
- CloudFlare for DDoS protection
- Proper API key management

### 4. SSL/Security
- Vercel provides automatic SSL
- Security headers are configured
- CORS is properly set up

## Scaling Considerations

### Database Scaling
- Couchbase Capella auto-scales
- Monitor query performance
- Consider read replicas for high traffic

### Real-time Updates
- Pusher scales automatically
- Monitor channel usage and limits
- Consider WebSocket alternatives for very high traffic

### Application Scaling
- Vercel Edge Functions scale automatically
- Monitor function execution time
- Optimize bundle size if needed

## Backup and Recovery

### Database Backup
- Configure automated backups in Couchbase Capella
- Test restore procedures
- Document recovery processes

### Application Backup
- Code is stored in Git
- Environment variables should be documented securely
- API keys should be rotatable

## Security Checklist

- [ ] Environment variables are properly secured
- [ ] OAuth is configured with correct domains
- [ ] Rate limiting is enabled
- [ ] Security headers are applied
- [ ] API endpoints are properly validated
- [ ] User input is sanitized
- [ ] Error messages don't leak sensitive information

## Support and Troubleshooting

### Common Issues

1. **OAuth Redirect Mismatch**
   - Verify redirect URLs in Google Cloud Console
   - Check AUTH_URL environment variable

2. **Database Connection Errors**
   - Verify Couchbase credentials
   - Check IP allowlist settings

3. **Real-time Updates Not Working**
   - Verify Pusher credentials
   - Check browser console for WebSocket errors

4. **Performance Issues**
   - Monitor Vercel function logs
   - Check database query performance
   - Review network requests in browser

### Getting Help

1. Check Vercel deployment logs
2. Review browser console errors
3. Monitor Couchbase Capella metrics
4. Check Pusher debug console

For additional support, review the application logs and error tracking service.