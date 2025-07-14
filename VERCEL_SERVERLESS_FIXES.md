# Vercel Serverless Function Fixes

## 🔧 Fixed Issues

### 1. **Google OAuth Serverless Crash**
**Problem**: The OAuth2Client was being initialized at module level, causing crashes when environment variables weren't ready.

**Solution**: 
- Moved OAuth2Client initialization inside the handler function
- Removed external module imports that might cause bundling issues
- Added better error logging to help with debugging

### 2. **Auth Verification Crash**
**Problem**: The /api/auth/me endpoint was importing from local modules causing bundling issues.

**Solution**:
- Inlined the JWT verification and cookie parsing functions
- Removed external imports from src/ directories
- Simplified CORS headers

## 📋 Deployment Checklist

### ✅ **Before Deploying:**

1. **Verify Environment Variables in Vercel:**
   ```
   GOOGLE_CLIENT_ID = [your-client-id]
   GOOGLE_CLIENT_SECRET = [your-client-secret]
   AUTH_URL = https://www.beerlympics.io
   AUTH_SECRET = [your-secret-key]
   ```

2. **Update Google Cloud Console:**
   - Authorized redirect URI: `https://www.beerlympics.io/api/auth/callback`
   - Remove old vercel.app URLs

3. **Commit and Push Changes:**
   ```bash
   git add .
   git commit -m "Fix Vercel serverless function crashes"
   git push
   ```

## 🚀 After Deployment

The app should now work with:
- ✅ Google OAuth sign-in
- ✅ JWT authentication
- ✅ All API endpoints functional
- ✅ No serverless crashes

## 📊 Key Changes Made

### `/api/auth/google.ts`:
- Removed import from `src/services/auth`
- Inlined OAuth2Client initialization
- Better error messages with details

### `/api/auth/me.ts`:
- Removed imports from `src/services/auth` and `src/utils/middleware`
- Inlined JWT verification and cookie parsing
- Simplified CORS headers

## 🎯 Testing After Deploy

1. **Test Google Sign-in:**
   - Click "Sign in with Google"
   - Should redirect to Google OAuth
   - Should return to app after authorization

2. **Test Auth Persistence:**
   - After signing in, refresh the page
   - User should remain signed in

3. **Check Vercel Function Logs:**
   - Dashboard → Functions → View logs
   - Should see successful auth checks