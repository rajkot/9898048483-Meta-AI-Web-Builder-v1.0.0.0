# Multi-Stage Dockerfile for Meta-AI Web Builder

# Stage 1: Build Dependencies & Compile Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Vite frontend and bundled Node server
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package descriptors and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application output from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Launch application server
CMD ["node", "dist/server.cjs"]
