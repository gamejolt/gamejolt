import { assertNever } from '../../../utils/utils';
import { Analytics } from '../../analytics/analytics.service';
import {
	SettingVideoPlayerFeedMuted,
	SettingVideoPlayerFeedVolume,
	SettingVideoPlayerMuted,
	SettingVideoPlayerVolume,
} from '../../settings/settings.service';

export type VideoPlayerControllerContext = 'feed' | 'page' | null;
export type ScrubberStage = 'start' | 'scrub' | 'end';

export class VideoPlayerController {
	volume: number;
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
				this.volume = SettingVideoPlayerFeedMuted.get()
					? 0
					: SettingVideoPlayerFeedVolume.get();
				break;
			case 'page':
				this.volume = SettingVideoPlayerMuted.get() ? 0 : SettingVideoPlayerVolume.get();
				break;
			default:
				this.volume = 1;
				break;
		}
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
	}

	return 1;
}

/** Volume is set on a scale of 0 to 1 */
export function setVideoVolume(player: VideoPlayerController, level: number) {
	const volume = Math.min(1, Math.max(0, Math.round(level * 100) / 100));
	player.volume = volume;
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
