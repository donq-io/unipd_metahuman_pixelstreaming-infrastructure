// Copyright Epic Games, Inc. All Rights Reserved.

import React from 'react';
import { PixelStreamingWrapper } from './PixelStreamingWrapper';

// Error Boundary Component
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
                    <h2>Something went wrong.</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.error && this.state.error.stack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

// Interface for runtime configuration
interface RuntimeConfig {
    SIGNALLING_SERVER_URL?: string;
    SIGNALLING_SERVER_HTTP?: string;
    AUTO_FETCH_CONFIG?: boolean;
    DEBUG?: boolean;
}

// Function to get runtime configuration
const getRuntimeConfig = (): RuntimeConfig => {
    // Check if runtime config was injected by Docker
    const windowConfig = (window as any).RUNTIME_CONFIG;
    if (windowConfig) {
        console.log('Using runtime config from window:', windowConfig);
        return windowConfig;
    }

    // Fallback to default configuration
    return {
        SIGNALLING_SERVER_URL: undefined,
        SIGNALLING_SERVER_HTTP: undefined,
        AUTO_FETCH_CONFIG: true,
        DEBUG: false
    };
};

// Function to get the appropriate websocket URL based on environment
const getSignallingServerUrl = (): string => {
    const runtimeConfig = getRuntimeConfig();
    
    // If explicitly configured via runtime config, use that
    if (runtimeConfig.SIGNALLING_SERVER_URL) {
        console.log('Using runtime config signalling server:', runtimeConfig.SIGNALLING_SERVER_URL);
        return runtimeConfig.SIGNALLING_SERVER_URL;
    }

    // Check if we're in development (localhost)
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.hostname === '';

    if (isLocalhost) {
        // Development environment - use localhost
        console.log('Development environment detected, using localhost');
        return 'ws://localhost:80';
    } else {
        // Production/staging environment - use the current host
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        
        // For staging/production, you may need to adjust these ports based on your setup:
        // Common configurations:
        // - Signalling server on port 8888 (typical for UE Pixel Streaming)
        // - Signalling server on port 80/443 (if using a reverse proxy)
        // - Custom port based on your infrastructure
        
        let signallingUrl: string;
        
        // Check for common staging/production patterns
        if (host.includes('staging') || host.includes('dev')) {
            // Staging environment - might use different port
            signallingUrl = `${protocol}//${host}:8888`;
        } else {
            // Production environment - might use standard ports with reverse proxy
            signallingUrl = `${protocol}//${host}:8888`;
        }
        
        console.log('Production/staging environment detected:', {
            host,
            protocol,
            signallingUrl
        });
        
        return signallingUrl;
    }
};

export const App = () => {
    const signallingServerUrl = getSignallingServerUrl();
    const runtimeConfig = getRuntimeConfig();
    
    console.log('Pixel Streaming Configuration:', {
        url: window.location.href,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        signallingServer: signallingServerUrl,
        runtimeConfig,
        userAgent: navigator.userAgent
    });

    return (
        <ErrorBoundary>
            <div
                style={{
                    height: '100%',
                    width: '100%'
                }}
            >
                <PixelStreamingWrapper
                    initialSettings={{
                        AutoPlayVideo: true,
                        AutoConnect: true,
                        ss: signallingServerUrl,
                        StartVideoMuted: true,
                        HoveringMouse: true,
                        WaitForStreamer: true
                    }}
                />
            </div>
        </ErrorBoundary>
    );
};
