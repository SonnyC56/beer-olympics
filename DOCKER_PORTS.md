# Docker Port Configuration

All containers now use obscure ports to avoid conflicts:

## Main docker-compose.yml

### `app` service (Production)
- **Port 9876** → 3000 (App server)
- Access: http://localhost:9876

### `dev` service (Development)
- **Port 9873** → 5173 (Vite dev server)
- **Port 9874** → 3002 (API server)
- Access: 
  - Frontend: http://localhost:9873
  - API: http://localhost:9874

## docker-compose.dev.yml

### `beer-olympics` service
- **Port 9871** → 5173 (Vite dev server)
- **Port 9872** → 3002 (API server)
- Access:
  - Frontend: http://localhost:9871
  - API: http://localhost:9872

## Docker Commands

```bash
# Start main services
docker-compose up -d

# Start dev-only service
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop all and remove orphans
docker-compose down --remove-orphans
```

All port conflicts have been resolved using these obscure port numbers!