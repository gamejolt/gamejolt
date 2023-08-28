<script lang="ts">
import { PropType, Ref, computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue';
import { styleWhen } from '../../../_styles/mixins';
import { formatNumber } from '../../filters/number';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { AppVideoPlayerShakaLazy } from '../../lazy';
import AppLoading from '../../loading/AppLoading.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItemModel } from '../../media-item/media-item-model';
import AppResponsiveDimensions, {
	AppResponsiveDimensionsChangeEvent,
} from '../../responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '../../screen/screen-service';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { VideoSourceArray } from '../AppVideo.vue';
import AppVideoPlayerFullscreen from './AppVideoPlayerFullscreen.vue';
import AppVideoPlayerPlayback from './AppVideoPlayerPlayback.vue';
import AppVideoPlayerScrubber from './AppVideoPlayerScrubber.vue';
import AppVideoPlayerVolume from './AppVideoPlayerVolume.vue';
import {
	VideoPlayerController,
	VideoPlayerControllerContext,
	createVideoPlayerController,
	queueVideoTimeChange,
	scrubVideoVolume,
	toggleVideoPlayback,
	trackVideoPlayerEvent,
} from './controller';

const KeyShortcutsList = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'm', ' '];
type KEY_SHORTCUTS = 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' | 'm' | ' ';

/**
 * The amount of time to wait before hiding the UI after moving your mouse away
 * from the player.
 */
const UIHideTimeout = 400;

/**
 * The amount of time to wait before hiding the UI after mouse movement on the
 * player. We want the cursor to eventually hide away if they stop moving their
 * mouse essentially.
 */
const UIHideTimeoutMovement = 2000;

/**
 * Returns as format `m:ss`, or the remaining seconds with 's' appended if
 * duration is lower than 60 seconds, e.g. `1:23` or `42s`.
 *
 * @param time should be duration in milliseconds.
 */
export function createDenseReadableTimestamp(time: number) {
	time /= 1000;
	const minutes = Math.floor(time / 60);
	const displayMinutes = minutes <= 0 ? '' : `${minutes}:`;
	let seconds = Math.floor(time % 60).toString();

	// Pad the seconds with 0 while we still have minutes.
	if (minutes >= 1) {
		seconds = seconds.padStart(2, '0');
	} else {
		seconds += 's';
	}

	return `${displayMinutes}${seconds}`;
}

/**
 * Always returns as format `m:ss`, e.g. `1:23` or `0:04`.
 *
 * @param time should be duration in milliseconds.
 */
export function createReadableTimestamp(time: number) {
	time /= 1000;
	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60)
		.toString()
		.padStart(2, '0');

	return `${minutes}:${seconds}`;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	context: {
		type: String as PropType<VideoPlayerControllerContext>,
		required: true,
	},
	mediaItem: {
		type: Object as PropType<MediaItemModel>,
		required: true,
	},
	manifests: {
		type: Array as PropType<VideoSourceArray>,
		required: true,
	},
	/**
	 * Indicates that we should use {@link props.parentPlayer} instead of our
	 * locally defined player.
	 */
	useParentPlayer: {
		type: Boolean,
	},
	parentPlayer: {
		type: Object as PropType<VideoPlayerController>,
		default: undefined,
	},
	autoplay: {
		type: Boolean,
	},
	allowDegradedAutoplay: {
		type: Boolean,
	},
	startTime: {
		type: Number,
		default: 0,
	},
	viewCount: {
		type: Number,
		default: 0,
	},
	showVideoStats: {
		type: Boolean,
	},
});

const {
	context,
	mediaItem,
	manifests,
	useParentPlayer,
	parentPlayer,
	autoplay,
	startTime,
	viewCount,
	showVideoStats,
} = toRefs(props);

const emit = defineEmits({
	play: () => true,
	pause: () => true,
	time: (_timestamp: number) => true,
});

const root = ref() as Ref<HTMLDivElement>;

const localPlayer = ref(null) as Ref<VideoPlayerController | null>;

const player = computed(() => {
	if (useParentPlayer.value) {
		return parentPlayer?.value || null;
	}
	return localPlayer.value;
});

watch(
	useParentPlayer,
	useParent => {
		if (useParent) {
			localPlayer.value = null;
		} else {
			localPlayer.value = createVideoPlayerController(manifests.value, context.value);
		}
	},
	{ immediate: true }
);

let _hideUITimer: NodeJS.Timer | null = null;

