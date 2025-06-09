# Environment Configuration

This React frontend supports flexible configuration through environment variables for different deployment scenarios.

## Environment Variables

### Vite Environment Variables (Build-time)

These variables are embedded into the built application and must be set during the build process:

#### Full URL Configuration (Recommended)
```bash
# Complete websocket URL
VITE_SIGNALLING_SERVER_URL=wss://your-domain.com:8888

# Complete HTTP URL  
VITE_SIGNALLING_SERVER_HTTP=https://your-domain.com:8080
```

#### Granular Configuration
```bash
# Host configuration (will auto-detect protocol based on current page)
VITE_SIGNALLING_HOST=your-domain.com

# Port configuration  
VITE_SIGNALLING_WS_PORT=8888      # Websocket port
VITE_SIGNALLING_HTTP_PORT=8080    # HTTP port

# Debug configuration
VITE_DEBUG=true                   # Enable debug logging
VITE_VERBOSE_LOGGING=true         # Enable verbose logging
```

## Usage Examples

### Local Development
No configuration needed - automatically uses `localhost:8888` and `localhost:8080`

### Staging/Production with Environment Variables

#### Option 1: Full URLs (Recommended)
```bash
# For staging
VITE_SIGNALLING_SERVER_URL=wss://staging.example.com:8888
VITE_SIGNALLING_SERVER_HTTP=https://staging.example.com:8080

# For production
VITE_SIGNALLING_SERVER_URL=wss://app.example.com:8888  
VITE_SIGNALLING_SERVER_HTTP=https://app.example.com:8080
```

#### Option 2: Host-based Configuration
```bash
# Will auto-detect protocol (wss for https, ws for http)
VITE_SIGNALLING_HOST=staging.example.com
VITE_SIGNALLING_WS_PORT=8888
VITE_SIGNALLING_HTTP_PORT=8080
```

### Coolify Configuration

In your Coolify project, set these as **Build Arguments** (not environment variables):

```
NPM_TOKEN=$NPM_TOKEN
VITE_SIGNALLING_SERVER_URL=wss://your-domain.com:8888
VITE_SIGNALLING_SERVER_HTTP=https://your-domain.com:8080
```

### Docker Build Examples

#### Basic Build
```bash
docker build \
  --build-arg NPM_TOKEN="your-token" \
  --build-arg VITE_SIGNALLING_HOST="your-domain.com" \
  -t pixel-streaming-frontend .
```

#### Full Configuration
```bash
docker build \
  --build-arg NPM_TOKEN="your-token" \
  --build-arg VITE_SIGNALLING_SERVER_URL="wss://your-domain.com:8888" \
  --build-arg VITE_SIGNALLING_SERVER_HTTP="https://your-domain.com:8080" \
  --build-arg VITE_DEBUG="true" \
  -t pixel-streaming-frontend .
```

#### Using Environment File
Create `.env.production`:
```bash
VITE_SIGNALLING_SERVER_URL=wss://production.example.com:8888
VITE_SIGNALLING_SERVER_HTTP=https://production.example.com:8080
VITE_DEBUG=false
VITE_VERBOSE_LOGGING=false
```

Then build:
```bash
docker build --env-file .env.production --build-arg NPM_TOKEN="your-token" -t pixel-streaming-frontend .
```

## Configuration Priority

The configuration is resolved in this order (highest to lowest priority):

1. **VITE_SIGNALLING_SERVER_URL** / **VITE_SIGNALLING_SERVER_HTTP** (complete URLs)
2. **VITE_SIGNALLING_HOST** + **VITE_SIGNALLING_WS_PORT** / **VITE_SIGNALLING_HTTP_PORT**
3. **Auto-detection** based on current page URL
4. **Localhost defaults** (development fallback)

## Debug Information

When the application loads, check the browser console for configuration details:

```javascript
Pixel Streaming App Configuration: {
  url: "https://your-domain.com",
  hostname: "your-domain.com",
  protocol: "https:",
  signallingServer: "wss://your-domain.com:8888",
  signallingHTTP: "https://your-domain.com:8080",
  autoFetchConfig: true,
  debug: false
}
```

## Common Scenarios

### Behind Reverse Proxy
If your signalling server is behind a reverse proxy on standard ports:
```bash
VITE_SIGNALLING_SERVER_URL=wss://your-domain.com/ws
VITE_SIGNALLING_SERVER_HTTP=https://your-domain.com/api
```

### Custom Port Setup
If using non-standard ports:
```bash
VITE_SIGNALLING_HOST=your-domain.com
VITE_SIGNALLING_WS_PORT=9999
VITE_SIGNALLING_HTTP_PORT=8080
```

### Development with Remote Server
For local development connecting to remote signalling server:
```bash
VITE_SIGNALLING_SERVER_URL=wss://dev.example.com:8888
VITE_SIGNALLING_SERVER_HTTP=https://dev.example.com:8080
```

## Troubleshooting

1. **Check console logs** for configuration details
2. **Verify websocket connection** in Network tab
3. **Ensure correct protocol** (ws vs wss, http vs https)
4. **Check firewall/proxy** settings for websocket support
5. **Verify signalling server** is running on expected ports 