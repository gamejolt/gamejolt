import { assertNever } from '../../../utils/utils';
import { Analytics } from '../../analytics/analytics.service';
import {
	SettingVideoPlayerFeedVolume,
	SettingVideoPlayerVolume,
} from '../../settings/settings.service';

export type VideoPlayerControllerContext = 'feed' | 'page' | null;

export class VideoPlayerController {
	volume: number;
	duration = 0;
	state: 'paused' | 'playing' = 'paused';

	isScrubbing = false;
	stateBeforeScrubbing: null | VideoPlayerController['state'] = null;
	isLoading = true;

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
				break;
			case 'page':
				this.volume = SettingVideoPlayerVolume.get();
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

export function setVideoVolume(player: VideoPlayerController, level: number) {
	const volume = Math.min(1, Math.max(0, Math.round(level * 100) / 100));

	// Assign volume level to the proper local storage context.
	switch (player.context) {
		case 'feed':
			SettingVideoPlayerFeedVolume.set(volume);
			break;
		case 'page':
			SettingVideoPlayerVolume.set(volume);
			break;
	}

	player.volume = volume;
}

export function queueVideoTimeChange(player: VideoPlayerController, time: number) {
	player.queuedTimeChange = time;
}

export function scrubVideo(
	player: VideoPlayerController,
	position: number,
	stage: 'start' | 'scrub' | 'end'
) {
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
