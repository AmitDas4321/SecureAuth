# ==========================================
# SecureAuth - Multi-stage Production Dockerfile
# ==========================================

# ------------------------------------------
# Stage 1: Build & bundle client and server
# ------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies (including devDependencies required for vite & esbuild)
RUN npm ci || npm install

# Copy source code and configuration files
COPY . .

# Compile client frontend (Vite) and server bundle (esbuild) into dist/
RUN npm run build

# ------------------------------------------
# Stage 2: Production runtime image
# ------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package descriptors and install only production dependencies
COPY package*.json ./
RUN (npm ci --omit=dev || npm install --omit=dev) && npm cache clean --force

# Copy built production assets from builder stage
COPY --from=builder /app/dist ./dist

# Create and set user permissions
RUN chown -R node:node /app

# Switch to non-root user for security best practices
USER node

# Expose production port
EXPOSE 3000

# Docker healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Start production server
CMD ["node", "dist/server.cjs"]
