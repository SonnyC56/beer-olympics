# Local Development Guide

## Couchbase Development Options

You have three options for Couchbase development, listed from easiest to most complex:

### Option 1: Use Production Couchbase Capella (Recommended)

**Pros**: 
- No local setup required
- Same environment as production
- Already configured and working

**Cons**:
- Uses production data (can be mitigated with separate dev bucket)
- Requires internet connection

**Setup**:
```bash
# Use your existing .env.local with production credentials
# Already working with your current setup
npm run test:couchbase  # Test connection
```

### Option 2: Couchbase Capella Developer Trial (Recommended for Team Development)

**Pros**:
- Cloud-hosted like production
- Free tier available
- Separate from production
- Easy to share with team

**Setup**:
1. Go to [Couchbase Capella](https://cloud.couchbase.com)
2. Create free developer account
3. Create new cluster
4. Create bucket named `beer_olympics_dev`
5. Update environment variables:

```bash
# Add to .env.local
COUCHBASE_CONNECTION_STRING=couchbases://cb.dev-cluster.cloud.couchbase.com
COUCHBASE_USERNAME=dev_user
COUCHBASE_PASSWORD=dev_password
COUCHBASE_BUCKET=beer_olympics_dev
```

### Option 3: Local Couchbase Server (Advanced)

**Pros**:
- Completely offline development
- Full control over database
- Fast development cycles

**Cons**:
- Complex setup
- Resource intensive
- Different from production environment

**Setup with Docker**:

```bash
# Create docker-compose.yml
cat > docker-compose.dev.yml << EOF
version: '3.8'
services:
  couchbase:
    image: couchbase:enterprise-7.2.0
    ports:
      - "8091-8096:8091-8096"
      - "11210-11211:11210-11211"
    environment:
      - CLUSTER_NAME=beer-olympics-dev
      - CLUSTER_USERNAME=Administrator
      - CLUSTER_PASSWORD=password123
      - CLUSTER_RAMSIZE=1024
      - CLUSTER_INDEX_RAMSIZE=512
    volumes:
      - couchbase_data:/opt/couchbase/var
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8091/pools || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  couchbase_data:
EOF

# Start Couchbase
docker-compose -f docker-compose.dev.yml up -d

# Wait for health check to pass
docker-compose -f docker-compose.dev.yml ps

# Initialize cluster (run after container is healthy)
./scripts/init-local-couchbase.sh
```

**Local Setup Script**:

```bash
# Create scripts/init-local-couchbase.sh
cat > scripts/init-local-couchbase.sh << 'EOF'
#!/bin/bash

echo "Initializing local Couchbase cluster..."

# Wait for Couchbase to be ready
echo "Waiting for Couchbase to start..."
until curl -f http://localhost:8091/pools 2>/dev/null; do
  sleep 5
done

# Initialize cluster
curl -X POST http://localhost:8091/pools/default \
  -d memoryQuota=1024 \
  -d indexMemoryQuota=512

# Set cluster credentials
curl -X POST http://localhost:8091/settings/web \
  -d port=8091 \
  -d username=Administrator \
  -d password=password123

# Create bucket
curl -X POST http://localhost:8091/pools/default/buckets \
  -u Administrator:password123 \
  -d name=beer_olympics \
  -d ramQuotaMB=512 \
  -d bucketType=couchbase

echo "Local Couchbase cluster initialized!"
echo "Web UI: http://localhost:8091"
echo "Username: Administrator"
echo "Password: password123"
EOF

chmod +x scripts/init-local-couchbase.sh
```

**Local Environment Variables**:
```bash
# Add to .env.local for local Couchbase
COUCHBASE_CONNECTION_STRING=couchbase://localhost:11210
COUCHBASE_USERNAME=Administrator
COUCHBASE_PASSWORD=password123
COUCHBASE_BUCKET=beer_olympics
```

## Development Database Scripts

### Test Connection
```bash
npm run test:couchbase
```

### Initialize Schema and Indexes
```bash
npm run init:couchbase
```

### Create Sample Data
```bash
CREATE_SAMPLE_DATA=true npm run init:couchbase
```

### Reset Development Database
```bash
npm run reset:couchbase
```

## Recommended Development Workflow

### 1. **Start Development** (Use Option 1 - Production Capella)
```bash
# Clone repo
git clone <repo>
cd beer-olympics

# Install dependencies
npm install

# Copy environment variables
cp .env.local .env.local

# Test database connection
npm run test:couchbase

# Start development server
npm run dev
```

### 2. **Switch to Development Database** (Optional)
If you want isolated development data:

1. Create new Couchbase Capella cluster (free tier)
2. Update `.env.local` with dev cluster credentials
3. Initialize schema: `npm run init:couchbase`
4. Create sample data: `CREATE_SAMPLE_DATA=true npm run init:couchbase`

### 3. **Database Development Cycle**
```bash
# Make schema changes
# Edit src/services/couchbase.ts or add new collections

# Test changes
npm run test:couchbase

# Update indexes if needed
npm run init:couchbase

# Reset database for clean state
npm run reset:couchbase
```

## Environment Configuration

### Development (.env.local)
```bash
# Database
COUCHBASE_CONNECTION_STRING=couchbases://cb.your-dev-cluster.cloud.couchbase.com
COUCHBASE_USERNAME=dev_user
COUCHBASE_PASSWORD=dev_password
COUCHBASE_BUCKET=beer_olympics_dev

# Auth (for real OAuth testing)
AUTH_SECRET=dev-secret-change-in-production
AUTH_URL=http://localhost:5173
AUTH_GOOGLE_ID=your-dev-google-client-id
AUTH_GOOGLE_SECRET=your-dev-google-secret

# Application
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5173
NODE_ENV=development

# Real-time (optional for development)
PUSHER_APP_ID=dev-app-id
PUSHER_KEY=dev-key
PUSHER_SECRET=dev-secret
PUSHER_CLUSTER=us2
VITE_PUSHER_KEY=dev-key
VITE_PUSHER_CLUSTER=us2
```

### Testing (.env.test)
```bash
# Use in-memory or mock database for tests
COUCHBASE_CONNECTION_STRING=mock://localhost
COUCHBASE_USERNAME=test
COUCHBASE_PASSWORD=test
COUCHBASE_BUCKET=test_bucket

# Mock auth
AUTH_SECRET=test-secret-key
AUTH_URL=http://localhost:3000
```

## Database Management Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "test:couchbase": "node scripts/test-couchbase.js",
    "init:couchbase": "node scripts/init-couchbase.js",
    "reset:couchbase": "node scripts/reset-couchbase.js",
    "backup:couchbase": "node scripts/backup-couchbase.js",
    "restore:couchbase": "node scripts/restore-couchbase.js"
  }
}
```

## Troubleshooting Local Development

### Common Issues

1. **Connection Timeouts**
```bash
# Increase timeouts in development
# Edit src/services/couchbase.ts
timeouts: {
  kvTimeout: 15000,    // Increase from 10000
  queryTimeout: 30000, // Increase from 20000
}
```

2. **Docker Couchbase Issues**
```bash
# Check container logs
docker-compose -f docker-compose.dev.yml logs couchbase

