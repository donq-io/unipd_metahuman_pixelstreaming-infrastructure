# Backend-Only Scripts for Pixel Streaming Infrastructure

These scripts allow you to run the Pixel Streaming signalling server infrastructure without building or serving the frontend, which is useful when you've deployed the frontend separately (e.g., on a different hosting platform).

## Available Scripts

### 1. `Start_BackendOnly_WithTURN.ps1`
**Full backend infrastructure with TURN/STUN servers**

This script starts:
- Cirrus signalling server (WebSocket server for WebRTC negotiation)
- TURN server (for NAT traversal)
- STUN server (for NAT discovery)

Use this for production deployments where clients may be behind NATs or firewalls.

```powershell
.\Start_BackendOnly_WithTURN.ps1
```

### 2. `Start_BackendOnly_Simple.ps1`
**Simple signalling server only**

This script starts only:
- Cirrus signalling server

Use this for development or when you have a simple network setup without NAT issues.

```powershell
.\Start_BackendOnly_Simple.ps1
```

## Command Line Options

Both main scripts accept the same options as the original scripts:

- `--publicip <IP>` - Set the public IP address (auto-detected by default)
- `--turn <server:port>` - Specify TURN server (default: auto-detected IP:19303)
- `--stun <server:port>` - Specify STUN server (default: stun.l.google.com:19302)
- `--help` - Show usage information

Additional Cirrus options can be passed and will be forwarded to the server.

## Examples

### Basic usage with auto-detected settings:
```powershell
.\Start_BackendOnly_WithTURN.ps1
```

### Specify custom public IP:
```powershell
.\Start_BackendOnly_WithTURN.ps1 --publicip 203.0.113.10
```

### Use custom STUN/TURN servers:
```powershell
.\Start_BackendOnly_WithTURN.ps1 --stun mystun.example.com:19302 --turn myturn.example.com:3478
```

### Pass additional Cirrus options:
```powershell
.\Start_BackendOnly_WithTURN.ps1 --HttpPort 8080 --HttpsPort 8443
```

## Frontend Configuration

When using these backend-only scripts, make sure your separately hosted frontend is configured to connect to the correct signalling server endpoint:

- **Player connections**: Connect to HTTP/HTTPS ports (default 80/443)
- **Streamer connections**: Connect to streamer port (default 8888)

Example frontend configuration:
```javascript
// For players (React app, web browsers)
ss: "https://your-signalling-server.com"  // Port 443 (HTTPS)

// For Unreal Engine streamers
// Connect to port 8888
```

## Key Differences from Original Scripts

1. **No Frontend Building**: These scripts skip all frontend build steps
2. **UseFrontend=false**: Cirrus is configured not to serve frontend files
3. **Faster Startup**: No time spent on frontend compilation
4. **Lighter Dependencies**: Only backend-related setup is performed

## Troubleshooting

- If you get dependency errors, run `setup.bat` manually first
- Check firewall settings for the required ports (80/443 for players, 8888 for streamers, 19303 for TURN)
- Verify your frontend is connecting to the player port, not the streamer port
- Use `--help` option to see all available parameters 