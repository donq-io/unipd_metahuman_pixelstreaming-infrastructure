// Configuration for standalone React frontend

interface ConfigType {
    SIGNALLING_SERVER_URL: string;
    SIGNALLING_SERVER_HTTP: string;
    AUTO_FETCH_CONFIG: boolean;
    FALLBACK_ICE_SERVERS: { urls: string[] }[];
    AUTO_CONNECT: boolean;
    RECONNECT_ATTEMPTS: number;
    RECONNECT_DELAY: number;
    DEBUG: boolean;
    VERBOSE_LOGGING: boolean;
}

// Function to get environment-aware configuration
const getSignallingServerUrl = (): string => {
    // Check if full URL is provided via environment variable
    const envUrl = import.meta.env.VITE_SIGNALLING_SERVER_URL;
    if (envUrl) {
        console.log('Using environment variable VITE_SIGNALLING_SERVER_URL:', envUrl);
        return envUrl;
    }

    // Get host and port from environment or use defaults
    const envHost = import.meta.env.VITE_SIGNALLING_HOST;
    const envPort = import.meta.env.VITE_SIGNALLING_WS_PORT;

    let host: string;
    let port: string;
    let protocol: string;

    if (envHost) {
        // Use environment host
        host = envHost;
        port = envPort || '8888';
        protocol = host.includes('localhost') ? 'ws:' : 
                  (window.location.protocol === 'https:' ? 'wss:' : 'ws:');
        console.log('Using environment host configuration:', { host, port, protocol });
    } else {
        // Auto-detect based on current location
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' || 
                           window.location.hostname === '';

        if (isLocalhost) {
            host = 'localhost';
            port = '8888';
            protocol = 'ws:';
        } else {
            host = window.location.hostname;
            port = envPort || '8888';
            protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        }
        console.log('Auto-detected host configuration:', { host, port, protocol });
    }

    return `${protocol}//${host}:${port}`;
};

const getSignallingServerHttp = (): string => {
    // Check if full URL is provided via environment variable
    const envUrl = import.meta.env.VITE_SIGNALLING_SERVER_HTTP;
    if (envUrl) {
        console.log('Using environment variable VITE_SIGNALLING_SERVER_HTTP:', envUrl);
        return envUrl;
    }

    // Get host and port from environment or use defaults
    const envHost = import.meta.env.VITE_SIGNALLING_HOST;
    const envPort = import.meta.env.VITE_SIGNALLING_HTTP_PORT;

    let host: string;
    let port: string;
    let protocol: string;

    if (envHost) {
        // Use environment host
        host = envHost;
        port = envPort || '8080';
        protocol = host.includes('localhost') ? 'http:' : 
                  (window.location.protocol === 'https:' ? 'https:' : 'http:');
        console.log('Using environment host configuration for HTTP:', { host, port, protocol });
    } else {
        // Auto-detect based on current location
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' || 
                           window.location.hostname === '';

        if (isLocalhost) {
            host = 'localhost';
            port = '8080';
            protocol = 'http:';
        } else {
            host = window.location.hostname;
            port = envPort || '8080';
            protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        }
        console.log('Auto-detected HTTP host configuration:', { host, port, protocol });
    }

    return `${protocol}//${host}:${port}`;
};

export const config: ConfigType = {
    // Signalling server configuration
    SIGNALLING_SERVER_URL: getSignallingServerUrl(),
    SIGNALLING_SERVER_HTTP: getSignallingServerHttp(),
    
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
    DEBUG: import.meta.env.VITE_DEBUG === 'true' || window.location.hostname === 'localhost',
    VERBOSE_LOGGING: import.meta.env.VITE_VERBOSE_LOGGING === 'true'
};

// Function to fetch configuration from signalling server
export async function fetchServerConfig(): Promise<any | null> {
    try {
        console.log(`Fetching server config from: ${config.SIGNALLING_SERVER_HTTP}/config`);
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
export async function checkServerHealth(): Promise<{ status: string; error?: string }> {
    try {
        console.log(`Checking server health at: ${config.SIGNALLING_SERVER_HTTP}/health`);
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
        return { status: 'unreachable', error: (error as Error).message };
    }
} 