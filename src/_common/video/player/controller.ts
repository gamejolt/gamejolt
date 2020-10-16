import { SettingVideoPlayerVolume } from '../../settings/settings.service';

export class VideoPlayerController {
	shouldPlay = false;
	volume = SettingVideoPlayerVolume.get();
	duration = 0;
	// isPlaying = false;
	isPaused = false;
	isScrubbing = false;

	currentTime = 0;
	queuedTimeChange: null | number = null;

	isFullscreen = false;
	queuedFullScreenChange: null | boolean = null;

	constructor(public manifest: string, public poster: string) {}
}

export function toggleVideoPlayback(player: VideoPlayerController) {
	player.isPaused = !player.isPaused;
}

export function setVideoVolume(player: VideoPlayerController, level: number) {
	const volume = Math.min(1, Math.max(0, Math.round(level * 100) / 100));

	SettingVideoPlayerVolume.set(volume);
	player.volume = volume;
}

export function queueVideoTimeChange(player: VideoPlayerController, time: number) {
	player.queuedTimeChange = time;
}

export function scrubVideo(player: VideoPlayerController, position: number, isFinalized: boolean) {
	player.isScrubbing = !isFinalized;

	// Pause the video while scrubbing and unpause when finalized.
	player.isPaused = !isFinalized;

	queueVideoTimeChange(player, position * player.duration);
}

export function queueVideoFullscreenChange(player: VideoPlayerController, fullscreen: boolean) {
	player.queuedFullScreenChange = fullscreen;
}
