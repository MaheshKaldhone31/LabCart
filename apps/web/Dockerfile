
# ─────────────────────────────────────────────
# Stage 1: Build React/Vite application
# ─────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/worker/package.json ./apps/worker/package.json

RUN npm ci

COPY . .

RUN npm run build --workspace=apps/web

# ─────────────────────────────────────────────
# Stage 2: Serve static files with Nginx
# ─────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Remove the default Nginx site configuration.
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy the Vite production build.
COPY --from=builder /app/apps/web/dist/ /usr/share/nginx/html/

# Copy the custom Nginx configuration from the root build context.
COPY apps/web/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
