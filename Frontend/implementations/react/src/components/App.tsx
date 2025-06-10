// Copyright Epic Games, Inc. All Rights Reserved.

import React from 'react';
import { PixelStreamingWrapper } from './PixelStreamingWrapper';

export const App = () => {
    // Get signalling server URL from environment variable, fallback to localhost for development
    // Webpack DefinePlugin will replace process.env.REACT_APP_SIGNALLING_SERVER_URL at build time
    const signallingServerUrl = process.env.REACT_APP_SIGNALLING_SERVER_URL || 'ws://localhost:80';

    return (
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
                    ss: "https://metahuman-production.unipd.cloud",
                    StartVideoMuted: true,
                    HoveringMouse: true,
                    WaitForStreamer: true
                }}
            />
        </div>
    );
};
