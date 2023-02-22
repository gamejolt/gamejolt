import { computed, reactive, ref, Ref } from 'vue';
import { assertNever } from '../../../utils/utils';
import { Analytics } from '../../analytics/analytics.service';
import {
	SettingVideoPlayerFeedAutoplay,
	SettingVideoPlayerFeedMuted,
	SettingVideoPlayerFeedVolume,
	SettingVideoPlayerMuted,
	SettingVideoPlayerVolume,
} from '../../settings/settings.service';
import { ScrubberStage } from '../../slider/AppSlider.vue';
import { VideoSourceArray } from '../AppVideo.vue';

export type VideoPlayerControllerContext = 'feed' | 'page' | 'gif' | null;
export type VideoPlayerState = 'paused' | 'playing';

export function getVideoPlayerFromSources(
	item: { mp4?: string; webm?: string },
	context: VideoPlayerControllerContext = null,
	poster?: string
) {
	const sources: VideoSourceArray = [];
	if (item.mp4) {
		sources.push({ src: item.mp4, type: 'video/mp4' });
	}
	if (item.webm) {
		sources.push({ src: item.webm, type: 'video/webm' });
	}

	return createVideoPlayerController(sources, context, poster);
}

export type VideoPlayerController = ReturnType<typeof createVideoPlayerController>;

export function createVideoPlayerController(
	sources: VideoSourceArray,
	context: VideoPlayerControllerContext,
	poster?: string
) {
	const sources_ = ref(sources) as Ref<VideoSourceArray>;
	const duration = ref(0);

	const isScrubbing = ref(false);
	const stateBeforeScrubbing = ref<null | VideoPlayerState>(null);
	const isLoading = ref(true);

	const currentTime = ref(0);
	const queuedTimeChange = ref<null | number>(null);

	const bufferedTo = ref(0);

	const isFullscreen = ref(false);
	const queuedFullScreenChange = ref<null | boolean>(null);

	/**
	 * iOS Safari doesn't allow us to:
	 * - Directly change the volume of an HTMLVideoElement
	 * - Request to make elements fullscreen in a normal way.
	 *
	 * If we're not able to go fullscreen our preferred way, we should be
	 * changing the way our controls work slightly to support both muting
	 * through external methods and going fullscreen with their controls.
	 */
	const altControlsBehavior = computed(() => {
		if (import.meta.env.SSR) {
			return false;
		}

		return !document.fullscreenEnabled;
	});

	let rawVolume = 0;
	let rawQueued: VideoPlayerState = 'paused';

	// Assign volume level from the proper local storage context.
	switch (context) {
		case 'feed':
			rawVolume = SettingVideoPlayerFeedMuted.get()
				? 0
				: // Use the page player volume because the feed player has no volume control.
				  SettingVideoPlayerVolume.get();

			rawQueued = SettingVideoPlayerFeedAutoplay.get() ? 'playing' : 'paused';
			break;

		case 'page':
			rawVolume = SettingVideoPlayerMuted.get() ? 0 : SettingVideoPlayerVolume.get();
			rawQueued = 'playing';
			break;

		case 'gif':
			rawVolume = 0;
			rawQueued = 'playing';
			break;

		default:
			rawVolume = 1;
			rawQueued = 'paused';
			break;
	}

	const volume = ref(rawVolume);
	const muted = ref(rawVolume === 0);
	const state = ref<VideoPlayerState>(rawQueued);
	const queuedPlaybackChange = ref<null | VideoPlayerState>(rawQueued);

	return reactive({
		sources: sources_,
		context,
		poster,
		muted,
		volume,
		duration,
		state,
		isScrubbing,
		stateBeforeScrubbing,
		isLoading,
		currentTime,
		queuedTimeChange,
		bufferedTo,
		isFullscreen,
		queuedFullScreenChange,
		queuedPlaybackChange,
		altControlsBehavior,
	});
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
	player.muted = mute;
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
