<script lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';

import AppLoading from '~common/loading/AppLoading.vue';
import {
	setVideoMuted,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '~common/video/player/controller';

export type VideoSourceArray = Array<VideoSourceObject>;
type VideoSourceObject = {
	type: string;
	src: string;
};
</script>

<script lang="ts" setup>
// We have to not use Vue for video embed stuff!
// https://forum.ionicframework.com/t/ionic-2-video-video-memory-leak-garbage-collection-solved/52333
// Massive memory leaks if we don't keep this out of Vue and finely tuned.

type Props = {
	player: VideoPlayerController;
	showLoading?: boolean;
	shouldPlay?: boolean;
	initCallback?: (videoTag: HTMLVideoElement) => Promise<boolean>;
	/**
	 * If their browser settings block autoplaying with audio, then the browser
	 * will never autoplay the video since it's not set to be muted. We will try
	 * autoplaying "muted" just to see if that works. We don't want to do that
	 * everywhere, so it's an opt-in behavior through a prop.
	 */
	allowDegradedAutoplay?: boolean;
};
const {
	player,
	showLoading,
	shouldPlay = true,
	initCallback,
	allowDegradedAutoplay,
} = defineProps<Props>();

const root = useTemplateRef('root');
const isLoaded = ref(false);

let videoElem: HTMLVideoElement = null as any;
let videoStartTime = 0;

onMounted(() => {
	videoElem = document.createElement('video');
	videoElem.style.display = 'block';
	videoElem.style.width = '100%';
	videoElem.poster = player.poster || '';
	videoElem.loop = true;
	videoElem.autoplay = shouldPlay;
	videoElem.muted = player.muted || player.context === 'gif';

	// Allows videos in iOS Safari to play without automatically going
	// fullscreen.
	videoElem.playsInline = true;

	setupVideoEvents();

	if (player.context !== 'page') {
		player.sources.forEach(({ src: url, type }) => {
			const elem = document.createElement('source');
			elem.type = type;
			elem.src = url;
			videoElem.appendChild(elem);
		});

		// "play" event will get triggered as soon as it starts playing because
		// of autoplay, or when switching from paused state to playing. We only
		// use it to know if it's loaded in enough to begin the playing, so we
		// can clear it after.
		const onPlay = () => {
			isLoaded.value = true;
			videoElem.removeEventListener('play', onPlay);
		};
		videoElem.addEventListener('play', onPlay);
	}

	// As soon as we append, it'll actually load into view and start playing.
	root.value!.appendChild(videoElem);

	endOfInit();
});

/**
 * This is ridiculous, but it's needed. Memory leaks if we don't!
 * https://dev.w3.org/html5/spec-author-view/video.html#best-practices-for-authors-using-media-elements
 */
onBeforeUnmount(() => {
	trackVideoPlaytime();
	if (videoElem) {
		// Empty all sources.
		while (videoElem.firstChild) {
			videoElem.removeChild(videoElem.firstChild);
		}

		videoElem.load();
	}
});

watch(
	() => shouldPlay,
	() => {
		if (shouldPlay) {
			tryPlayingVideo();
		} else {
			videoElem.pause();
		}
	}
);

watch(() => player.muted, syncMuted, { immediate: true });
watch(() => player.volume, syncVolume, { immediate: true });
watch(() => player.queuedPlaybackChange, syncPlayState, { immediate: true });
watch(() => player.queuedTimeChange, syncTime, { immediate: true });

async function endOfInit() {
	if (initCallback) {
		// Wait for the callback to fail or succeed,
		await initCallback(videoElem);
	}
	// then sync the states.
	await syncStates();
	isLoaded.value = true;
}

async function syncStates() {
	syncVolume();
	syncTime();
	await syncPlayState();
}

function trackVideoPlaytime() {
	// Gifs currently don't pause when they become 'inactive'.
	if (!videoStartTime || player.context === 'gif') {
		return;
	}

	const playtime = Date.now() - videoStartTime;
	const loops = Math.floor(playtime / player.duration);
	trackVideoPlayerEvent(player, 'watched', 'playtime', `${Math.ceil(playtime / 1000)}`);
	trackVideoPlayerEvent(player, 'watched', 'loops', `${loops}`);
	videoStartTime = 0;
}

function setupVideoEvents() {
	if (!videoElem) {
		return;
	}
	videoElem.addEventListener('play', () => {
		player.state = 'playing';
		videoStartTime = Date.now();
	});
	videoElem.addEventListener('pause', () => {
		player.state = 'paused';
		trackVideoPlaytime();
	});
	videoElem.addEventListener('volumechange', () => {
		player.volume = videoElem.volume;

		if (player.altControlsBehavior && player.muted != videoElem.muted) {
			setVideoMuted(player, videoElem.muted);
		}
	});
	videoElem.addEventListener('durationchange', () => {
		if (videoElem.duration) {
			player.duration = videoElem.duration * 1000;
		}
	});
	videoElem.addEventListener(
		'timeupdate',
		() => (player.currentTime = videoElem.currentTime * 1000)
	);
	videoElem.addEventListener('progress', () => {
		let time = 0;
		for (let i = 0; i < videoElem.buffered.length; ++i) {
			time = Math.max(time, videoElem.buffered.end(i) * 1000);
		}
		player.bufferedTo = time;
	});
}

async function tryPlayingVideo() {
	if (!videoElem) {
		return;
	}

	const startVolume = player.volume;
	try {
		await videoElem.play();
		return;
	} catch {}

	if (!allowDegradedAutoplay) {
		player.state = 'paused';
		return;
	}

	// If autoplaying the video failed, first try setting the volume of the
	// video to 0.
	if (startVolume > 0) {
		player.volume = 0;
		await nextTick();
	}

	try {
		await videoElem.play();
		return;
	} catch {}

	// If the autoplaying is still blocked with the volume set to 0, pause the
	// video in the player controller and reset the player volume to the initial
	// setting.
	player.state = 'paused';
	player.volume = startVolume;
}

function syncMuted() {
	if (!videoElem) {
		return;
	}

	if (player.muted !== videoElem.muted) {
		videoElem.muted = player.muted;
	}
}

function syncVolume() {
	if (!videoElem) {
		return;
	}

	if (player.volume > 0) {
		setVideoMuted(
			player,
			false,
			// Need to specify an unmuteVolume here, otherwise volume won't
			// adjust when we're in the middle of a volume scrub.
			{ unmuteVolume: player.volume }
		);
	}

	if (player.volume !== videoElem.volume) {
		videoElem.volume = player.volume;
	}
}

async function syncPlayState() {
	if (!videoElem || player.queuedPlaybackChange === null) {
		return;
	}

	if (player.queuedPlaybackChange === 'paused' && !videoElem.paused) {
		videoElem.pause();
	} else if (player.queuedPlaybackChange === 'playing' && videoElem.paused) {
		await tryPlayingVideo();
	}
	player.queuedPlaybackChange = null;
	player.isLoading = false;
}

function syncTime() {
	if (!videoElem || player.queuedTimeChange === null) {
		return;
	}

	const time = player.queuedTimeChange;
	player.currentTime = time;
	player.queuedTimeChange = null;

	// We store in milliseconds, HTMLMediaElement works in seconds.
	videoElem.currentTime = time / 1000;
}
</script>

<template>
	<div ref="root" class="relative">
		<template v-if="!GJ_IS_SSR">
			<div
				v-if="!isLoaded && showLoading"
				class="absolute inset-0 z-[2] flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
			>
				<AppLoading hide-label no-color stationary />
			</div>
		</template>
		<template v-else>
			<video
				class="block h-auto w-full"
				:poster="player.poster"
				:autoplay="shouldPlay"
				:muted="player.context === 'gif'"
				loop
				playsinline
			>
				<source
					v-for="{ src, type } in player.sources"
					:key="src"
					:type="type"
					:src="src"
				/>
			</video>
		</template>
	</div>
</template>