# Restart container
docker-compose -f docker-compose.dev.yml restart couchbase

# Reset volume (DELETES ALL DATA)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

3. **Index Creation Failures**
```bash
# Check if indexes exist
curl -u Administrator:password123 \
  "http://localhost:8091/query/service" \
  -d "statement=SELECT name FROM system:indexes WHERE keyspace_id='beer_olympics'"

# Drop and recreate indexes
npm run reset:couchbase
npm run init:couchbase
```

4. **Authentication Issues**
```bash
# Test auth endpoints directly
curl http://localhost:5173/api/auth/me
curl http://localhost:5173/api/auth/google

# Check cookie parsing
# Enable debug logging in auth service
```

## Development Best Practices

### 1. **Database Isolation**
- Use separate development bucket/cluster
- Never test destructive operations on production data
- Use sample data for development

### 2. **Connection Management**
- Reuse connections in development
- Close connections in test cleanup
- Monitor connection pool usage

### 3. **Query Development**
- Test queries in Couchbase Web UI first
- Use EXPLAIN to check query performance
- Create appropriate indexes for new queries

### 4. **Error Handling**
- Log full errors in development
- Test error scenarios (network failure, invalid data)
- Use different error handling for dev vs production

### 5. **Performance Testing**
- Monitor query execution times
- Test with realistic data volumes
- Profile memory usage during development

This setup provides flexibility for different development preferences while maintaining consistency with the production environment.