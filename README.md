# Beer Olympics Platform

Turn any backyard Olympics into a pro-grade, phone-first tournament with real-time brackets, self-reported scores, bonus challenges, media uploads, and auto-generated highlight reels.

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## Features

- 🎯 **Open Sign-Up**: Public invite link for unlimited teams
- 📊 **Real-time Brackets**: Live updates for all participants
- 🏆 **Self-Reported Scoring**: Captain submit → opponent confirm workflow
- 🎉 **Bonus Challenges**: One-tap bonuses for extra points
- 📸 **Media Capture**: Videos, photos, and testimonials
- 🎬 **Highlight Reels**: Auto-generated shareable videos
- 📱 **PWA Support**: Works offline, installable on phones
- 📺 **Display Mode**: TV-friendly leaderboards and brackets

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- tRPC + React Query
- Auth.js with Google OAuth
- Couchbase database
- Mux for video, Cloudinary for images

## Development

See [CLAUDE.md](./CLAUDE.md) for detailed development instructions.