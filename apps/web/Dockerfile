# ✅ Stage 1 — Build frontend
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# ✅ Stage 2 — Serve using Nginx (lightweight)
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]