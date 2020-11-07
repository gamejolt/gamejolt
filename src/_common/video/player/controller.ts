import { assertNever } from '../../../utils/utils';
import { Analytics } from '../../analytics/analytics.service';
import {
	SettingVideoPlayerFeedAutoplay,
	SettingVideoPlayerFeedMuted,
	SettingVideoPlayerFeedVolume,
	SettingVideoPlayerMuted,
	SettingVideoPlayerVolume,
} from '../../settings/settings.service';

export type VideoPlayerControllerContext = 'feed' | 'page' | 'gif' | null;
export type VideoPlayerState = 'paused' | 'playing';
export type ScrubberStage = 'start' | 'scrub' | 'end';

export class VideoPlayerController {
	volume: number;
	duration = 0;
	state: VideoPlayerState = 'paused';

	isScrubbing = false;
	stateBeforeScrubbing: null | VideoPlayerController['state'] = null;
	isLoading = true;

	currentTime = 0;
	queuedTimeChange: null | number = null;

	bufferedTo = 0;

	isFullscreen = false;
	queuedFullScreenChange: null | boolean = null;
	queuedPlaybackChange: null | VideoPlayerState = null;

	constructor(
		public manifests: string[],
		public context: VideoPlayerControllerContext,
		public poster?: string
	) {
		// Assign volume level from the proper local storage context.
		switch (context) {
			case 'feed':
				this.volume = SettingVideoPlayerFeedMuted.get()
					? 0
					: SettingVideoPlayerFeedVolume.get();
				this.queuedPlaybackChange = SettingVideoPlayerFeedAutoplay.get()
					? 'playing'
					: 'paused';
				break;
			case 'page':
				this.volume = SettingVideoPlayerMuted.get() ? 0 : SettingVideoPlayerVolume.get();
				this.queuedPlaybackChange = 'playing';
				break;
			case 'gif':
				this.volume = 0;
				this.queuedPlaybackChange = 'playing';
				break;
			default:
				this.volume = 1;
				this.queuedPlaybackChange = 'paused';
				break;
		}
		this.state = this.queuedPlaybackChange;
	}
}

export function toggleVideoPlayback(
	player: VideoPlayerController,
	forcedState: VideoPlayerState | null = null
) {
	if (player.queuedPlaybackChange || player.isLoading) {
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
	if (player.context === 'gif') {
		return;
	}

	const volume = Math.min(1, Math.max(0, Math.round(level * 100) / 100));
	player.volume = volume;
}

/** Assigns the volume Setting to the appropriate context. */
function assignVolumeSetting(player: VideoPlayerController, volume: number) {
	if (player.context === 'feed') {
		SettingVideoPlayerFeedVolume.set(volume);
	} else if (player.context === 'page') {
		SettingVideoPlayerVolume.set(volume);
	}
}

/** Gets the volume Setting from the appropriate context. */
function getVolumeSetting(player: VideoPlayerController) {
	if (player.context === 'feed') {
		return SettingVideoPlayerFeedVolume.get();
	} else if (player.context === 'page') {
		return SettingVideoPlayerVolume.get();
	} else if (player.context === 'gif') {
		return 0;
	}

	return 1;
}

/** Volume is set on a scale of 0 to 1 */
export function scrubVideoVolume(
	player: VideoPlayerController,
	volumeLevel: number,
	stage: ScrubberStage
) {
	const volume = Math.min(1, Math.max(0, volumeLevel));
	setVideoVolume(player, volume);

	if (stage === 'end') {
		if (volume) {
			// If we have an audible volume level at the end of scrubbing,
			// assign it to the appropriate volume Setting depending on the player context.
			assignVolumeSetting(player, volume);
			setVideoMuted(player, false);
		} else {
			// Mute the player if scrub-end has no audible volume.
			setVideoMuted(player, true);
		}
	}
}

export function setVideoMuted(player: VideoPlayerController, mute: boolean) {
	setVideoVolume(player, mute ? 0 : getVolumeSetting(player));

	if (player.context === 'feed') {
		SettingVideoPlayerFeedMuted.set(mute);
	} else if (player.context === 'page') {
		SettingVideoPlayerMuted.set(mute);
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
