// Copyright Epic Games, Inc. All Rights Reserved.

import React, { useEffect, useRef, useState } from 'react';
import {
    Config,
    AllSettings,
    PixelStreaming
} from '@donq.io/lib-pixelstreamingfrontend-ue5.4';

export interface PixelStreamingWrapperProps {
    initialSettings?: Partial<AllSettings>;
}

export const PixelStreamingWrapper = ({
    initialSettings
}: PixelStreamingWrapperProps) => {
    // A reference to parent div element that the Pixel Streaming library attaches into:
    const videoParent = useRef<HTMLDivElement>(null);

    // Pixel streaming library instance is stored into this state variable after initialization:
    const [pixelStreaming, setPixelStreaming] = useState<PixelStreaming>();
    
    // A boolean state variable that determines if the Click to play overlay is shown:
    const [clickToPlayVisible, setClickToPlayVisible] = useState(false);

    // Run on component mount:
    useEffect(() => {
        if (videoParent.current) {
            // Attach Pixel Streaming library to videoParent element:
            const config = new Config({ initialSettings });
            const streaming = new PixelStreaming(config, {
                videoElementParent: videoParent.current
            });
            
            // register a playStreamRejected handler to show Click to play overlay if needed:
            streaming.addEventListener('playStreamRejected', () => {
                setClickToPlayVisible(true);
            });

            // Save the library instance into component state so that it can be accessed later:
            setPixelStreaming(streaming);

            // Clean up on component unmount:
            return () => {
                try {
                    streaming.disconnect();
                } catch {}
            };
        }
    }, []);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative'
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%'
                }}
                ref={videoParent}
            />
            {clickToPlayVisible && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        pixelStreaming?.play();
                        setClickToPlayVisible(false);
                    }}
                >
                    <div>Click to play</div>
                </div>
            )}
            {/* Test buttons for emitting messages */}
            <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10 }}>
                <button
                    onClick={() => {
                        console.log('Emit UIInteraction');
                        console.log(pixelStreaming);
                        pixelStreaming?.emitUIInteraction({ test: 'ui-interaction', time: Date.now() })
                    }}
                    style={{ marginRight: 8 }}
                >
                    Emit UIInteraction
                </button>
                <button
                    onClick={() => {
                        console.log('Emit Command');
                        console.log(pixelStreaming);
                        pixelStreaming?.emitCommand({ test: 'command', value: 42 })
                    }}
                    style={{ marginRight: 8 }}
                >
                    Emit Command
                </button>
                <button
                    onClick={() => {
                        console.log('Emit ConsoleCommand');
                        console.log(pixelStreaming);
                        pixelStreaming?.emitConsoleCommand('stat fps')
                    }}
                >
                    Emit ConsoleCommand
                </button>
            </div>
        </div>
    );
};
