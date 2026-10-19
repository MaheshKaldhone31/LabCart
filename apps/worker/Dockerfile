
# ─────────────────────────────────────────────
# Stage 1: Build worker using root npm workspaces
# ─────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/worker/package.json ./apps/worker/package.json

RUN npm ci

COPY . .

# Compile the worker with its local TypeScript compiler.
RUN npm run build --workspace=apps/worker

# Remove development dependencies after compilation.
RUN npm prune --omit=dev

# ─────────────────────────────────────────────
# Stage 2: Production worker runtime
# ─────────────────────────────────────────────
FROM node:22-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

CMD ["node", "apps/worker/dist/index.js"]
