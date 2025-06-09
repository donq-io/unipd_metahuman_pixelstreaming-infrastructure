# Separate Frontend Setup Guide

This guide explains how to host the Pixel Streaming frontend separately from the SignallingWebServer, enabling distributed deployments and better scalability.

## Overview

The default setup bundles the frontend with the SignallingWebServer. With separate hosting, you can:
- Deploy the frontend on CDNs or static hosting services
- Scale frontend and backend independently
- Use different domains for frontend and backend
- Implement custom deployment strategies

## Configuration

### SignallingWebServer Configuration

Use one of the provided configuration files:

#### Development Setup
```bash
# Start with development config (allows all origins)
./Start_SignallingServer.sh --configFile config-separate-frontend.json
```

#### Production Setup
```bash
# Start with production config (restricted origins)
./Start_SignallingServer.sh --configFile config-separate-frontend-production.json
```

### Key Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `SeparateFrontend` | Disables local static file serving | `true` |
| `EnableCORS` | Enables CORS headers | `true` |
| `AllowedOrigins` | Allowed frontend origins | `["https://frontend.com"]` |
| `WebSocketOriginCheck` | Validates WebSocket origins | `true` for production |

### Frontend Configuration

The frontend needs to know where to connect to the SignallingWebServer:

```javascript
// Environment variables
REACT_APP_SIGNALLING_SERVER=ws://your-server:8888
REACT_APP_SIGNALLING_HTTP=http://your-server:8080
```

## API Endpoints

When `SeparateFrontend` is enabled, the SignallingWebServer provides these endpoints:

### GET /health
Health check endpoint
```json
{
  "status": "healthy",
  "timestamp": "2025-01-11T10:30:00Z",
  "signallingServer": true,
  "webSocketPort": 8888
}
```

### GET /config
Frontend configuration endpoint
```json
{
  "webSocketUrl": "ws://localhost:8888",
  "peerConnectionOptions": {
    "iceServers": [...]
  },
  "publicIp": "localhost",
  "enableWebRTC": true
}
```

### GET /
Server information (when frontend is separate)
```json
{
  "message": "Pixel Streaming Signalling Server",
  "frontendHostedSeparately": true,
  "webSocketUrl": "ws://localhost:8888",
  "configEndpoint": "/config",
  "healthEndpoint": "/health"
}
```

## Deployment Examples

### Example 1: Frontend on Vercel, Backend on VPS

1. **Deploy SignallingWebServer on VPS:**
```bash
# config-production.json
{
  "SeparateFrontend": true,
  "EnableCORS": true,
  "AllowedOrigins": ["https://your-app.vercel.app"],
  "PublicIp": "your-vps-ip",
  "UseHTTPS": true
}
```

2. **Deploy React Frontend to Vercel:**
```bash
# Environment variables in Vercel
REACT_APP_SIGNALLING_SERVER=wss://your-vps-ip:8888
REACT_APP_SIGNALLING_HTTP=https://your-vps-ip:8080
```

### Example 2: Frontend on AWS S3, Backend on AWS EC2

1. **EC2 Configuration:**
```json
{
  "SeparateFrontend": true,
  "AllowedOrigins": ["https://your-bucket.s3.amazonaws.com"],
  "PublicIp": "ec2-instance-ip"
}
```

2. **S3 Static Website:**
- Build React app
- Upload to S3 bucket
- Configure environment variables in build

## Security Considerations

### Production Settings
- Set `WebSocketOriginCheck: true`
- Specify exact domains in `AllowedOrigins`
- Use HTTPS for both frontend and backend
- Enable SSL certificate validation

### Network Configuration
- Open WebSocket port (default 8888) on firewall
- Consider using a reverse proxy (nginx/Apache)
- Implement rate limiting if needed

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check `AllowedOrigins` configuration
   - Ensure `EnableCORS` is true
   - Verify origin matches exactly (including protocol)

2. **WebSocket Connection Failed:**
   - Check `WebSocketOriginCheck` setting
   - Verify WebSocket port is open
   - Check if origin is allowed

3. **Configuration Not Loading:**
   - Verify `/config` endpoint is accessible
   - Check CORS settings for HTTP requests
   - Ensure SignallingWebServer is running

### Debug Steps

1. Check server health:
```bash
curl http://your-server:8080/health
```

2. Verify configuration:
```bash
curl http://your-server:8080/config
```

3. Test CORS:
```bash
curl -H "Origin: https://your-frontend.com" http://your-server:8080/config
```

## Migration from Integrated Setup

1. Update your deployment scripts to use separate configs
2. Modify frontend build process to include environment variables
3. Deploy frontend to your chosen hosting service
4. Update DNS/CDN settings if needed
5. Test thoroughly before switching production traffic

## Benefits

- **Scalability:** Scale frontend and backend independently
- **Performance:** Use CDNs for faster frontend delivery
- **Flexibility:** Choose optimal hosting for each component
- **Security:** Separate concerns and apply appropriate security measures
- **Development:** Teams can work on frontend/backend independently 