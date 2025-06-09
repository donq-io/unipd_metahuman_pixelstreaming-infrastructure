// Configuration for standalone React frontend
export const config = {
    // Signalling server configuration
    SIGNALLING_SERVER_URL: process.env.REACT_APP_SIGNALLING_SERVER || 'ws://localhost:8888',
    SIGNALLING_SERVER_HTTP: process.env.REACT_APP_SIGNALLING_HTTP || 'http://localhost:8080',
    
    // WebRTC Configuration - will be fetched from server
    AUTO_FETCH_CONFIG: true,
    
    // Fallback WebRTC configuration
    FALLBACK_ICE_SERVERS: [
        { urls: ['stun:stun.l.google.com:19302'] }
    ],
    
    // Connection settings
    AUTO_CONNECT: true,
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 3000,
    
    // Debug settings
    DEBUG: process.env.NODE_ENV === 'development',
    VERBOSE_LOGGING: false
};

// Function to fetch configuration from signalling server
export async function fetchServerConfig() {
    try {
        const response = await fetch(`${config.SIGNALLING_SERVER_HTTP}/config`);
        if (response.ok) {
            const serverConfig = await response.json();
            console.log('Fetched server configuration:', serverConfig);
            return serverConfig;
        } else {
            console.warn('Failed to fetch server config, using fallback');
            return null;
        }
    } catch (error) {
        console.error('Error fetching server config:', error);
        return null;
    }
}

// Health check function
export async function checkServerHealth() {
    try {
        const response = await fetch(`${config.SIGNALLING_SERVER_HTTP}/health`);
        if (response.ok) {
            const health = await response.json();
            console.log('Server health check:', health);
            return health;
        } else {
            return { status: 'unhealthy', error: 'Server returned non-200 status' };
        }
    } catch (error) {
        console.error('Health check failed:', error);
        return { status: 'unreachable', error: error.message };
    }
} 