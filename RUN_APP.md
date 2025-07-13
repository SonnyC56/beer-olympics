# How to Run the Beer Olympics App

This is a full-stack application that requires both the frontend (Vite) and backend (Vercel) servers to be running.

## Quick Start

You need to run TWO terminal windows:

### Terminal 1: Backend API Server (Port 3000)
```bash
npx vercel dev --listen 3000
```

### Terminal 2: Frontend Dev Server (Port 5173)
```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## How It Works

1. **Frontend (Vite)**: Runs on port 5173 and serves the React app
2. **Backend (Vercel)**: Runs on port 3000 and handles:
   - tRPC API endpoints (`/api/trpc/*`)
   - Authentication (`/api/auth/*`)
   - Database connections (when configured)

The Vite dev server proxies API requests to the Vercel dev server automatically.

## Current Features Working

1. **Tournament Creation**: Create tournaments with name and date
2. **RSVP System**: Full RSVP form with local storage persistence
3. **Team Registration**: Join tournaments and create teams
4. **Control Room**: Manage tournament settings and view teams
5. **Mock Data**: The app uses mock data in development when database is not configured

## Environment Variables (Optional)

For production, you'll need these in `.env`:
```
COUCHBASE_CONNECTION_STRING=
COUCHBASE_USERNAME=
COUCHBASE_PASSWORD=
COUCHBASE_BUCKET=beer_olympics
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

Without these, the app runs with mock data which is perfect for development and testing.

## Common Issues

### "POST http://localhost:5173/api/trpc/tournament.create 404"
**Solution**: Make sure the Vercel dev server is running on port 3000 (Terminal 1)

### "Cannot connect to database"
**Solution**: This is normal in development. The app will use mock data automatically.

### "Auth not working"
**Solution**: For development, the app uses mock authentication. Real Google OAuth requires environment variables.

## Testing the App

1. Create a tournament (uses mock data)
2. Visit the control room to manage it
3. Test the RSVP form (saves to local storage)
4. Join a tournament and create a team

All features work with mock data, so you can test the full user experience!