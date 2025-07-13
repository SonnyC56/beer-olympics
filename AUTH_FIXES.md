# Google OAuth Authentication Fixes

## Issue
Google OAuth was failing with a 500 Internal Server Error when users tried to sign in.

## Root Causes
1. **Conflicting Environment Variable Names**: The custom auth service was using `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`, while the NextAuth configuration expected `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

2. **Problematic Middleware**: The Express-based rate limiting middleware doesn't work in Vercel serverless functions.

## Solutions Applied

### 1. Standardized Environment Variables
- Updated `/src/services/auth.ts` to use standard Google OAuth environment variable names:
  - `AUTH_GOOGLE_ID` → `GOOGLE_CLIENT_ID`
  - `AUTH_GOOGLE_SECRET` → `GOOGLE_CLIENT_SECRET`

### 2. Simplified Middleware
- Removed complex Express-based middleware from `/api/auth/google.ts`
- Replaced with simple CORS headers suitable for Vercel serverless functions

### 3. Updated Environment Examples
- Updated `.env.example` and `.env.local.example` to use correct variable names
- Ensures consistency between custom auth service and NextAuth

## Files Modified
- `/src/services/auth.ts` - Updated to use standard Google OAuth env vars
- `/api/auth/google.ts` - Simplified middleware and updated env var checks
- `/.env.example` - Updated environment variable names
- `/.env.local.example` - Updated environment variable names

## Expected Behavior
1. **With Google OAuth configured**: Users will be redirected to Google OAuth flow
2. **Without Google OAuth configured**: App will use mock authentication for development
3. **Environment variables are now consistent** between all auth services

## Testing
- ✅ Build successful with 0 TypeScript errors
- ✅ Environment variable names standardized
- ✅ Middleware simplified for Vercel compatibility

## Next Steps
1. Set the following environment variables in Vercel:
   - `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret
   - `AUTH_SECRET` - A random secret for JWT signing
   - `AUTH_URL` - Your production URL (https://your-app.vercel.app)

2. Deploy to Vercel and test Google OAuth flow

The Google OAuth should now work properly in production!