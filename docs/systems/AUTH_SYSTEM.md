# Authentication System Documentation

## Overview

The Beer Olympics platform uses a custom JWT-based authentication system with Google OAuth for user login. Unlike Firebase Auth, this system provides full control over user data storage and session management.

## Architecture

```
User Browser → Google OAuth → Auth Callback → JWT Token → Protected Routes
     ↓              ↓              ↓            ↓             ↓
  Auth Context   OAuth Server   JWT Creation  HTTP Cookie   API Access
```

## Components

### 1. Frontend Auth Context (`src/context/auth.tsx`)

**Purpose**: Manages authentication state across the React application.

**Key Features**:
- User state management (`User | null`)
- Loading states during auth operations
- Automatic token refresh on app load
- localStorage fallback for development

**Methods**:
```typescript
signIn(returnTo?: string): Promise<void>    // Initiates OAuth flow
signOut(): Promise<void>                    // Clears session
refreshUser(): Promise<void>                // Validates current session
```

**Development Mode**:
- Uses mock authentication when `import.meta.env.DEV` is true
- Creates fake user without requiring Google OAuth setup
- Stores mock user in localStorage

### 2. Auth Service (`src/services/auth.ts`)

**Purpose**: Core authentication logic and JWT handling.

**Key Functions**:

```typescript
generateAuthUrl(): Promise<string>
// Creates Google OAuth URL with required scopes

verifyGoogleToken(code: string): Promise<User>
// Exchanges OAuth code for user information

generateJWT(user: User): string
// Creates signed JWT token with 7-day expiration

verifyJWT(token: string): User | null
// Validates and decodes JWT token

parseAuthCookie(cookieString: string): string | null
// Extracts auth token from HTTP cookies
```

**Security Features**:
- JWT tokens signed with `AUTH_SECRET`
- 7-day token expiration
- HTTP-only cookies in production
- Secure flag for HTTPS environments

### 3. API Routes

#### `/api/auth/google` - OAuth Initiation
```javascript
// GET request
// Returns: { url: "https://accounts.google.com/oauth/..." }
```
- Generates Google OAuth URL
- Includes required scopes (profile, email)
- Handles mock auth for development

#### `/api/auth/callback` - OAuth Callback
```javascript
// GET request with ?code=... from Google
// Sets HTTP-only cookie and redirects to app
```
- Verifies OAuth code with Google
- Creates user record in Couchbase
- Generates JWT token
- Sets secure HTTP cookie
- Logs login events
- Redirects to dashboard or original destination

#### `/api/auth/me` - Session Verification
```javascript
// GET request
// Returns: { user: { id, email, name, image } }
```
- Validates JWT token from cookie or Authorization header
- Returns current user data
- Used by frontend to check auth status

#### `/api/auth/logout` - Session Termination
```javascript
// POST request
// Clears cookie and ends session
```
- Removes HTTP-only auth cookie
- Client-side cleanup handled by auth context

## Authentication Flow

### 1. Login Process
```
1. User clicks "Sign In"
2. Frontend calls /api/auth/google
3. User redirected to Google OAuth
4. User authorizes application
5. Google redirects to /auth/callback?code=...
6. Backend verifies code with Google
7. User data stored/updated in Couchbase
8. JWT token generated and set as HTTP cookie
9. User redirected to dashboard
10. Frontend auth context updates with user data
```

### 2. Protected Route Access
```
1. Frontend makes API request
2. HTTP cookie automatically included
3. Backend validates JWT token
4. Request processed if valid, 401 if invalid
```

### 3. Session Refresh
```
1. App loads/refreshes
2. Auth context calls /api/auth/me
3. Backend validates existing cookie
4. User state updated in frontend
5. If invalid, user redirected to login
```

## Data Storage

### User Records in Couchbase
```json
{
  "id": "google-1234567890",
  "email": "user@example.com", 
  "name": "John Doe",
  "image": "https://lh3.googleusercontent.com/...",
  "lastLogin": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```
**Document Key**: `user::google-1234567890`

### Login Events
```json
{
  "userId": "google-1234567890",
  "email": "user@example.com",
  "name": "John Doe", 
  "timestamp": "2024-01-15T10:30:00Z",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```
**Document Key**: `login::google-1234567890::1705312200000`

## Environment Variables

### Required for Production
```bash
AUTH_SECRET=your-jwt-signing-secret        # For JWT token signing
AUTH_URL=https://your-domain.com          # Base URL for OAuth redirects
AUTH_GOOGLE_ID=your-google-client-id      # Google OAuth client ID
AUTH_GOOGLE_SECRET=your-client-secret     # Google OAuth client secret
```

### Development
- Google OAuth variables can be omitted for mock auth
- `AUTH_URL` defaults to `http://localhost:5173`

## Security Considerations

### JWT Tokens
- Signed with secret key to prevent tampering
- Include user data to avoid database lookups on every request
- 7-day expiration balances security and UX
- Stored in HTTP-only cookies to prevent XSS

### OAuth Security
- Uses authorization code flow (not implicit)
- Validates tokens server-side with Google
- Includes CSRF protection via state parameter
- Secure and SameSite cookie flags in production

### Error Handling
- Failed OAuth attempts logged server-side
- Graceful fallback to login page on auth errors
- No sensitive data exposed in client-side errors

## Monitoring Login Activity

### Server Logs
```javascript
console.log('🎉 User logged in:', {
  id: user.id,
  email: user.email, 
  name: user.name,
  timestamp: new Date().toISOString()
});
```

### Database Queries
```sql
-- Recent logins
SELECT * FROM beer_olympics 
WHERE META().id LIKE "login::%"
ORDER BY timestamp DESC
LIMIT 10;

-- Active users
SELECT * FROM beer_olympics
WHERE META().id LIKE "user::%"
AND lastLogin > "2024-01-01T00:00:00Z";
```

## Comparison to Firebase Auth

| Feature | Firebase Auth | Our System |
|---------|---------------|------------|
| User Storage | Firebase | Couchbase |
| Session Management | Firebase SDK | JWT Cookies |
| OAuth Providers | Built-in | Manual Integration |
| Offline Support | Yes | Limited |
| Data Control | Limited | Full Control |
| Custom Claims | Limited | Full JWT Control |
| Pricing | Usage-based | Included |

## Development vs Production

### Development
- Mock authentication available
- localStorage fallback
- Less strict security (HTTP cookies)
- Console logging enabled

### Production  
- Real Google OAuth required
- HTTPS-only cookies
- Secure headers applied
- Error logging to monitoring service

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check JWT token expiration
   - Verify AUTH_SECRET matches
   - Ensure cookies are being sent

2. **OAuth Callback Errors**
   - Verify redirect URI in Google Console
   - Check AUTH_URL environment variable
   - Confirm Google credentials are correct

3. **Development Mock Auth**
   - Ensure mock user data is valid
   - Check localStorage for corrupted data
   - Verify development environment detection