<script lang="ts" setup>
import { Player as ShakaPlayer, polyfill } from 'shaka-player';
import { markRaw, onBeforeUnmount } from 'vue';

import AppVideo from '~common/video/AppVideo.vue';
import { VideoPlayerController } from '~common/video/player/controller';

type Props = {
	player: VideoPlayerController;
	autoplay?: boolean;
	allowDegradedAutoplay?: boolean;
};
const { player, autoplay = false, allowDegradedAutoplay = false } = defineProps<Props>();

let video: HTMLVideoElement | undefined;
let shakaPlayer: ShakaPlayer | undefined;
let isDestroyed = false;

onBeforeUnmount(() => {
	isDestroyed = true;
	if (shakaPlayer) {
		shakaPlayer.destroy();
		shakaPlayer = undefined;
	}
});

// Returns a boolean Promise, indicating success or failure of initialization.
async function initShakaWithVideo(newVideo: HTMLVideoElement) {
	video = markRaw(newVideo);
	polyfill.installAll();
	if (!ShakaPlayer.isBrowserSupported()) {
		console.error('Browser not supported for video streaming.');
		return false;
	}

	shakaPlayer = markRaw(new ShakaPlayer(video));

	shakaPlayer.configure({
		abr: {
			// The goal is to select the 720p format by default.
			defaultBandwidthEstimate: 2_000_000,
		},
		manifest: {
			dash: {
				ignoreMinBufferTime: true,
			},
		},
	});

	const onErrorEvent = (event: any) => onError(event.detail);
	const onError = (error: any) => console.error('Error code', error.code, 'object', error);

	shakaPlayer.addEventListener('error', onErrorEvent);

	if (player.sources.length === 0) {
		throw new Error(`No manifests to load.`);
	}

	let loadedManifest = false;

	// We go with the first one that loads in properly. This way if DASH is
	// unsupported in the browser, we fallback to HLS.
	for (const { src: manifestUrl } of player.sources) {
		if (isDestroyed) {
			return false;
		}

		try {
			await shakaPlayer.load(manifestUrl);
			loadedManifest = true;
			// Don't attempt to load next manifest, this one worked.
			break;
		} catch (e) {
			onError(e);
		}
	}

	if (!loadedManifest) {
		return false;
	}

	return setupShakaEvents();
}

// Returns a boolean, indicating success or failure of initialization.
function setupShakaEvents() {
	if (isDestroyed || !shakaPlayer) {
		return false;
	}

	return true;
}
</script>

<template>
	<AppVideo
		:player="player"
		:should-play="autoplay"
		:init-callback="initShakaWithVideo"
		:allow-degraded-autoplay="allowDegradedAutoplay"
	/>
</template>
