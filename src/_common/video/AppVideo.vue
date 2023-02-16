<script lang="ts">
import { nextTick, onBeforeUnmount, onMounted, PropType, ref, toRefs, watch } from 'vue';
import AppLoading from '../loading/AppLoading.vue';
import { setVideoMuted, trackVideoPlayerEvent, VideoPlayerController } from './player/controller';

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

const props = defineProps({
	player: {
		type: Object as PropType<VideoPlayerController>,
		required: true,
	},
	showLoading: {
		type: Boolean,
	},
	shouldPlay: {
		type: Boolean,
		default: true,
	},
	initCallback: {
		type: Function as PropType<(videoTag: HTMLVideoElement) => Promise<boolean>>,
		default: undefined,
	},
	/**
	 * If their browser settings block autoplaying with audio, then the browser
	 * will never autoplay the video since it's not set to be muted. We will try
	 * autoplaying "muted" just to see if that works. We don't want to do that
	 * everywhere, so it's an opt-in behavior through a prop.
	 */
	allowDegradedAutoplay: {
		type: Boolean,
	},
});

const { player, showLoading, shouldPlay, initCallback, allowDegradedAutoplay } = toRefs(props);

const root = ref<HTMLElement>();
const isLoaded = ref(false);

let videoElem: HTMLVideoElement = null as any;
let videoStartTime = 0;

onMounted(() => {
	videoElem = document.createElement('video');
	videoElem.style.display = 'block';
	videoElem.style.width = '100%';
	videoElem.poster = player.value.poster || '';
	videoElem.loop = true;
	videoElem.autoplay = shouldPlay.value;
	videoElem.muted = player.value.muted || player.value.context === 'gif';

	// Allows videos in iOS Safari to play without automatically going
	// fullscreen.
	videoElem.playsInline = true;

	setupVideoEvents();

	if (player.value.context !== 'page') {
		player.value.sources.forEach(({ src: url, type }) => {
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

watch(shouldPlay, () => {
	if (shouldPlay.value) {
		tryPlayingVideo();
	} else {
		videoElem.pause();
	}
});

watch(() => player.value.muted, syncMuted, { immediate: true });
watch(() => player.value.volume, syncVolume, { immediate: true });
watch(() => player.value.queuedPlaybackChange, syncPlayState, { immediate: true });
watch(() => player.value.queuedTimeChange, syncTime, { immediate: true });

async function endOfInit() {
	if (initCallback?.value) {
		// Wait for the callback to fail or succeed,
		await initCallback.value(videoElem);
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
	if (!videoStartTime || player.value.context === 'gif') {
		return;
	}

	const playtime = Date.now() - videoStartTime;
	const loops = Math.floor(playtime / player.value.duration);
	trackVideoPlayerEvent(player.value, 'watched', 'playtime', `${Math.ceil(playtime / 1000)}`);
	trackVideoPlayerEvent(player.value, 'watched', 'loops', `${loops}`);
	videoStartTime = 0;
}

function setupVideoEvents() {
	if (!videoElem) {
		return;
	}
	videoElem.addEventListener('play', () => {
		player.value.state = 'playing';
		videoStartTime = Date.now();
	});
	videoElem.addEventListener('pause', () => {
		player.value.state = 'paused';
		trackVideoPlaytime();
	});
	videoElem.addEventListener('volumechange', () => {
		player.value.volume = videoElem.volume;

		if (player.value.altControlsBehavior && player.value.muted != videoElem.muted) {
			setVideoMuted(player.value, videoElem.muted);
		}
	});
	videoElem.addEventListener('durationchange', () => {
		if (videoElem.duration) {
			player.value.duration = videoElem.duration * 1000;
		}
	});
	videoElem.addEventListener(
		'timeupdate',
		() => (player.value.currentTime = videoElem.currentTime * 1000)
	);
	videoElem.addEventListener('progress', () => {
		let time = 0;
		for (let i = 0; i < videoElem.buffered.length; ++i) {
			time = Math.max(time, videoElem.buffered.end(i) * 1000);
		}
		player.value.bufferedTo = time;
	});
}

async function tryPlayingVideo() {
	if (!videoElem) {
		return;
	}

	const startVolume = player.value.volume;
	try {
		await videoElem.play();
		return;
	} catch {}

	if (!allowDegradedAutoplay.value) {
		player.value.state = 'paused';
		return;
	}

	// If autoplaying the video failed, first try setting the volume of the
	// video to 0.
	if (startVolume > 0) {
		player.value.volume = 0;
		await nextTick();
	}

	try {
		await videoElem.play();
		return;
	} catch {}

	// If the autoplaying is still blocked with the volume set to 0, pause the
	// video in the player controller and reset the player volume to the initial
	// setting.
	player.value.state = 'paused';
	player.value.volume = startVolume;
}

function syncMuted() {
	if (!videoElem) {
		return;
	}

	if (player.value.muted !== videoElem.muted) {
		videoElem.muted = player.value.muted;
	}
}

function syncVolume() {
	if (!videoElem) {
		return;
	}

	if (player.value.volume > 0) {
		setVideoMuted(player.value, false);
	}

	if (player.value.volume !== videoElem.volume) {
		videoElem.volume = player.value.volume;
	}
}

async function syncPlayState() {
	if (!videoElem || player.value.queuedPlaybackChange === null) {
		return;
	}

	if (player.value.queuedPlaybackChange === 'paused' && !videoElem.paused) {
		videoElem.pause();
	} else if (player.value.queuedPlaybackChange === 'playing' && videoElem.paused) {
		await tryPlayingVideo();
	}
	player.value.queuedPlaybackChange = null;
	player.value.isLoading = false;
}

function syncTime() {
	if (!videoElem || player.value.queuedTimeChange === null) {
		return;
	}

	const time = player.value.queuedTimeChange;
	player.value.currentTime = time;
	player.value.queuedTimeChange = null;

	// We store in milliseconds, HTMLMediaElement works in seconds.
	videoElem.currentTime = time / 1000;
}
</script>

<template>
	<div
		ref="root"
		:style="{
			position: `relative`,
		}"
	>
		<template v-if="!GJ_IS_SSR">
			<div
				v-if="!isLoaded && showLoading"
				:style="{
					position: `absolute`,
					top: 0,
					right: 0,
					bottom: 0,
					left: 0,
					backgroundColor: `rgba(0, 0, 0, 0.5)`,
					zIndex: 2,
					display: `flex`,
					alignItems: `center`,
					justifyContent: `center`,
				}"
			>
				<AppLoading hide-label no-color stationary />
			</div>
		</template>
		<template v-else>
			<video
				:poster="player.poster"
				:autoplay="shouldPlay"
				:muted="player.context === 'gif'"
				loop
				playsinline
				:style="{
					display: `block`,
					width: `100%`,
					height: `auto`,
				}"
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
