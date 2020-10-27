import { assertNever } from '../../../utils/utils';
import { Analytics } from '../../analytics/analytics.service';
import {
	SettingVideoPlayerFeedMuted,
	SettingVideoPlayerFeedVolume,
	SettingVideoPlayerMuted,
	SettingVideoPlayerVolume,
} from '../../settings/settings.service';

export type VideoPlayerControllerContext = 'feed' | 'page' | null;
type ScrubberStage = 'start' | 'scrub' | 'end';

export class VideoPlayerController {
	volume: number;
	mutedFallbackVolume: number;
	isMuted: boolean;
	duration = 0;
	state: 'paused' | 'playing' = 'paused';

	isScrubbing = false;
	stateBeforeScrubbing: null | VideoPlayerController['state'] = null;

	currentTime = 0;
	queuedTimeChange: null | number = null;

	bufferedTo = 0;

	isFullscreen = false;
	queuedFullScreenChange: null | boolean = null;

	constructor(
		public poster: undefined | string,
		public manifests: string[],
		public context: VideoPlayerControllerContext
	) {
		// Assign volume level from the proper local storage context.
		switch (context) {
			case 'feed':
				this.volume = SettingVideoPlayerFeedVolume.get();
				this.isMuted = SettingVideoPlayerFeedMuted.get();
				break;
			case 'page':
				this.volume = SettingVideoPlayerVolume.get();
				this.isMuted = SettingVideoPlayerMuted.get();
				break;
			default:
				this.volume = 1;
				this.isMuted = false;
				break;
		}
		this.mutedFallbackVolume = this.volume;
	}
}

export function toggleVideoPlayback(player: VideoPlayerController) {
	if (player.state === 'playing') {
		player.state = 'paused';
	} else if (player.state === 'paused') {
		player.state = 'playing';
	} else {
		assertNever(player.state);
	}
}

export function setVideoVolume(
	player: VideoPlayerController,
	level: number,
	storeLevel: boolean,
	forceUnmute = true
) {
	const volume = Math.min(1, Math.max(0, Math.round(level * 100) / 100));
	if (volume && storeLevel) {
		player.mutedFallbackVolume = volume;
	}

	if (player.context === 'feed') {
		SettingVideoPlayerFeedVolume.set(volume);
	} else if (player.context === 'page') {
		SettingVideoPlayerVolume.set(volume);
	}

	player.volume = volume;

	if (volume && player.isMuted && forceUnmute) {
		toggleVideoMuted(player);
	}

	if (!volume && !player.isMuted) {
		toggleVideoMuted(player);
	}
}

export function toggleVideoMuted(player: VideoPlayerController) {
	player.isMuted = !player.isMuted;
	if (!player.isMuted && player.mutedFallbackVolume !== null) {
		setVideoVolume(player, player.mutedFallbackVolume, false);
	}

	if (player.context === 'feed') {
		SettingVideoPlayerFeedMuted.set(player.isMuted);
		// Feed videos don't have a volume slider, so if the video element volume was somehow changed we want to set it back to 100%.
		if (!player.isMuted) {
			setVideoVolume(player, 100, true);
		}
	} else if (player.context === 'page') {
		SettingVideoPlayerMuted.set(player.isMuted);
	}
}

export function queueVideoTimeChange(player: VideoPlayerController, time: number) {
	player.queuedTimeChange = time;
}

export function scrubVideo(player: VideoPlayerController, position: number, stage: ScrubberStage) {
	player.isScrubbing = stage !== 'end';

	// Pause the video while scrubbing.
	if (stage === 'start') {
		player.stateBeforeScrubbing = player.state;
		player.state = 'paused';
	} else if (stage === 'end' && player.stateBeforeScrubbing) {
		player.state = player.stateBeforeScrubbing;
		player.stateBeforeScrubbing = null;
	}

	queueVideoTimeChange(player, position * player.duration);
}

export function queueVideoFullscreenChange(player: VideoPlayerController, fullscreen: boolean) {
	player.queuedFullScreenChange = fullscreen;
}

export function trackVideoPlayerEvent(
	player: VideoPlayerController,
	action: string,
	label?: string,
	value?: string
) {
	Analytics.trackEvent(
		'video-player' + (player.context ? `-${player.context}` : ''),
		action,
		label,
		value
	);
}
