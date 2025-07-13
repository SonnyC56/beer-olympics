# Docker Setup for Beer Olympics

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update .env with your credentials:**
   - Google OAuth credentials
   - Couchbase connection details
   - Pusher API keys
   - Other service credentials

3. **Run with Docker Compose:**

   **Development mode (recommended):**
   ```bash
   docker-compose up dev
   ```
   - Frontend: http://localhost:5173
   - API: http://localhost:3002

   **Production mode:**
   ```bash
   docker-compose up app
   ```
   - Full app: http://localhost:3000

## Docker Services

### `dev` Service (Development)
- Uses `Dockerfile.dev`
- Hot reloading enabled
- Mounts source code as volumes
- Runs both Vite dev server and Vercel dev

### `app` Service (Production)
- Uses `Dockerfile.production`
- Currently runs in development mode due to TypeScript build issues
- Once build issues are fixed, can switch back to original Dockerfile

## Environment Variables

Required environment variables:
- `AUTH_SECRET` - Random secret for auth
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret
- `COUCHBASE_CONNECTION_STRING` - Couchbase server URL
- `COUCHBASE_USERNAME` - Couchbase username
- `COUCHBASE_PASSWORD` - Couchbase password
- `COUCHBASE_BUCKET` - Couchbase bucket name (default: beer_olympics)
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` - Pusher config

## Troubleshooting

### Build Errors
The production build currently has TypeScript errors. The Docker setup works around this by:
- Using development mode in production container
- Skipping the TypeScript compilation step
- Running the app with `vercel dev` instead of built files

### Port Conflicts
If ports are already in use:
- Change ports in docker-compose.yml
- Or stop conflicting services

### Database Connection
Ensure Couchbase is accessible from Docker:
- Use host.docker.internal for local Couchbase
- Or use external Couchbase URL