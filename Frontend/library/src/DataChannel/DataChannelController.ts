// Copyright Epic Games, Inc. All Rights Reserved.

import { Logger } from '../Logger/Logger';

/**
 * Handles the Sending and Receiving of messages to the UE Instance via the Data Channel
 */
export class DataChannelController {
    dataChannel: RTCDataChannel;
    peerConnection: RTCPeerConnection;
    datachannelOptions: RTCDataChannelInit;
    label: string;
    isReceivingFreezeFrame = false;
    private canSendCheckInterval: number | null = null;
    private hasFireCanSendEvent = false;

    /**
     * return the current state of a datachannel controller instance
     * @returns the current DataChannelController instance
     */
    getDataChannelInstance(): DataChannelController {
        return this;
    }

    /**
     * To Create and Set up a Data Channel
     * @param peerConnection - The RTC Peer Connection
     * @param label - Label of the Data Channel
     * @param datachannelOptions - Optional RTC DataChannel options
     */
    createDataChannel(
        peerConnection: RTCPeerConnection,
        label: string,
        datachannelOptions?: RTCDataChannelInit
    ) {
        this.peerConnection = peerConnection;
        this.label = label;
        this.datachannelOptions = datachannelOptions;
        if (datachannelOptions == null) {
            this.datachannelOptions = {} as RTCDataChannelInit;
            this.datachannelOptions.ordered = true;
        }

        this.dataChannel = this.peerConnection.createDataChannel(
            this.label,
            this.datachannelOptions
        );
        this.setupDataChannel();
    }

    setupDataChannel() {
        //We Want an Array Buffer not a blob
        this.dataChannel.binaryType = 'arraybuffer';
        this.dataChannel.onopen = (ev: Event) => this.handleOnOpen(ev);
        this.dataChannel.onclose = (ev: Event) => this.handleOnClose(ev);
        this.dataChannel.onmessage = (ev: MessageEvent) =>
            this.handleOnMessage(ev);
        this.dataChannel.onerror = (ev: RTCErrorEvent) => this.handleOnError(ev);
    }

    /**
     * Handles when the Data Channel is opened
     */
    handleOnOpen(ev: Event) {
        Logger.Log(
            Logger.GetStackTrace(),
            `Data Channel (${this.label}) opened.`,
            7
        );
        this.onOpen(this.dataChannel?.label, ev);
        
        // Start checking if the data channel can send messages
        this.startCanSendPolling();
    }

    /**
     * Handles when the Data Channel is closed
     */
    handleOnClose(ev: Event) {
        Logger.Log(
            Logger.GetStackTrace(),
            `Data Channel (${this.label}) closed.`,
            7
        );
        
        // Stop polling when channel is closed
        this.stopCanSendPolling();
        this.hasFireCanSendEvent = false;
        
        this.onClose(this.dataChannel?.label, ev);
    }

    /**
     * Handles when a message is received
     * @param event - Message Event
     */
    handleOnMessage(event: MessageEvent) {
        // Higher log level to prevent log spam with messages received
        Logger.Log(
            Logger.GetStackTrace(),
            `Data Channel (${this.label}) message: ${event}`,
            8
        );
    }

    /**
     * Handles when an error is thrown
     * @param event - Error Event
     */
    handleOnError(event: RTCErrorEvent) {
        Logger.Log(
            Logger.GetStackTrace(),
            `Data Channel (${this.label}) error: ${event}`,
            7
        );
        this.onError(this.dataChannel?.label, event);
    }

    /**
     * Starts polling to check when the data channel is ready to send messages
     */
    private startCanSendPolling() {
        // Reset the flag since we're starting fresh
        this.hasFireCanSendEvent = false;
        
        // Check immediately first
        this.checkCanSend();
        
        // If not ready yet, start polling
        if (!this.hasFireCanSendEvent) {
            this.canSendCheckInterval = window.setInterval(() => {
                this.checkCanSend();
                
                // Stop polling once we've successfully fired the event
                if (this.hasFireCanSendEvent) {
                    this.stopCanSendPolling();
                }
            }, 10); // Check every 10ms until ready
        }
    }

    /**
     * Stops the polling for data channel ready state
     */
    private stopCanSendPolling() {
        if (this.canSendCheckInterval !== null) {
            window.clearInterval(this.canSendCheckInterval);
            this.canSendCheckInterval = null;
        }
    }

    /**
     * Checks if the data channel can send messages and fires the onCanSend event
     */
    private checkCanSend() {
        if (this.canSend() && !this.hasFireCanSendEvent) {
            Logger.Log(
                Logger.GetStackTrace(),
                `Data Channel (${this.label}) is ready to send messages.`,
                7
            );
            this.hasFireCanSendEvent = true;
            this.onCanSend(this.dataChannel?.label);
        }
    }

    /**
     * Checks if the data channel can send messages
     * @returns true if the data channel is ready to send messages
     */
    canSend(): boolean {
        return (
            this.dataChannel !== undefined &&
            this.dataChannel.readyState === 'open'
        );
    }

    /**
     * Override to register onOpen handler
     * @param label Data channel label ("datachannel", "send-datachannel", "recv-datachannel")
     * @param ev event
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onOpen(label: string, ev: Event) {
        // empty default implementation
    }

    /**
     * Override to register onClose handler
     * @param label Data channel label ("datachannel", "send-datachannel", "recv-datachannel")
     * @param ev event
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onClose(label: string, ev: Event) {
        // empty default implementation
    }

    /**
     * Override to register onError handler
     * @param label Data channel label ("datachannel", "send-datachannel", "recv-datachannel")
     * @param ev event
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError(label: string, ev: Event) {
        // empty default implementation
    }

    /**
     * Override to register onCanSend handler
     * @param label Data channel label ("datachannel", "send-datachannel", "recv-datachannel")
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onCanSend(label: string) {
        // empty default implementation
    }
}
