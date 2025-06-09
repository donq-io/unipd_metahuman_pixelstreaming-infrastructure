// Copyright Epic Games, Inc. All Rights Reserved.

import { useEffect, useRef, useState } from 'react';
import { Config, PixelStreaming } from '@donq.io/lib-pixelstreamingfrontend-ue5.4';

export interface PixelStreamingWrapperProps {
    initialSettings?: Partial<any>; // Using any instead of AllSettings as fallback
}

export const PixelStreamingWrapper = ({
    initialSettings
}: PixelStreamingWrapperProps) => {
    // A reference to parent div element that the Pixel Streaming library attaches into:
    const videoParent = useRef<HTMLDivElement>(null);

    // Pixel streaming library instance is stored into this state variable after initialization:
    const [pixelStreaming, setPixelStreaming] = useState<any>();
    
    // A boolean state variable that determines if the Click to play overlay is shown:
    const [clickToPlayVisible, setClickToPlayVisible] = useState(false);
    
    // Error state
    const [error, setError] = useState<string | null>(null);

    // Run on component mount:
    useEffect(() => {
        if (videoParent.current) {
            try {
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
                    } catch (cleanupError) {
                        console.warn('Error during cleanup:', cleanupError);
                    }
                };
            } catch (initError: any) {
                console.error('Error initializing PixelStreaming:', initError);
                setError(`Failed to initialize PixelStreaming: ${initError.message}`);
            }
        }
    }, []);

    // Show error state if there's an error
    if (error) {
        return (
            <div style={{ 
                padding: '20px', 
                color: 'red', 
                fontFamily: 'monospace',
                textAlign: 'center'
            }}>
                <h3>PixelStreaming Error</h3>
                <p>{error}</p>
            </div>
        );
    }

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
                        try {
                            pixelStreaming?.play();
                            setClickToPlayVisible(false);
                        } catch (playError) {
                            console.error('Error playing stream:', playError);
                        }
                    }}
                >
                    <div>Click to play</div>
                </div>
            )}
            {/* Test buttons for emitting messages */}
            <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10 }}>
                <button
                    onClick={() => {
                        try {
                            pixelStreaming?.emitUIInteraction({ test: 'ui-interaction', time: Date.now() });
                        } catch (error) {
                            console.error('Error emitting UI interaction:', error);
                        }
                    }}
                    style={{ marginRight: 8 }}
                >
                    Emit UIInteraction
                </button>
                <button
                    onClick={() => {
                        try {
                            pixelStreaming?.emitCommand({ test: 'command', value: 42 });
                        } catch (error) {
                            console.error('Error emitting command:', error);
                        }
                    }}
                    style={{ marginRight: 8 }}
                >
                    Emit Command
                </button>
                <button
                    onClick={() => {
                        try {
                            pixelStreaming?.emitConsoleCommand('stat fps');
                        } catch (error) {
                            console.error('Error emitting console command:', error);
                        }
                    }}
                >
                    Emit ConsoleCommand
                </button>
            </div>
        </div>
    );
};
