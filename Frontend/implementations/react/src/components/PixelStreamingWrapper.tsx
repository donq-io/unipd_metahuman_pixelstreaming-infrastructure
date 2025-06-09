// Copyright Epic Games, Inc. All Rights Reserved.

import React, { useEffect, useRef, useState } from 'react';

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
    
    // Loading state
    const [isLoading, setIsLoading] = useState(true);

    // Dynamically import and initialize PixelStreaming
    const initializePixelStreaming = async () => {
        try {
            console.log('Starting PixelStreaming initialization...');
            
            // Dynamic import with error handling
            const pixelStreamingModule = await import('@donq.io/lib-pixelstreamingfrontend-ue5.4').catch(importError => {
                console.error('Failed to import PixelStreaming module:', importError);
                throw new Error(`Module import failed: ${importError.message}`);
            });
            
            console.log('PixelStreaming module imported successfully:', pixelStreamingModule);
            
            // Validate that the required exports exist
            if (!pixelStreamingModule.PixelStreaming) {
                throw new Error('PixelStreaming class not found in module exports');
            }
            
            if (!pixelStreamingModule.Config) {
                throw new Error('Config class not found in module exports');
            }
            
            const { Config, PixelStreaming } = pixelStreamingModule;
            
            // Validate videoParent
            if (!videoParent.current) {
                throw new Error('Video parent element not available');
            }
            
            console.log('Creating PixelStreaming config...');
            
            // Create config with defensive checks
            const config = new Config({ 
                initialSettings: initialSettings || {} 
            });
            
            if (!config) {
                throw new Error('Failed to create PixelStreaming config');
            }
            
            console.log('Creating PixelStreaming instance...');
            
            // Create PixelStreaming instance with defensive checks  
            const streaming = new PixelStreaming(config, {
                videoElementParent: videoParent.current
            });
            
            if (!streaming) {
                throw new Error('Failed to create PixelStreaming instance');
            }
            
            console.log('PixelStreaming instance created successfully');
            
            // Add event listeners with error handling
            try {
                streaming.addEventListener('playStreamRejected', () => {
                    console.log('Play stream rejected, showing click to play overlay');
                    setClickToPlayVisible(true);
                });
            } catch (eventError) {
                console.warn('Failed to add playStreamRejected event listener:', eventError);
            }

            // Save the library instance
            setPixelStreaming(streaming);
            setIsLoading(false);
            console.log('PixelStreaming initialization completed successfully');

            // Return cleanup function
            return () => {
                try {
                    console.log('Cleaning up PixelStreaming instance...');
                    if (streaming && typeof streaming.disconnect === 'function') {
                        streaming.disconnect();
                    }
                    console.log('PixelStreaming cleanup completed');
                } catch (cleanupError) {
                    console.warn('Error during PixelStreaming cleanup:', cleanupError);
                }
            };
        } catch (initError: any) {
            console.error('PixelStreaming initialization failed:', initError);
            console.error('Error stack:', initError.stack);
            setError(`Failed to initialize PixelStreaming: ${initError.message}`);
            setIsLoading(false);
            return undefined;
        }
    };

    // Run on component mount:
    useEffect(() => {
        if (videoParent.current) {
            let cleanup: (() => void) | undefined;
            
            initializePixelStreaming().then((cleanupFn) => {
                cleanup = cleanupFn;
            }).catch((error) => {
                console.error('Failed to initialize PixelStreaming:', error);
            });
            
            // Return cleanup function
            return () => {
                if (cleanup) {
                    cleanup();
                }
            };
        }
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
                    <h3>Loading PixelStreaming...</h3>
                    <p>Initializing connection...</p>
                </div>
            </div>
        );
    }

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
                <button 
                    onClick={() => {
                        setError(null);
                        setIsLoading(true);
                        window.location.reload();
                    }}
                    style={{
                        padding: '10px 20px',
                        marginTop: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
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
                        cursor: 'pointer',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        fontSize: '24px'
                    }}
                    onClick={() => {
                        try {
                            console.log('Click to play triggered');
                            if (pixelStreaming && typeof pixelStreaming.play === 'function') {
                                pixelStreaming.play();
                                setClickToPlayVisible(false);
                            } else {
                                console.error('PixelStreaming play method not available');
                            }
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
                            if (pixelStreaming && typeof pixelStreaming.emitUIInteraction === 'function') {
                                pixelStreaming.emitUIInteraction({ test: 'ui-interaction', time: Date.now() });
                            } else {
                                console.warn('PixelStreaming emitUIInteraction method not available');
                            }
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
                            if (pixelStreaming && typeof pixelStreaming.emitCommand === 'function') {
                                pixelStreaming.emitCommand({ test: 'command', value: 42 });
                            } else {
                                console.warn('PixelStreaming emitCommand method not available');
                            }
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
                            if (pixelStreaming && typeof pixelStreaming.emitConsoleCommand === 'function') {
                                pixelStreaming.emitConsoleCommand('stat fps');
                            } else {
                                console.warn('PixelStreaming emitConsoleCommand method not available');
                            }
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
