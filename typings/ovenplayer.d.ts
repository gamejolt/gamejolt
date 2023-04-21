declare module 'ovenplayer' {
	interface OvenPlayerStatic {
		debug(debug: boolean): boolean;
		generateWebrtcUrls(
			sources: OvenPlayerWebRTCStream | OvenPlayerWebRTCStream[]
		): OvenPlayerSource[];
		create(container: string | HTMLDivElement, config: OvenPlayerConfig): OvenPlayer;
		getPlayerByContainerId(containerId: string): OvenPlayer | null;
		getPlayerByIndex(index: number): OvenPlayer | null;
		getPlayerList(): OvenPlayer[];
		removePlayer(player: OvenPlayer): void;
	}

	export interface OvenPlayerConfig {
		aspectRatio?: string;
		title?: string;
		waterMark?: object;
		autoStart?: boolean;
		autoFallback?: boolean;
		controls?: boolean;
		loop?: boolean;
		showBigPlayButton?: boolean;
		disableSeekUI?: boolean;
		showSeekControl?: boolean;
		seekControlInterval?: number;
		expandFullScreenUI?: boolean;
		mute?: boolean;
		timecode?: boolean;
		playbackRate?: number;
		playbackRates?: number[];
		currentProtocolOnly?: boolean;
		tracks?: object[];
		volume?: number;
		adTagUrl?: string;
		adClient?: 'googleima' | 'vast';
		playlist?: OvenPlayerPlayList;
		hidePlaylistIcon?: boolean;
		webrtcConfig?: object;
		hlsConfig?: any;
		dashConfig?: any;
		sources?: OvenPlayerSource[] | OvenPlayerPlayList;
		image?: string;
	}

	export interface OvenPlayerWebRTCStream {
		host: string;
		application: string;
		stream: string;
		label?: string;
	}

	export type OvenPlayerPlayList = OvenPlayerSource[][];

	export interface OvenPlayerSource {
		type: 'webrtc' | 'llhls' | 'hls' | 'lldash' | 'dash' | 'mp4';
		file: string;
		label?: string;
		framerate?: number;
		sectionStart?: number;
		sectionEnd?: number;
	}

	export type OvenPlayerState =
		| 'idle'
		| 'paused'
		| 'playing'
		| 'error'
		| 'loading'
		| 'complete'
		| 'adLoaded'
		| 'adPlaying'
		| 'adPaused'
		| 'adComplete';

	export interface OvenPlayer {
		getVersion(): string;
		getConfig(): OvenPlayerConfig;
		getContainerElement(): HTMLDivElement;
		getContainerId(): string;
		getMseInstance(): object | null;
		getProviderName(): string | null;
		load(sources: OvenPlayerSource[] | OvenPlayerPlayList): void;
		getMediaElement(): HTMLVideoElement;
		getState(): OvenPlayerState;
		getBrowser(): object;
		setTimecodeMode(mode: boolean): void;
		isTimecodeMode(): boolean;
		getFramerate(): number;
		seekFrame(frame: number): void;
		getDuration(): number;
		getPosition(): number;
		getVolume(): number;
		setVolume(volume: number): void;
		getMute(): boolean;
		setMute(mute: boolean): void;
		play(): void;
		pause(): void;
		stop(): void;
		seek(position: number): void;
		getPlaybackRate(): number;
		setPlaybackRate(rate: number): void;
		getPlaylist(): OvenPlayerPlayList;
		getCurrentPlaylist(): number;
		setCurrentPlaylist(index: number): void;
		getSources(): OvenPlayerSource[] | OvenPlayerPlayList;
		getCurrentSource(): number;
		setCurrentSource(index: number): void;
		getQualityLevels(): {
			index: number;
			label: string;
			bitrate?: string;
			height?: number;
			width?: number;
		}[];
		getCurrentQuality(): number;
		setCurrentQuality(index: number): void;
		isAutoQuality(): boolean;
		setAutoQuality(auto: boolean): void;
		addCaption(track: object): void;
		getCaptionList(): object[];
		getCurrentCaption(): number;
		setCurrentCaption(index: number): void;
		setCaption(caption: object): void;
		removeCaption(index: number): void;
		showControls(show: boolean): void;
		toggleFullScreen(): void;
		on(eventName: string, callback: OvenPlayerCallbackFunction): void;
		once(eventName: string, callback: OvenPlayerCallbackFunction): void;
		off(eventName: string): void;
		remove(): void;
	}

	export type OvenPlayerCallbackFunction = (...args: any[]) => void;

	const OvenPlayerStatic: OvenPlayerStatic;
	export default OvenPlayerStatic;
}
