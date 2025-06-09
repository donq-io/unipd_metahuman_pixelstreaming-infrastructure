# Multi-stage Dockerfile for Pixel Streaming React Frontend
# syntax=docker/dockerfile:1

# Build arguments for metadata
ARG BUILD_DATE
ARG VCS_REF

# Stage 1: Build React app
FROM node:18.17.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency resolution
COPY Frontend/implementations/react/package*.json ./

# Configure npm registry and install dependencies using buildkit secrets
# This approach works with CI/CD environments by using environment variables
RUN --mount=type=secret,id=npm_token \
    export NPM_TOKEN=$(cat /run/secrets/npm_token) && \
    echo "@donq.io:registry=https://npm.donq.org/" > ~/.npmrc && \
    echo "//npm.donq.org/:_authToken=\${NPM_TOKEN}" >> ~/.npmrc && \
    npm ci && \
    rm ~/.npmrc

# Copy source code and config files
COPY Frontend/implementations/react/src/ ./src/
COPY Frontend/implementations/react/vite.config.ts ./
COPY Frontend/implementations/react/tsconfig*.json ./
COPY Frontend/implementations/react/index.html ./

# Create output directory and modify vite output for containerized build
RUN mkdir -p dist && \
    sed -i 's|outDir: '\''../../../SignallingWebServer/Public'\''|outDir: '\''dist'\''|g' vite.config.ts && \
    npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Re-declare build arguments for this stage
ARG BUILD_DATE
ARG VCS_REF

# Add OCI labels for metadata
LABEL org.opencontainers.image.title="Pixel Streaming React Frontend"
LABEL org.opencontainers.image.description="Containerized React frontend for Epic Games Pixel Streaming"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${VCS_REF}"
LABEL org.opencontainers.image.vendor="University of Padova"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/your-repo/unipd_metahuman_pixelstreamingInfrastructure"

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx configuration template
RUN mkdir -p /etc/nginx/templates

# Create nginx config template that supports environment variables
COPY <<EOF /etc/nginx/templates/default.conf.template
server {
    listen 80;
    listen [::]:80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Static assets with long-term caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Create environment substitution script
COPY <<'EOF' /docker-entrypoint.d/40-generate-config.sh
#!/bin/sh
set -e

# Default values if environment variables are not set
export REACT_APP_SIGNALLING_SERVER=${REACT_APP_SIGNALLING_SERVER:-ws://localhost:8888}
export REACT_APP_SIGNALLING_HTTP=${REACT_APP_SIGNALLING_HTTP:-http://localhost:8080}

# Create runtime config file that can be loaded by the frontend
cat > /usr/share/nginx/html/runtime-config.js << EOL
window.RUNTIME_CONFIG = {
    SIGNALLING_SERVER_URL: '${REACT_APP_SIGNALLING_SERVER}',
    SIGNALLING_SERVER_HTTP: '${REACT_APP_SIGNALLING_HTTP}',
    AUTO_FETCH_CONFIG: true,
    DEBUG: ${DEBUG:-false}
};
EOL

echo "Generated runtime configuration:"
cat /usr/share/nginx/html/runtime-config.js
EOF

RUN chmod +x /docker-entrypoint.d/40-generate-config.sh

# Set environment variables with defaults
ENV REACT_APP_SIGNALLING_SERVER=ws://localhost:8888
ENV REACT_APP_SIGNALLING_HTTP=http://localhost:8080
ENV DEBUG=false

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

# Use the default nginx entrypoint which will process templates
CMD ["nginx", "-g", "daemon off;"] 