const isHoveringControls = ref(false);
const isHovered = ref(false);
const responsiveHeight = ref(-1);
const responsiveWidth = ref(-1);

const isFeedVideo = computed(() => isContext('feed'));
const isPageVideo = computed(() => isContext('page'));

function isContext(value: VideoPlayerControllerContext) {
	if (player.value) {
		return player.value.context === value;
	}
	if (useParentPlayer.value) {
		return (parentPlayer?.value?.context || context.value) === value;
	}
	return context.value === value;
}

const height = computed(() => {
	if (import.meta.env.SSR) {
		return null;
	}
	return `${responsiveHeight.value}px`;
});

const width = computed(() => {
	if (import.meta.env.SSR) {
		return null;
	}
	return `${responsiveWidth.value}px`;
});

const blackBarsBreakpoint = computed(() => {
	if (isFeedVideo.value) {
		return '100%';
	}
	if (Screen.isXs) {
		return '100%';
	} else if (Screen.isSm) {
		return '260px';
	}
	return '400px';
});

const shouldShowPausedIndicator = computed(() => {
	if (import.meta.env.SSR) {
		return false;
	}
	if (!player.value) {
		return false;
	}
	return player.value.state === 'paused' && !player.value.isScrubbing;
});

const shouldShowUI = computed(() => {
	if (import.meta.env.SSR) {
		return false;
	}
	return isHoveringControls.value || isHovered.value || player.value?.state === 'paused';
});

const readableTime = computed(() => {
	if (!player.value) {
		return undefined;
	}
	return (
		createReadableTimestamp(player.value.currentTime) +
		' / ' +
		createReadableTimestamp(player.value.duration)
	);
});

const shouldShowLoading = computed(() => {
	if (player.value) {
		return player.value.isLoading && (autoplay.value || player.value.state === 'playing');
	}
	return true;
});

const maxWidth = computed(() => {
	if (!player.value || isFeedVideo.value) {
		return undefined;
	}
	if (player.value.isFullscreen) {
		return Screen.width;
	}
	return mediaItem.value.width;
});

const maxHeight = computed(() => {
	if (import.meta.env.SSR) {
		return undefined;
	}
	if (player.value?.isFullscreen) {
		return Screen.height;
	}

	function modify(value: number) {
		if (isFeedVideo.value) {
			return value * 0.45;
		}
		return value - 150;
	}

	if (Screen.isMobile) {
		return modify(window.screen.height);
	}
	return modify(Screen.height);
});

const shouldShowVideoStats = computed(
	() => showVideoStats.value && player.value && !player.value.isFullscreen
);

const currentTime = computed(() => {
	if (!player.value) {
		return 0;
	}
	return Math.floor(player.value.currentTime / 1000);
});

watch(currentTime, time => {
	if (player.value?.volume) {
		emit('time', time);
	}
});

watch(
	() => player.value?.queuedFullScreenChange,
	queuedChange => {
		if (!player.value || typeof queuedChange !== 'boolean') {
			return;
		}
		if (queuedChange) {
			if (player.value.altControlsBehavior) {
				const video: any = root.value.querySelector('video');
				// iOS Safari doesn't allow us to go fullscreen through our
				// preferred way, so we need to use their fullscreen method
				// and player controls instead.
				video?.webkitEnterFullscreen();
			} else {
				root.value.requestFullscreen();
			}
		} else {
			document.exitFullscreen();
		}
		player.value.queuedFullScreenChange = null;
	}
);

watch(
	() => player.value?.state,
	state => {
		if (state === 'playing') {
			emit('play');
		} else if (state === 'paused') {
			emit('pause');
		}
	}
);

onMounted(() => {
	if (startTime.value && player.value) {
		queueVideoTimeChange(player.value, startTime.value);
	}

	if (isPageVideo.value) {
		root.value.focus();
	}
});

onBeforeUnmount(() => {
	clearHideUITimer();
});

function onChangeDimensions(event: AppResponsiveDimensionsChangeEvent) {
	responsiveHeight.value = event.height;
	responsiveWidth.value = event.containerWidth;
}

function onMouseOut() {
	scheduleUIHide(UIHideTimeout);
}

function onMouseMove() {
	scheduleUIHide(UIHideTimeoutMovement);
}

function scheduleUIHide(delay: number) {
	isHovered.value = true;
	clearHideUITimer();
	_hideUITimer = setTimeout(() => {
		isHovered.value = false;
		clearHideUITimer();
	}, delay);
}

