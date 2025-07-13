# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Skip Puppeteer download to avoid connection issues
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/vercel.json ./vercel.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/index.html ./index.html

# Expose port
EXPOSE 3000

# Start the application
CMD ["npx", "vercel", "dev", "--listen", "3000"]