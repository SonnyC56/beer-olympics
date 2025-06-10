# Couchbase Document Labeling & Organization

## Overview

Couchbase is a document database that stores JSON documents with unique keys. Unlike relational databases, there are no built-in "tables" or "collections" to organize different document types. However, there are several effective patterns to label and organize your documents.

## 🏷️ **Method 1: Type Field (Recommended)**

Add a `_type` field to every document:

```json
// User document
{
  "_type": "user",
  "id": "google-123456",
  "email": "user@example.com",
  "name": "John Doe"
}

// Login event document  
{
  "_type": "login_event",
  "userId": "google-123456",
  "timestamp": "2024-01-15T10:30:00Z",
  "successful": true
}

// Tournament document
{
  "_type": "tournament",
  "slug": "summer-2024",
  "name": "Summer Beer Olympics",
  "status": "active"
}
```

### Advantages:
- ✅ Easy to query by type
- ✅ Self-documenting
- ✅ Works with any key pattern
- ✅ Enables type-based indexing

### Queries:
```sql
-- Get all users
SELECT * FROM beer_olympics WHERE _type = "user"

-- Get all active tournaments  
SELECT * FROM beer_olympics WHERE _type = "tournament" AND status = "active"

-- Count documents by type
SELECT _type, COUNT(*) as count FROM beer_olympics GROUP BY _type
```

## 🔑 **Method 2: Key Prefixes (Also Recommended)**

Use consistent prefixes in document keys:

```
user::google-123456
user::google-789012
tournament::summer-2024
tournament::winter-2024
team::team-uuid-here
match::match-uuid-here
login::google-123456::1642248600000
```

### Advantages:
- ✅ Documents are naturally grouped
- ✅ Easy range queries
- ✅ Hierarchical organization
- ✅ Fast key-based lookups

### Queries:
```sql
-- Get all users using key pattern
SELECT * FROM beer_olympics WHERE META().id LIKE "user::%"

-- Get all tournaments
SELECT * FROM beer_olympics WHERE META().id LIKE "tournament::%"

-- Get user login history
SELECT * FROM beer_olympics WHERE META().id LIKE "login::google-123456::%"
```

## 🗂️ **Method 3: Scopes and Collections (Couchbase 7.0+)**

Couchbase 7.0+ supports scopes and collections as logical containers:

```
Bucket: beer_olympics
├── Scope: users
│   ├── Collection: profiles
│   └── Collection: login_events
├── Scope: tournaments  
│   ├── Collection: tournaments
│   ├── Collection: teams
│   └── Collection: matches
└── Scope: media
    ├── Collection: videos
    └── Collection: images
```

### Implementation:
```javascript
// Create collections (requires admin privileges)
await cluster.bucket('beer_olympics')
  .scope('users')
  .collection('profiles')
  .upsert('google-123456', userDoc);

// Query from specific collection
const users = cluster.bucket('beer_olympics')
  .scope('users')  
  .collection('profiles');

const result = await users.get('google-123456');
```

### Advantages:
- ✅ True logical separation
- ✅ Independent indexing per collection
- ✅ Security per collection
- ✅ Better organization at scale

### Disadvantages:
- ❌ Requires Couchbase 7.0+
- ❌ More complex setup
- ❌ Cross-collection queries are harder

## 🎯 **Recommended Approach for Beer Olympics**

Use **both Method 1 and Method 2** together:

```typescript
// Document structure
interface BaseDocument {
  _type: string;           // Document type
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
}

interface User extends BaseDocument {
  _type: 'user';
  id: string;
  email: string;
  name: string;
  // ... other user fields
}

interface Tournament extends BaseDocument {
  _type: 'tournament';
  slug: string;
  name: string;
  ownerId: string;
  // ... other tournament fields  
}

interface LoginEvent extends BaseDocument {
  _type: 'login_event';
  userId: string;
  timestamp: string;
  successful: boolean;
  // ... other login fields
}
```

### Key Patterns:
```
user::${userId}                     // user::google-123456
tournament::${slug}                 // tournament::summer-2024
team::${teamId}                     // team::uuid-here
match::${matchId}                   // match::uuid-here
login::${userId}::${timestamp}      // login::google-123456::1642248600000
score::${matchId}::${submissionId}  // score::match-123::submission-456
media::${matchId}::${mediaId}       // media::match-123::video-789
```