function clearHideUITimer() {
	if (!_hideUITimer) {
		return;
	}

	clearTimeout(_hideUITimer);
	_hideUITimer = null;
}

function onVideoClick() {
	if (!player.value) {
		return;
	}

	toggleVideoPlayback(player.value);
	if (player.value.state === 'playing') {
		scheduleUIHide(UIHideTimeout);
	}
	trackVideoPlayerEvent(
		player.value,
		player.value.state === 'playing' ? 'play' : 'pause',
		'click-video'
	);
}

function onKeypress(event: KeyboardEvent) {
	if (!player.value || (!isPageVideo.value && !player.value.isFullscreen)) {
		return;
	}

	const { key } = event;
	if (KeyShortcutsList.includes(key)) {
		event.preventDefault();
	} else {
		return;
	}

	scheduleUIHide(UIHideTimeoutMovement);

	switch (key as KEY_SHORTCUTS) {
		case ' ':
			toggleVideoPlayback(player.value);
			trackVideoPlayerEvent(
				player.value,
				player.value.state === 'playing' ? 'play' : 'pause',
				'keybind'
			);
			break;
		case 'ArrowLeft':
			triggerScrubLeft();
			break;
		case 'ArrowRight':
			triggerScrubRight();
			break;
		case 'ArrowDown':
			triggerVolumeDown();
			break;
		case 'ArrowUp':
			triggerVolumeUp();
			break;
	}
}

function triggerScrubLeft() {
	if (!player.value) {
		return;
	}
	queueVideoTimeChange(
		player.value,
		player.value.currentTime - Math.min(player.value.duration / 4, 5000)
	);
	trackVideoPlayerEvent(player.value, 'scrub-left', 'keybind');
}

function triggerScrubRight() {
	if (!player.value) {
		return;
	}
	queueVideoTimeChange(
		player.value,
		player.value.currentTime + Math.min(player.value.duration / 4, 5000)
	);
	trackVideoPlayerEvent(player.value, 'scrub-right', 'keybind');
}

function triggerVolumeDown() {
	if (!player.value) {
		return;
	}
	scrubVideoVolume(
		player.value,
		Math.round(Math.max(player.value.volume - 0.1, 0) * 100) / 100,
		'end'
	);
	trackVideoPlayerEvent(player.value, 'volume-down', 'keybind');
}

function triggerVolumeUp() {
	if (!player.value) {
		return;
	}
	scrubVideoVolume(
		player.value,
		Math.round(Math.min(player.value.volume + 0.1, 1) * 100) / 100,
		'end'
	);
	trackVideoPlayerEvent(player.value, 'volume-up', 'keybind');
}

function onFullscreenChange() {
	if (!player.value) {
		return;
	}
	player.value.isFullscreen = document.fullscreenElement === root.value;
}
</script>

