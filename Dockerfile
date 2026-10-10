# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# Build-time API Base URL argument
ARG VITE_API_BASE_URL=http://localhost:8081/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ==========================================
# Stage 2: Production Web Server Stage
# ==========================================
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Install wget for healthcheck
RUN apk add --no-cache wget

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist .

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