## 📊 **Creating Indexes for Labeled Documents**

```sql
-- Primary index (for development)
CREATE PRIMARY INDEX ON beer_olympics;

-- Type-based indexes
CREATE INDEX idx_user_type ON beer_olympics(_type) WHERE _type = "user";
CREATE INDEX idx_tournament_type ON beer_olympics(_type) WHERE _type = "tournament";

-- Composite indexes
CREATE INDEX idx_tournament_status ON beer_olympics(_type, status) 
WHERE _type = "tournament";

CREATE INDEX idx_user_email ON beer_olympics(_type, email) 
WHERE _type = "user";

-- Key-based indexes  
CREATE INDEX idx_user_keys ON beer_olympics(META().id) 
WHERE META().id LIKE "user::%";

CREATE INDEX idx_login_events ON beer_olympics(META().id, timestamp) 
WHERE META().id LIKE "login::%";
```

## 🔍 **Common Query Patterns**

### Get All Documents by Type:
```sql
SELECT * FROM beer_olympics WHERE _type = "user"
```

### Get Documents by Key Pattern:
```sql  
SELECT * FROM beer_olympics WHERE META().id LIKE "tournament::%"
```

### Mixed Queries:
```sql
SELECT * FROM beer_olympics 
WHERE _type = "tournament" 
AND status = "active"
AND META().id LIKE "tournament::%"
```

### Cross-Reference Queries:
```sql
SELECT t.name, u.name as owner_name
FROM beer_olympics t
JOIN beer_olympics u ON KEYS "user::" || t.ownerId
WHERE t._type = "tournament" 
AND u._type = "user"
```

## 🛠️ **Implementation in Your App**

Update your Couchbase service to include type information:

```typescript
// src/services/couchbase.ts
export async function createUser(userData: Partial<User>): Promise<User> {
  const user: User = {
    _type: 'user',
    id: userData.id!,
    email: userData.email!,
    name: userData.name!,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...userData
  };
  
  await upsertDocument(`user::${user.id}`, user);
  return user;
}

export async function createLoginEvent(event: Partial<LoginEvent>): Promise<LoginEvent> {
  const loginEvent: LoginEvent = {
    _type: 'login_event',
    userId: event.userId!,
    timestamp: new Date().toISOString(),
    successful: true,
    ...event
  };
  
  const eventId = `login::${loginEvent.userId}::${Date.now()}`;
  await upsertDocument(eventId, loginEvent);
  return loginEvent;
}

export async function getUsersByType(): Promise<User[]> {
  const query = `
    SELECT u.* FROM beer_olympics u 
    WHERE u._type = "user"
    ORDER BY u.createdAt DESC
  `;
  
  const result = await cluster.query(query);
  return result.rows.map(row => row.u);
}
```

## 📈 **Analytics Queries with Labels**

```sql
-- User registration trends
SELECT DATE_TRUNC_STR(createdAt, 'day') as date, COUNT(*) as new_users
FROM beer_olympics 
WHERE _type = "user"
GROUP BY DATE_TRUNC_STR(createdAt, 'day')
ORDER BY date;

-- Login activity  
SELECT DATE_TRUNC_STR(timestamp, 'hour') as hour, COUNT(*) as logins
FROM beer_olympics
WHERE _type = "login_event" AND successful = true
GROUP BY DATE_TRUNC_STR(timestamp, 'hour')
ORDER BY hour;

-- Tournament statistics
SELECT status, COUNT(*) as count
FROM beer_olympics
WHERE _type = "tournament"  
GROUP BY status;
```

## 🎯 **Best Practices**

1. **Always include `_type`** in every document
2. **Use consistent key prefixes** for logical grouping
3. **Create indexes** on `_type` field for performance
4. **Document your schemas** and key patterns
5. **Use meaningful type names** (e.g., 'user', 'tournament', not 'doc1', 'data')
6. **Include timestamps** (`createdAt`, `updatedAt`) in all documents
7. **Consider data retention** for event documents (login_event, etc.)

This labeling strategy will make your Couchbase database organized, queryable, and maintainable! 🎯