<template>
	<div
		ref="root"
		class="_player"
		:tabindex="player?.isFullscreen || isPageVideo ? -1 : undefined"
		:class="{ _fullscreen: player?.isFullscreen }"
		@fullscreenchange="onFullscreenChange"
		@mouseleave="onMouseOut"
		@mousemove="onMouseMove"
		@keydown="onKeypress"
	>
		<AppResponsiveDimensions
			class="_video-container"
			:class="{ '_with-stats': shouldShowVideoStats }"
			:style="{ minWidth: blackBarsBreakpoint }"
			:ratio="mediaItem.width / mediaItem.height"
			:max-width="maxWidth"
			:max-height="maxHeight"
			@change="onChangeDimensions"
		>
			<div
				class="_content-container"
				:class="{
					'_paused-cursor': player?.state === 'paused',
					'_page-video': isPageVideo,
				}"
			>
				<AppVideoPlayerShakaLazy
					v-if="player && !GJ_IS_SSR"
					class="_video"
					:style="{ width }"
					:player="player"
					:autoplay="autoplay"
					:allow-degraded-autoplay="allowDegradedAutoplay"
				/>

				<!--
				This will show behind the video so that we can switch to it while
				the video is loading and when it's unfocused/not active.
				-->
				<AppMediaItemBackdrop
					class="_backdrop"
					:style="{
						height,
						width,
						...styleWhen(GJ_IS_SSR, {
							position: `relative`,
						}),
					}"
					:media-item="mediaItem"
				>
					<AppImgResponsive
						class="_img"
						:style="{ width }"
						:src="mediaItem.mediaserver_url"
						alt=""
					/>
				</AppMediaItemBackdrop>

				<div
					class="_overlay _ui"
					:class="{
						'_paused-cursor': player?.state === 'paused',
						_darken: shouldShowLoading,
					}"
					@click="onVideoClick"
				>
					<AppLoading v-if="shouldShowLoading" no-color hide-label stationary />
					<template v-else>
						<Transition>
							<div
								v-if="shouldShowPausedIndicator"
								class="_paused-indicator _ui anim-fade-enter-enlarge anim-fade-leave-shrink"
							>
								<AppJolticon class="_paused-indicator-icon" icon="play" />
							</div>
						</Transition>
					</template>
				</div>

				<Transition v-if="player">
					<div
						v-if="shouldShowUI"
						class="_bottom _ui anim-fade-enter anim-fade-leave-down"
						@mouseenter="isHoveringControls = true"
						@mouseleave="isHoveringControls = false"
						@click.stop
					>
						<div class="_bottom-gradient">
							<div class="_bottom-controls">
								<AppVideoPlayerScrubber :player="player" />

								<div class="_row">
									<AppVideoPlayerPlayback :player="player" />
									<AppVideoPlayerVolume
										:style="{
											marginRight: `auto`,
										}"
										:player="player"
										has-slider
									/>

									<div
										v-if="player.duration > 0"
										class="_time anim-fade-in-enlarge"
									>
										<div class="_time-inner">
											{{ readableTime }}
										</div>
									</div>
									<AppVideoPlayerFullscreen :player="player" />
								</div>
							</div>
						</div>
					</div>
					<div v-else class="_bottom _ui anim-fade-enter anim-fade-leave-down">
						<div class="_bottom-controls">
							<div class="_row">
								<slot name="controls-peek" />
							</div>
						</div>
					</div>
				</Transition>
			</div>

			<div v-if="shouldShowVideoStats" class="_video-stats">
				<span v-app-tooltip.touchable="$gettext(`Plays`)">
					<AppJolticon icon="play" />
					<span class="_video-stats-label">
						{{ formatNumber(viewCount) }}
					</span>
				</span>
			</div>
		</AppResponsiveDimensions>
	</div>
</template>

<style lang="stylus" scoped>
$-zindex-backdrop = 0
$-zindex-video = 1
$-zindex-ui = 2

._fullscreen
	._video-container
		width: 100vw !important
		height: 100vh !important

._player
	position: relative
	height: 100%
	min-width: 100%
	display: flex
	flex-direction: column
	align-items: center

	&:focus
		outline: none

._video-container
	position: relative

	&._with-stats
		margin-bottom: 24px

	&:hover
		._time-inner
			background-color: rgba($black, 1)

._content-container
	height: 100%
	background-color: $black
	display: flex
	justify-content: center
	align-items: center
	position: relative
	overflow: hidden

	&._page-video
		@media $media-sm-up
			rounded-corners-lg()

._paused-cursor
	cursor: pointer

._video
	position: relative
	margin: auto
	z-index: $-zindex-video

._overlay
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	display: flex
	justify-content: center
	align-items: center

	&._darken
		background-color: rgba($black, 0.5)

._ui
	z-index: $-zindex-ui

._backdrop
	position: absolute
	z-index: $-zindex-backdrop

._img
	max-height: 100%

._paused-indicator
	pointer-events: none
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	align-items: center
	justify-content: center
	text-shadow: 1px 1px 3px rgba($black, 0.5)

._paused-indicator-icon
	color: white
	font-size: 60px

._bottom
	position: absolute
	left: 0
	right: 0
	bottom: 0

._bottom-gradient
	background-image: linear-gradient(to bottom, rgba($black, 0), rgba($black, 0.5))
	padding-top: 16px

._bottom-controls
	display: flex
	flex-direction: column
	padding-left: 4px
	padding-right: 4px

._row
	display: flex

._time
	display: inline-flex
	align-items: center
	margin-right: 8px
	white-space: nowrap

._time-inner
	rounded-corners()
	padding: 4px 6px
	background-color: rgba($black, 0.4)
	color: var(--dark-theme-fg)
	font-size: $font-size-small
	pointer-events: none
	user-select: none
	transition: background-color 250ms $strong-ease-out

._video-stats
	position: absolute
	top: calc(100% + 4px)
	right: 0
	font-weight: bold

	> span
		display: inline-flex
		align-items: center

	@media $media-xs
		margin-right: ($grid-gutter-width-xs / 2)

._video-stats-label
	margin-left: 4px
</style>
