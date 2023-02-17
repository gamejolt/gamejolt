<script lang="ts" setup>
import { Player as ShakaPlayer, polyfill } from 'shaka-player';
import { markRaw, onBeforeUnmount, PropType, toRefs } from 'vue';
import AppVideo from '../AppVideo.vue';
import { trackVideoPlayerEvent, VideoPlayerController } from './controller';

const props = defineProps({
	player: {
		type: Object as PropType<VideoPlayerController>,
		required: true,
	},
	autoplay: {
		type: Boolean,
	},
	allowDegradedAutoplay: {
		type: Boolean,
	},
});

const { player, allowDegradedAutoplay } = toRefs(props);

let video: HTMLVideoElement | undefined;
let shakaPlayer: ShakaPlayer | undefined;
let previousState: shaka.extern.Track | null = null;
let currentState: shaka.extern.Track | null = null;
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
		trackVideoPlayerEvent(player.value, 'browser-unsupported');
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

	if (player.value.sources.length === 0) {
		throw new Error(`No manifests to load.`);
	}

	let chosenManifestType: string | undefined;

	// We go with the first one that loads in properly. This way if DASH is
	// unsupported in the browser, we fallback to HLS.
	for (const { src: manifestUrl, type: manifestType } of player.value.sources) {
		if (isDestroyed) {
			return false;
		}

		try {
			await shakaPlayer.load(manifestUrl);
			chosenManifestType = manifestType.split('/').pop();
			// Don't attempt to load next manifest, this one worked.
			break;
		} catch (e) {
			onError(e);
		}
	}

	if (!chosenManifestType) {
		trackVideoPlayerEvent(player.value, 'load-manifest-failed');
		return false;
	}
	trackVideoPlayerEvent(player.value, 'load-manifest', chosenManifestType);

	return setupShakaEvents();
}

// Returns a boolean, indicating success or failure of initialization.
function setupShakaEvents() {
	if (isDestroyed || !shakaPlayer) {
		return false;
	}

	shakaPlayer.addEventListener('adaptation', () => {
		const tracks: shaka.extern.TrackList = shakaPlayer!.getVariantTracks();

		if (currentState) {
			previousState = currentState;
		}

		currentState = tracks.find(i => i.active) || null;

		if (previousState && currentState) {
			const prev = previousState;
			const next = currentState;

			if (prev === next || !prev.videoBandwidth || !next.videoBandwidth) {
				return;
			}

			let eventAction = prev.videoBandwidth < next.videoBandwidth ? 'increase-' : 'decrease-';
			eventAction += Math.abs(prev.id - next.id);

			if (!eventAction) {
				return;
			}

			trackVideoPlayerEvent(
				player.value,
				'bitrate-change',
				eventAction,
				`${next.videoBandwidth}`
			);
		}
	});
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
