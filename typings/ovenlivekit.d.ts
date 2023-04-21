declare module 'ovenlivekit' {
	interface OvenLiveKitStatic {
		create(options: OvenLiveKitCreateConfig): OvenLiveKit;
		getDevices(): Promise<MediaDeviceInfo[]>;
		getVersion(): string;
	}

	export interface OvenLiveKit {
		inputStream: MediaStream | null;
		webSocket: WebSocket | null;
		peerConnection: RTCPeerConnection | null;
		connectionConfig: OvenLiveKitConnectionConfig;
		videoElement: HTMLVideoElement | null;
		connectionUrl: string | null;
		callbacks: OvenLiveKitCallbackConfig;
		webSocketClosedByUser: boolean;

		attachMedia(videoElement: HTMLVideoElement): void;
		getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
		getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
		startStreaming(connectionUrl: string, connectionConfig?: OvenLiveKitConnectionConfig): void;
		stopStreaming(): void;
		remove(): void;
	}

	export interface OvenLiveKitCreateConfig {
		callbacks?: OvenLiveKitCallbackConfig;
	}

	interface OvenLiveKitCallbackConfig {
		connected?: (event: Event) => void;
		connectionClosed?: (type: 'ice' | 'websocket', event: Event) => void;
		iceStateChange?: (state: RTCIceConnectionState) => void;
		error?: (error: Error) => void;
	}

	export interface OvenLiveKitConnectionConfig {
		sdp?: OvenLiveKitSdpConfig;
		preferredVideoFormat?: OvenLiveKitCodec;
		maxVideoBitrate?: number;
		iceServers?: RTCIceServer[];
		iceTransportPolicy?: RTCIceTransportPolicy;
	}

	export type OvenLiveKitCodec = 'VP8' | 'H264';

	export interface OvenLiveKitSdpConfig {
		appendFmtp?: string;
	}

	const OvenLiveKitStatic: OvenLiveKitStatic;
	export default OvenLiveKitStatic;
}
