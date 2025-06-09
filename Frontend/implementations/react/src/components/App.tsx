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

export const App = () => {
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
                        ss: 'ws://localhost:80',
                        StartVideoMuted: true,
                        HoveringMouse: true,
                        WaitForStreamer: true
                    }}
                />
            </div>
        </ErrorBoundary>
    );
};
