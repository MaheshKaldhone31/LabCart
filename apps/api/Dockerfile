
# ─────────────────────────────────────────────
# Stage 1: Build API using root npm workspaces
# ─────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching.
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/worker/package.json ./apps/worker/package.json

# Install exactly the dependencies recorded in the root lockfile.
RUN npm ci

# Copy application source.
COPY . .

# Build the API workspace with its local TypeScript compiler.
RUN npm run build --workspace=apps/api

# Remove development dependencies after compilation.
RUN npm prune --omit=dev

# ─────────────────────────────────────────────
# Stage 2: Production API runtime
# ─────────────────────────────────────────────
FROM node:22-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

# Copy production dependencies and the compiled API.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]
