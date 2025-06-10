# Beer Olympics Platform - Development Guide

This document contains essential information for Claude to effectively work on the Beer Olympics Platform.

## Project Overview
A phone-first PWA tournament platform for backyard Olympics with real-time brackets, self-reported scores, bonus challenges, media uploads, and auto-generated highlight reels.

## Current State
The project has a solid foundation with a working frontend and a partially implemented backend. The UI has been recently updated with a new pastel color palette, improved typography, and engaging animations. However, we are currently debugging an issue with the `tournament.create` tRPC endpoint, which is returning a 404 error in the local development environment.

## Tech Stack
- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
- **State/API**: tRPC + React Query
- **Auth**: Auth.js (NextAuth) with Google provider
- **Database**: Couchbase Capella (beer_olympics bucket)
- **Media**: Mux (video), Cloudinary (images)
- **Hosting**: Vercel

## Key Commands
```bash
# Development
npm run dev          # Start dev server on http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking

# Testing
npm run test         # Run tests with Vitest
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

## Project Structure
```
src/
├── api/          # tRPC routers and API logic
├── components/   # React components
│   └── ui/       # shadcn/ui components
├── context/      # React context providers
├── hooks/        # Custom React hooks
├── lib/          # Utilities (cn function, etc.)
├── pages/        # Page components
├── services/     # Business logic and external services
└── types/        # TypeScript type definitions
```

## Data Model (Couchbase Documents)
- `tournament::{slug}` - Tournament configuration
- `team::{id}` - Team information
- `event::{id}` - Event/game configuration
- `match::{id}` - Match details and results
- `score_submission::{id}` - Score submissions pending confirmation
- `score_entry::{id}` - Confirmed scores
- `media::{id}` - Media uploads metadata
- `clip_job::{id}` - Highlight reel generation jobs

## Key Features to Implement
1. **Open Sign-Up**: Public invite link `/<slug>` for teams to join
2. **Real-time Updates**: WebSocket for live scores and brackets
3. **Self-Reported Scoring**: Captain submit → opponent confirm → auto-confirm after 5 min
4. **Bonus Challenges**: One-tap bonuses defined by tournament owner
5. **Media Capture**: 30s video + photos + testimonials per match
6. **Highlight Reel**: Auto-generated MP4 with Remotion/Mux
7. **PWA Support**: Service worker for offline functionality
8. **Display Mode**: TV-friendly route for leaderboards and brackets

## Environment Variables Required
- `AUTH_SECRET` - Auth.js secret
- `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET` - Google OAuth
- `COUCHBASE_*` - Database connection details
- `MUX_*` - Video API credentials
- `CLOUDINARY_*` - Image upload credentials

## Design Principles
- **Pastel & Playful**: A soft, inviting color palette with engaging animations.
- **Mobile First**: Most users will be on phones
- **Real-time**: Everything updates instantly
- **Minimal Friction**: Easy sign-up, quick score entry
- **Beautiful by Default**: Smooth animations, polished UI

## Testing Approach
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright (to be added)

## Common Issues & Solutions
1. **Tailwind not working**: Ensure postcss.config.js and tailwind.config.js are properly configured
2. **Type errors**: Run `npm run typecheck` to catch TypeScript issues
3. **Auth issues**: Check .env file has correct AUTH_* variables
4. **tRPC 404 errors**: Check `vite.config.ts` proxy and `vercel.json` rewrites.

## Next Steps
1.  **Resolve the `tournament.create` 404 error.** This is our highest priority. We need to determine if the issue is with the Vite proxy, the Vercel routing, or the tRPC handler itself.
2.  **Complete the backend implementation.** This includes building out the remaining tRPC routers and services for teams, matches, and scoring.
3.  **Implement real-time updates with WebSockets.** This is a critical feature for creating a live, engaging experience.
4.  **Build out the remaining pages and features.** This includes the tournament dashboard, scoring interfaces, and media upload capabilities.
5.  **Add end-to-end tests with Playwright.** This will help us ensure the application is working correctly from the user's perspective.