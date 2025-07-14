# Couchbase Database Connection Documentation

## Overview

The Beer Olympics platform uses Couchbase Capella (cloud-hosted Couchbase) as its primary database. This document explains how the connection is established, managed, and used throughout the application.

## Architecture

```
Application → Connection Pool → Couchbase Capella Cloud
     ↓              ↓                    ↓
  Service Layer  SDK Client         beer_olympics bucket
     ↓              ↓                    ↓  
  Documents    Collections           Data Storage
```

## Couchbase Service (`src/services/couchbase.ts`)

### Connection Management

**Singleton Pattern**: The service uses a singleton pattern to maintain a single connection across the application.

```typescript
let cluster: Cluster | null = null;
let bucket: Bucket | null = null;
let isConnecting = false;
```

### Core Connection Function

```typescript
export async function getCouchbaseConnection() {
  // Returns existing connection if available
  if (cluster && bucket) {
    return { cluster, bucket };
  }

  // Prevents multiple simultaneous connections
  if (isConnecting) {
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return { cluster, bucket };
  }

  // Establishes new connection
  isConnecting = true;
  // ... connection logic
}
```

**Key Features**:
- Connection reuse to avoid overhead
- Concurrent connection protection
- Automatic retry on failure
- Graceful error handling

### Connection Configuration

```typescript
cluster = await connect(connectionString, {
  username,
  password,
  timeouts: {
    kvTimeout: 10000,        // Key-value operations
    queryTimeout: 20000,     // N1QL queries  
    connectTimeout: 10000,   // Initial connection
    managementTimeout: 20000 // Admin operations
  },
});
```

**Timeout Strategy**:
- Balanced between performance and reliability
- Longer timeouts for complex queries
- Shorter timeouts for simple operations

## Environment Variables

### Required Configuration
```bash
COUCHBASE_CONNECTION_STRING=couchbases://cb.xxxxx.cloud.couchbase.com
COUCHBASE_USERNAME=beer_olympics_user
COUCHBASE_PASSWORD=your-secure-password
COUCHBASE_BUCKET=beer_olympics
```

**Connection String Format**:
- `couchbases://` - Secure connection (TLS)
- `cb.xxxxx.cloud.couchbase.com` - Capella cluster endpoint
- Default port 11207 for secure connections

## Document Operations

### Helper Functions

#### 1. Get Document
```typescript
export async function getDocument(key: string, collection = '_default') {
  try {
    const coll = await getCollection(collection);
    const result = await coll.get(key);
    return result.content;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      return null; // Not an error, just missing
    }
    throw new CouchbaseError(`Failed to get document ${key}`);
  }
}
```

#### 2. Upsert Document
```typescript
export async function upsertDocument(key: string, value: any, collection = '_default') {
  try {
    const coll = await getCollection(collection);
    const result = await coll.upsert(key, value);
    return result;
  } catch (error) {
    throw new CouchbaseError(`Failed to upsert document ${key}`);
  }
}
```

#### 3. Remove Document
```typescript
export async function removeDocument(key: string, collection = '_default') {
  try {
    const coll = await getCollection(collection);
    const result = await coll.remove(key);
    return result;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      return null; // Already gone
    }
    throw new CouchbaseError(`Failed to remove document ${key}`);
  }
}
```

## Document Structure & Naming

### Key Patterns
The application uses prefixed keys for organization:

```
user::google-1234567890           # User profiles
tournament::summer-2024           # Tournament configuration  
team::team-uuid-here             # Team information
match::match-uuid-here           # Match details and results
event::beer-pong                 # Event/game configuration
score_submission::submission-id   # Pending score submissions
score_entry::entry-id            # Confirmed scores
media::media-uuid-here           # Media upload metadata
clip_job::job-uuid-here          # Highlight reel generation jobs
login::user-id::timestamp        # Login activity tracking
```

### Document Examples

