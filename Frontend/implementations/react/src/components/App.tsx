// Copyright Epic Games, Inc. All Rights Reserved.

import React, { useEffect, useState } from 'react';
import { PixelStreamingWrapper } from './PixelStreamingWrapper';
import { config, fetchServerConfig, checkServerHealth } from '../config';

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

export const App = () => {
    const [serverConfig, setServerConfig] = useState<any>(null);
    const [serverHealth, setServerHealth] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            console.log('Pixel Streaming App Configuration:', {
                url: window.location.href,
                hostname: window.location.hostname,
                protocol: window.location.protocol,
                signallingServer: config.SIGNALLING_SERVER_URL,
                signallingHTTP: config.SIGNALLING_SERVER_HTTP,
                autoFetchConfig: config.AUTO_FETCH_CONFIG,
                debug: config.DEBUG
            });

            // Check server health first
            const health = await checkServerHealth();
            setServerHealth(health);

            // Fetch server configuration if enabled
            if (config.AUTO_FETCH_CONFIG) {
                const fetchedConfig = await fetchServerConfig();
                if (fetchedConfig) {
                    setServerConfig(fetchedConfig);
                }
            }

            setIsLoading(false);
        };

        initializeApp();
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <div style={{ 
                padding: '20px', 
                color: '#666',
                fontFamily: 'monospace',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
            }}>
                <div>
                    <h3>Initializing Pixel Streaming...</h3>
                    <p>Checking server connection...</p>
                </div>
            </div>
        );
    }

    // Show server health status if there are issues
    if (serverHealth && serverHealth.status !== 'healthy') {
        return (
            <div style={{ 
                padding: '20px', 
                color: 'orange', 
                fontFamily: 'monospace',
                textAlign: 'center'
            }}>
                <h3>Server Connection Issue</h3>
                <p>Status: {serverHealth.status}</p>
                {serverHealth.error && <p>Error: {serverHealth.error}</p>}
                <p>Signalling Server: {config.SIGNALLING_SERVER_HTTP}</p>
                <button 
                    onClick={() => {
                        window.location.reload();
                    }}
                    style={{
                        padding: '10px 20px',
                        marginTop: '10px',
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Retry Connection
                </button>
            </div>
        );
    }

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
                        AutoConnect: config.AUTO_CONNECT,
                        ss: config.SIGNALLING_SERVER_URL,
                        StartVideoMuted: true,
                        HoveringMouse: true,
                        WaitForStreamer: true,
                        ...(serverConfig || {})
                    }}
                />
            </div>
        </ErrorBoundary>
    );
};
