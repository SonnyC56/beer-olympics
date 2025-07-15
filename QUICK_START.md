# 🚀 Beer Olympics Quick Start Guide

Get your Beer Olympics tournament up and running in minutes!

## 📦 Prerequisites

- Node.js 20+ 
- npm 9+
- Docker (for local databases) or cloud services

## 🏃 Quick Local Setup

### 1. Clone and Install
```bash
git clone https://github.com/your-username/beer-olympics.git
cd beer-olympics
npm install
```

### 2. Set Up Databases (Docker)
```bash
# Start Couchbase
docker run -d --name couchbase \
  -p 8091-8096:8091-8096 \
  -p 11210:11210 \
  couchbase:community

# Start Redis
docker run -d --name redis \
  -p 6379:6379 \
  redis:alpine
```

### 3. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
# At minimum, you need:
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (from Google Console)
# - AUTH_SECRET (generate with: openssl rand -base64 32)
# - PUSHER credentials (from pusher.com)
# - CLOUDINARY credentials (from cloudinary.com)
```

### 4. Initialize Database
```bash
# Set up Couchbase bucket and indexes
npm run init:couchbase

# Test Redis connection
npm run test:redis
```

### 5. Start Development
```bash
# Run both frontend and API
npm run dev:full

# Or run separately:
npm run dev      # Frontend on http://localhost:5173
npm run dev:api  # API on http://localhost:3002
```

## 🧪 Quick Test

```bash
# Run all tests
npm test

# Quick smoke test
npm run test:e2e:smoke

# Check environment
node scripts/check-env.js
```

## 🚀 Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy
```bash
# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

### 3. Set Environment Variables
```bash
# Add each variable
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
# ... (add all required variables)

# Or import from .env file
vercel env pull
```

## 🎮 First Tournament

1. **Create Tournament**
   - Go to http://localhost:5173
   - Click "Create Tournament"
   - Choose Swiss format for 20+ people
   - Set up game stations

2. **Invite Players**
   - Share the RSVP link
   - Players complete registration
   - Teams can be auto-assigned

3. **Tournament Day**
   - Use check-in kiosk mode
   - Players scan QR codes
   - Tournament starts automatically
   - Real-time updates for everyone!

## 📱 Mobile Features

- Install as PWA: Click "Add to Home Screen"
- Works offline for score submission
- Push notifications for match alerts
- One-handed score entry

## 🆘 Common Issues

### Google OAuth Not Working
- Check redirect URI: `http://localhost:5173/api/auth/callback/google`
- Ensure Google Cloud Console has correct origins

### Database Connection Failed
- Verify Docker containers are running: `docker ps`
- Check Couchbase at http://localhost:8091
- Default login: Administrator/password

### WebSocket Issues
- Verify Pusher credentials are correct
- Check PUSHER_CLUSTER matches your region

## 📚 More Resources

- [Full Testing Guide](./TESTING_AND_DEPLOYMENT.md)
- [Feature Summary](./FEATURE_COMPLETE_SUMMARY.md)
- [API Documentation](./docs/api/)
- [Design System](./docs/design-system.md)

## 🎉 Ready to Party!

Your Beer Olympics app is ready! Create your first tournament and let the games begin! 🍺🏆