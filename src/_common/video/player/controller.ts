import { assertNever } from '../../../utils/utils';
import { Analytics } from '../../analytics/analytics.service';
import {
	SettingVideoPlayerFeedMuted,
	SettingVideoPlayerFeedVolume,
	SettingVideoPlayerMuted,
	SettingVideoPlayerVolume,
} from '../../settings/settings.service';

export type VideoPlayerControllerContext = 'feed' | 'page' | null;
export type VideoPlayerState = 'paused' | 'playing';
export type ScrubberStage = 'start' | 'scrub' | 'end';

export class VideoPlayerController {
	volume: number;
	mutedFallbackVolume: number;
	isMuted: boolean;
	duration = 0;
	state: VideoPlayerState = 'paused';

	isScrubbing = false;
	stateBeforeScrubbing: null | VideoPlayerController['state'] = null;

	currentTime = 0;
	queuedTimeChange: null | number = null;

	bufferedTo = 0;

	isFullscreen = false;
	queuedFullScreenChange: null | boolean = null;
	queuedPlaybackChange: null | VideoPlayerState = null;

	constructor(public manifests: string[], public context: VideoPlayerControllerContext) {
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

export function toggleVideoPlayback(
	player: VideoPlayerController,
	forcedState: VideoPlayerState | null = null
) {
	if (player.queuedPlaybackChange) {
		return;
	}

	if (forcedState !== null) {
		return queuePlayerPlayback(player, forcedState);
	}

	if (player.state === 'playing') {
		queuePlayerPlayback(player, 'paused');
	} else if (player.state === 'paused') {
		queuePlayerPlayback(player, 'playing');
	} else {
		assertNever(player.state);
	}
}

function queuePlayerPlayback(player: VideoPlayerController, state: VideoPlayerState) {
	player.queuedPlaybackChange = state;
}

/** Volume is set on a scale of 0 to 1 */
export function setVideoVolume(player: VideoPlayerController, level: number) {
	const volume = Math.min(1, Math.max(0, Math.round(level * 100) / 100));
	player.volume = volume;

	if (player.context === 'feed') {
		SettingVideoPlayerFeedVolume.set(volume);
	} else if (player.context === 'page') {
		SettingVideoPlayerVolume.set(volume);
	}
}

/** Volume is set on a scale of 0 to 1 */
export function scrubVideoVolume(
	player: VideoPlayerController,
	volumeLevel: number,
	stage: ScrubberStage
) {
	const volume = Math.min(1, Math.max(0, volumeLevel));
	if (volume && stage === 'end') {
		player.mutedFallbackVolume = volume;
	}

	setVideoVolume(player, volume);

	if (volume && player.isMuted && stage !== 'end') {
		toggleVideoMuted(player);
	}

	if (!volume && !player.isMuted) {
		toggleVideoMuted(player);
	}
}

export function toggleVideoMuted(player: VideoPlayerController) {
	player.isMuted = !player.isMuted;
	if (!player.isMuted) {
		if (player.mutedFallbackVolume) {
			setVideoVolume(player, player.mutedFallbackVolume);
		} else if (player.context === 'feed') {
			// Feed videos don't have a volume slider, so if the video element volume was somehow changed we want to set it back to 100%.
			setVideoVolume(player, 1);
		}
	}

	if (player.context === 'feed') {
		SettingVideoPlayerFeedMuted.set(player.isMuted);
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
		queuePlayerPlayback(player, 'paused');
	} else if (stage === 'end' && player.stateBeforeScrubbing) {
		queuePlayerPlayback(player, player.stateBeforeScrubbing);
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
