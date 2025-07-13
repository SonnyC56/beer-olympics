# Docker Setup Instructions

## Quick Start (Recommended)

The simplest way to run Beer Olympics with Docker:

```bash
# 1. Create a .env file (or copy from example)
cp .env.example .env

# 2. Run with docker-compose
docker-compose -f docker-compose.dev.yml up
```

This will:
- Start the Vite dev server on http://localhost:5173
- Start the API server on http://localhost:3002
- Install dependencies automatically
- Enable hot reloading

## Environment Variables

Minimum required in `.env`:
```env
AUTH_SECRET=your-secret-key-here
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
COUCHBASE_CONNECTION_STRING=couchbase://localhost
COUCHBASE_USERNAME=Administrator
COUCHBASE_PASSWORD=password
```

## Alternative Docker Files

### Production Build (Currently has TypeScript errors)
```bash
docker-compose up app
```

### Development with Hot Reload
```bash
docker-compose up dev
```

## Troubleshooting

### Network Issues During Build
If you encounter network errors during `npm ci`, the simplified `docker-compose.dev.yml` uses `npm install` which is more resilient.

### TypeScript Build Errors
The production build currently fails due to TypeScript strict mode errors. Use the development setup until these are resolved.

### Port Already in Use
Change the port mappings in docker-compose.yml if needed:
```yaml
ports:
  - "8080:5173"  # Change 8080 to your preferred port
```

## What Works

✅ Development server with hot reload
✅ API endpoints
✅ Database connections (with proper env vars)
✅ Authentication flows
✅ Real-time features

## Known Issues

⚠️ Production build fails due to TypeScript errors
⚠️ Some npm packages may timeout during Docker build
⚠️ Puppeteer tests won't work in Docker (Chrome not installed)