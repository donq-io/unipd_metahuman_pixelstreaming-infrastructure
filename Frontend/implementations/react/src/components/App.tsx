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

// Function to get the appropriate websocket URL based on environment
const getSignallingServerUrl = (): string => {
    // Check if we're in development (localhost)
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.hostname === '';

    if (isLocalhost) {
        // Development environment - use localhost
        return 'ws://localhost:80';
    } else {
        // Production/staging environment - use the current host
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        // Common ports for websocket signalling servers
        const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
        
        // Try to connect to the signalling server on the same host
        // You may need to adjust the port based on your actual signalling server configuration
        return `${protocol}//${host}:8888`;
    }
};

export const App = () => {
    const signallingServerUrl = getSignallingServerUrl();
    
    console.log('Pixel Streaming Configuration:', {
        url: window.location.href,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        signallingServer: signallingServerUrl
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
