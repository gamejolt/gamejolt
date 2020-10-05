import { SettingVideoPlayerVolume } from '../settings/settings.service';

export class PlayerController {
	shouldPlay = false;
	volume = SettingVideoPlayerVolume.get();
	currentTime = 0;
	duration = 0;
	// not sure if needed, but could use to keep track of things
	scrubberPollingInterval = 0;
	video!: HTMLVideoElement;
}

export function togglePlayerControllerPlayback(player: PlayerController) {
	if (!player.video) {
		return;
	}

	player.shouldPlay = !player.shouldPlay;
	player.video.paused ? player.video.play() : player.video.pause();
}

export function setPlayerControllerVolume(player: PlayerController, level: number) {
	const volume = Math.round(level * 100) / 100;

	SettingVideoPlayerVolume.set(Math.min(1, Math.max(0, volume)));
	if (!player.video) {
		return;
	}

	player.video.volume = SettingVideoPlayerVolume.get();
	player.volume = player.video.volume;
}

export function setPlayerControllerDuration(player: PlayerController, length: number) {
	if (!player.video) {
		return;
	}

	player.duration = length;
}

export function setPlayerControllerTimestamp(player: PlayerController, time: number) {
	if (!player.video) {
		return;
	}

	player.currentTime = time;
}

export function togglePlayerControllerFullscreen(player: PlayerController) {
	if (!player.video) {
		return;
	}

	player.video.requestFullscreen();
}

export function setPlayerControllerVideo(player: PlayerController, video: HTMLVideoElement) {
	player.video = video;

	player.video.volume = SettingVideoPlayerVolume.get();
	player.volume = player.video.volume;
}

export function setPlayerControllerPollingInterval(player: PlayerController, interval: number) {
	player.scrubberPollingInterval = interval;
}