#### User Document
```json
{
  "id": "google-1234567890",
  "email": "player@example.com",
  "name": "John Player", 
  "image": "https://lh3.googleusercontent.com/...",
  "lastLogin": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Tournament Document
```json
{
  "id": "summer-2024",
  "slug": "summer-olympics-2024",
  "name": "Summer Beer Olympics 2024",
  "description": "Annual backyard competition",
  "ownerId": "google-1234567890",
  "status": "active",
  "settings": {
    "maxTeams": 16,
    "autoConfirmScores": true,
    "confirmationTimeout": 300000
  },
  "events": ["beer-pong", "flip-cup", "cornhole"],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Query Operations

### N1QL Queries
```typescript
export async function query(statement: string, options?: any): Promise<QueryResult> {
  const { cluster } = await getCouchbaseConnection();
  return cluster.query(statement, options);
}
```

### Example Queries

#### Get Tournament Leaderboard
```sql
SELECT t.name, t.totalPoints, t.wins, t.losses
FROM beer_olympics t
WHERE META(t).id LIKE "team::%"
AND t.tournamentId = $tournamentId
ORDER BY t.totalPoints DESC, t.wins DESC
```

#### Recent Login Activity
```sql
SELECT l.email, l.timestamp, l.ip
FROM beer_olympics l  
WHERE META(l).id LIKE "login::%"
AND l.timestamp > $since
ORDER BY l.timestamp DESC
LIMIT 50
```

#### Active Tournaments
```sql
SELECT t.slug, t.name, t.status, t.ownerId
FROM beer_olympics t
WHERE META(t).id LIKE "tournament::%"
AND t.status = "active"
ORDER BY t.updatedAt DESC
```

## Error Handling

### Custom Error Class
```typescript
export class CouchbaseError extends Error {
  public code?: string;
  
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'CouchbaseError';
    this.code = code;
  }
}
```

### Common Error Scenarios

1. **Connection Failures**
   - Network connectivity issues
   - Invalid credentials
   - Cluster unavailable

2. **Document Operations**
   - Document not found (handled gracefully)
   - Timeout errors
   - Permission denied

3. **Query Errors**
   - Syntax errors in N1QL
   - Index not available
   - Query timeout

## Performance Considerations

### Connection Pooling
- Single connection reused across requests
- Automatic reconnection on failure
- Connection warmup on first request

### Indexing Strategy
```sql
-- Primary indexes for key-value operations
CREATE PRIMARY INDEX ON beer_olympics;

-- Secondary indexes for common queries
CREATE INDEX idx_tournament_status ON beer_olympics(status) 
WHERE META().id LIKE "tournament::%";

CREATE INDEX idx_team_tournament ON beer_olympics(tournamentId) 
WHERE META().id LIKE "team::%";

CREATE INDEX idx_login_timestamp ON beer_olympics(timestamp) 
WHERE META().id LIKE "login::%";
```

### Query Optimization
- Use prepared statements for repeated queries
- Leverage indexes for WHERE clauses
- Limit result sets with LIMIT clause
- Use parameterized queries to prevent injection

## Development vs Production

### Development
```typescript
// More verbose logging
console.log('Couchbase operation:', operation, key);

// Relaxed timeouts
timeouts: {
  kvTimeout: 15000,
  queryTimeout: 30000
}
```

### Production
```typescript
// Error-only logging
console.error('Couchbase error:', error);

// Optimized timeouts
timeouts: {
  kvTimeout: 10000,
  queryTimeout: 20000
}
```

## Monitoring & Health Checks

### Connection Health
```typescript
// Test connection with a simple operation
await bucket.defaultCollection().exists('health-check')
  .catch(() => false);
```

### Metrics to Monitor
- Connection pool status
- Query response times
- Error rates by operation type
- Document size distribution
- Index utilization

## Backup & Recovery

### Couchbase Capella Features
- Automatic daily backups
- Point-in-time recovery
- Cross-region replication
- Disaster recovery procedures

### Data Export
```typescript
// Export all documents of a type
const query = `
  SELECT META().id, *
  FROM beer_olympics
  WHERE META().id LIKE "user::%"
`;
```

## Security

### Access Control
- Database user with minimal required permissions
- Connection string contains credentials
- TLS encryption for all connections
- IP whitelisting in Capella console

### Data Protection
- Sensitive data encryption at rest
- Field-level redaction for logs
- Audit trail for all operations
- GDPR compliance considerations

## Troubleshooting

### Connection Issues
```typescript
// Debug connection parameters
console.log('Connection details:', {
  connectionString: process.env.COUCHBASE_CONNECTION_STRING?.replace(/\/\/.*@/, '//***@'),
  username: process.env.COUCHBASE_USERNAME,
  bucket: process.env.COUCHBASE_BUCKET
});
```

### Common Solutions
1. **Timeout Errors**: Increase timeout values
2. **Authentication Failed**: Verify credentials in Capella
3. **Bucket Not Found**: Check bucket name and permissions
4. **Network Errors**: Verify firewall and DNS settings

### Debug Logging
```typescript
// Enable SDK logging in development
process.env.LCB_LOGLEVEL = '5'; // Trace level
```