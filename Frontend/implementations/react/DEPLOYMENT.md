# Containerized React Frontend Deployment Guide

This guide covers deploying the Pixel Streaming React frontend as a container using various orchestrators, with specific focus on Coolify.

## Quick Start

### Local Development

#### Option 1: Direct Docker Build
```bash
# Build and run the React frontend container
cd Frontend/implementations/react
docker build -f Dockerfile -t pixel-streaming-frontend ../../..
docker run -d -p 3000:80 \
  -e REACT_APP_SIGNALLING_SERVER=ws://your-signalling-server:8888 \
  -e REACT_APP_SIGNALLING_HTTP=http://your-signalling-server:8080 \
  pixel-streaming-frontend
```

#### Option 2: Using Docker Compose
```bash
cd Frontend/implementations/react
docker-compose up --build -d
```

#### Option 3: Using Build Script
```bash
# From repository root
./Frontend/implementations/react/build.sh build
./Frontend/implementations/react/build.sh run
```

Access: http://localhost:3000

**Note**: You need a separate SignallingWebServer running (not containerized) for the frontend to connect to.

## Container Architecture

### Multi-Stage Build
1. **Builder Stage**: Builds the library, ui-library, and React app
2. **Production Stage**: Serves with nginx for optimal performance

### Runtime Configuration
The container supports runtime environment variables:
- `REACT_APP_SIGNALLING_SERVER`: WebSocket URL for signalling server
- `REACT_APP_SIGNALLING_HTTP`: HTTP URL for signalling server  
- `DEBUG`: Enable debug mode

## Deployment Options

### 1. Coolify Deployment

#### Method A: Direct Dockerfile
1. Create a new project in Coolify
2. Set the Git repository URL
3. Set build context to repository root
4. Set Dockerfile path: `Frontend/implementations/react/Dockerfile`
5. Configure environment variables:

```env
REACT_APP_SIGNALLING_SERVER=wss://your-signalling-server.com:8888
REACT_APP_SIGNALLING_HTTP=https://your-signalling-server.com:8080
DEBUG=false
```

### 2. Docker Swarm
```yaml
version: '3.8'
services:
  pixel-streaming-frontend:
    image: your-registry/pixel-streaming-frontend:latest
    ports:
      - "80:80"
    environment:
      - REACT_APP_SIGNALLING_SERVER=wss://signalling.example.com:8888
      - REACT_APP_SIGNALLING_HTTP=https://signalling.example.com:8080
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 3. Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pixel-streaming-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pixel-streaming-frontend
  template:
    metadata:
      labels:
        app: pixel-streaming-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/pixel-streaming-frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: REACT_APP_SIGNALLING_SERVER
          value: "wss://signalling.example.com:8888"
        - name: REACT_APP_SIGNALLING_HTTP
          value: "https://signalling.example.com:8080"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: pixel-streaming-frontend-service
spec:
  selector:
    app: pixel-streaming-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

## Build Commands

### Manual Build
```bash
# From repository root
docker build -f Frontend/implementations/react/Dockerfile -t pixel-streaming-frontend .
```

### CI/CD Pipeline Example (GitHub Actions)
```yaml
name: Build and Deploy Frontend
on:
  push:
    branches: [main]
    paths: ['Frontend/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: |
        docker build -f Frontend/implementations/react/Dockerfile \
          -t ghcr.io/${{ github.repository }}/frontend:${{ github.sha }} .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
        docker push ghcr.io/${{ github.repository }}/frontend:${{ github.sha }}
```

## Environment Configuration

### Development
```env
REACT_APP_SIGNALLING_SERVER=ws://localhost:8888
REACT_APP_SIGNALLING_HTTP=http://localhost:8080
DEBUG=true
```

### Staging
```env
REACT_APP_SIGNALLING_SERVER=wss://staging-signalling.example.com:8888
REACT_APP_SIGNALLING_HTTP=https://staging-signalling.example.com:8080
DEBUG=false
```

### Production
```env
REACT_APP_SIGNALLING_SERVER=wss://signalling.example.com:8888
REACT_APP_SIGNALLING_HTTP=https://signalling.example.com:8080
DEBUG=false
```

## SignallingWebServer Setup

Since only the React frontend is containerized, you need to run the SignallingWebServer separately. Make sure it's configured for separate frontend hosting:

1. Use the separate frontend configuration:
```bash
cd SignallingWebServer/platform_scripts/bash
./Start_SignallingServer.sh --configFile ../../config-separate-frontend.json
```

2. Ensure the SignallingWebServer has CORS enabled and allows your frontend domain.

## Monitoring and Logging

### Health Checks
The container provides health endpoints:
- `/health`: Simple health check
- Kubernetes/Docker health checks included

### Logging
Nginx access and error logs are available:
```bash
docker logs <container-id>
```

### Metrics
For production monitoring, consider adding:
- Prometheus metrics endpoint
- Application performance monitoring
- Log aggregation (ELK stack, etc.)

## Security Considerations

### Production Checklist
- [ ] Use HTTPS for signalling server connections
- [ ] Configure proper CORS origins on signalling server
- [ ] Enable security headers (included in nginx config)
- [ ] Use non-root user (included in Dockerfile)
- [ ] Scan images for vulnerabilities
- [ ] Keep base images updated

### Network Security
- Configure firewalls to allow only necessary ports
- Use private networks where possible
- Implement proper authentication if needed

## Troubleshooting

### Common Issues

1. **Can't connect to signalling server**
   - Check environment variables are correctly set
   - Verify network connectivity between container and signalling server
   - Check CORS configuration on signalling server
   - Ensure signalling server is running with separate frontend config

2. **Build failures**
   - Ensure all dependencies are available
   - Check Node.js version compatibility
   - Verify Dockerfile context is repository root

3. **Runtime errors**
   - Check browser console for JavaScript errors
   - Verify signalling server is running and accessible
   - Check network connectivity

### Debug Commands
```bash
# Check container logs
docker logs <container-id>

# Access container shell
docker exec -it <container-id> /bin/sh

# Test health endpoint
curl http://localhost/health

# Check nginx configuration
docker exec <container-id> nginx -t

# Test signalling server connectivity from container
docker exec <container-id> wget -qO- http://your-signalling-server:8080/health
```

## Performance Optimization

### CDN Integration
Consider using a CDN for static assets:
- AWS CloudFront
- Azure CDN
- Cloudflare

### Caching Strategy
- Static assets cached for 1 year
- HTML files with short cache duration
- Enable gzip compression (included)

### Resource Limits
Recommended container resources:
- **Memory**: 256Mi - 512Mi
- **CPU**: 250m - 500m (0.25 - 0.5 cores)

## Scaling

### Horizontal Scaling
The frontend is stateless and can be scaled horizontally:
- Multiple replicas behind a load balancer
- Auto-scaling based on CPU/memory usage
- Geographic distribution for global users

### Load Balancing
Use appropriate load balancing strategies:
- Round-robin for even distribution
- Least connections for varying request sizes
- Geographic routing for global deployments

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────────┐
│   React Frontend│    │  SignallingWebServer │
│   (Containerized)│    │  (Non-containerized) │
│                 │    │                      │
│ ┌─────────────┐ │    │ ┌─────────────────┐  │
│ │   nginx     │ │    │ │    Node.js      │  │
│ │   (port 80) │ │◄───┤ │   (port 8080)   │  │
│ └─────────────┘ │    │ │   (port 8888)   │  │
│                 │    │ └─────────────────┘  │
└─────────────────┘    └──────────────────────┘
``` 