# ✅ Stage 1 — Build
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compile TypeScript
RUN npx tsc


# ✅ Stage 2 — Production Runtime
FROM node:20-slim

WORKDIR /app

# Copy built files only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install ONLY production dependencies
RUN npm install --omit=dev

EXPOSE 4000

CMD ["node", "dist/index.js"]