<script lang="ts">
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { formatNumber } from '../../filters/number';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import { AppVideoPlayerShakaLazy } from '../../lazy';
import AppLoading from '../../loading/AppLoading.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItem } from '../../media-item/media-item-model';
import AppResponsiveDimensions, {
	AppResponsiveDimensionsChangeEvent,
} from '../../responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '../../screen/screen-service';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { VideoSourceArray } from '../AppVideo.vue';
import AppPlayerFullscreen from './AppVideoPlayerFullscreen.vue';
import AppPlayerPlayback from './AppVideoPlayerPlayback.vue';
import {
	createVideoPlayerController,
	queueVideoTimeChange,
	scrubVideoVolume,
	toggleVideoPlayback,
	trackVideoPlayerEvent,
	VideoPlayerController,
	VideoPlayerControllerContext,
} from './controller';
import AppPlayerScrubber from './scrubber/scrubber.vue';
import AppPlayerVolume from './volume/volume.vue';

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

@Options({
	components: {
		AppVideoPlayerShakaLazy,
		AppPlayerPlayback,
		AppPlayerVolume,
		AppPlayerScrubber,
		AppPlayerFullscreen,
		AppLoading,
		AppResponsiveDimensions,
		AppImgResponsive,
		AppMediaItemBackdrop,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppVideoPlayer extends Vue {
	@Prop({ type: Object, required: true }) mediaItem!: MediaItem;
	@Prop({ type: Array, required: true }) manifests!: VideoSourceArray;
	@Prop({ type: Boolean, default: false }) autoplay!: boolean;
	@Prop({ type: Number, default: 0 }) startTime!: number;
	@Prop({ type: String, default: null }) context!: VideoPlayerControllerContext;
	@Prop({ type: Number, default: 0 }) viewCount!: number;
	@Prop({ type: Boolean, default: false }) showVideoStats!: boolean;

	player: VideoPlayerController = null as any;
	isHoveringControls = false;
	private isHovered = false;
	private _hideUITimer?: NodeJS.Timer;

	private responsiveHeight = -1;
	private responsiveWidth = -1;

	readonly formatNumber = formatNumber;
	readonly Screen = Screen;

	declare $el: HTMLDivElement;

	@Emit('play') emitPlay() {}

	get height() {
		return import.meta.env.SSR ? null : `${this.responsiveHeight}px`;
	}

	get width() {
		return import.meta.env.SSR ? null : `${this.responsiveWidth}px`;
	}

	get blackBarsBreakpoint() {
		if (Screen.isXs) {
			return '100%';
		} else if (Screen.isSm) {
			return '260px';
		}

		return '400px';
	}

	get shouldShowPausedIndicator() {
		return !import.meta.env.SSR && this.player.state === 'paused' && !this.player.isScrubbing;
	}

	get shouldShowUI() {
		if (import.meta.env.SSR) {
			return false;
		}
		return this.isHoveringControls || this.isHovered || this.player.state === 'paused';
	}

	get readableTime() {
		return (
			createReadableTimestamp(this.player.currentTime) +
			' / ' +
			createReadableTimestamp(this.player.duration)
		);
	}

	get shouldShowLoading() {
		if (this.player) {
			return this.player.isLoading && (this.autoplay || this.player.state === 'playing');
		}
		return true;
	}

	get playerMaxWidth() {
		return this.player.isFullscreen ? Screen.width : this.mediaItem.width;
	}

	get deviceMaxHeight() {
		if (import.meta.env.SSR) {
			return undefined;
		}

		if (this.player.isFullscreen) {
			return Screen.height;
		}

		if (Screen.isMobile) {
			return window.screen.height - 150;
		}
		return Screen.height - 150;
	}

	get shouldShowVideoStats() {
		return this.showVideoStats && !this.player.isFullscreen;
	}

	created() {
		this.player = createVideoPlayerController(this.manifests, this.context);
	}

	mounted() {
		if (this.startTime) {
			queueVideoTimeChange(this.player, this.startTime);
		}

		this.$el.focus();
	}

	beforeUnmount() {
		this.clearHideUITimer();
	}

	onChangeDimensions(event: AppResponsiveDimensionsChangeEvent) {
		this.responsiveHeight = event.height;
		this.responsiveWidth = event.containerWidth;
	}

	onMouseOut() {
		this.scheduleUIHide(UIHideTimeout);
	}

	onMouseMove() {
		this.scheduleUIHide(UIHideTimeoutMovement);
	}

	private scheduleUIHide(delay: number) {
		this.isHovered = true;
		this.clearHideUITimer();
		this._hideUITimer = setTimeout(() => {
			this.isHovered = false;
			this.clearHideUITimer();
		}, delay);
	}

	private clearHideUITimer() {
		if (!this._hideUITimer) {
			return;
		}

		clearTimeout(this._hideUITimer);
		this._hideUITimer = undefined;
	}

	onVideoClick() {
		toggleVideoPlayback(this.player);
		if (this.player.state === 'playing') {
			this.scheduleUIHide(UIHideTimeout);
		}
		trackVideoPlayerEvent(
			this.player,
			this.player.state === 'playing' ? 'play' : 'pause',
			'click-video'
		);
	}

	onKeypress(event: KeyboardEvent) {
		const { key } = event;
		if (KeyShortcutsList.includes(key)) {
			event.preventDefault();
		} else {
			return;
		}

		this.scheduleUIHide(UIHideTimeoutMovement);

		switch (key as KEY_SHORTCUTS) {
			case ' ':
				toggleVideoPlayback(this.player);
				trackVideoPlayerEvent(
					this.player,
					this.player.state === 'playing' ? 'play' : 'pause',
					'keybind'
				);
				break;
			case 'ArrowLeft':
				this.triggerScrubLeft();
				break;
			case 'ArrowRight':
				this.triggerScrubRight();
				break;
			case 'ArrowDown':
				this.triggerVolumeDown();
				break;
			case 'ArrowUp':
				this.triggerVolumeUp();
				break;
		}
	}

	triggerScrubLeft() {
		queueVideoTimeChange(
			this.player,
			this.player.currentTime - Math.min(this.player.duration / 4, 5000)
		);
		trackVideoPlayerEvent(this.player, 'scrub-left', 'keybind');
	}

	triggerScrubRight() {
		queueVideoTimeChange(
			this.player,
			this.player.currentTime + Math.min(this.player.duration / 4, 5000)
		);
		trackVideoPlayerEvent(this.player, 'scrub-right', 'keybind');
	}

	triggerVolumeDown() {
		scrubVideoVolume(
			this.player,
			Math.round(Math.max(this.player.volume - 0.1, 0) * 100) / 100,
			'end'
		);
		trackVideoPlayerEvent(this.player, 'volume-down', 'keybind');
	}

	triggerVolumeUp() {
		scrubVideoVolume(
			this.player,
			Math.round(Math.min(this.player.volume + 0.1, 1) * 100) / 100,
			'end'
		);
		trackVideoPlayerEvent(this.player, 'volume-up', 'keybind');
	}

	onFullscreenChange() {
		this.player.isFullscreen = document.fullscreenElement === this.$el;
	}

	@Watch('player.queuedFullScreenChange')
	syncWithState() {
		console.log('syncing state');
		if (this.player.queuedFullScreenChange !== null) {
			if (this.player.queuedFullScreenChange) {
				if (this.player.altControlsBehavior) {
					const video: any = this.$el.querySelector('video');
					// iOS Safari doesn't allow us to go fullscreen through our
					// preferred way, so we need to use their fullscreen method
					// and player controls instead.
					video?.webkitEnterFullscreen();
				} else {
					this.$el.requestFullscreen();
				}
			} else {
				document.exitFullscreen();
			}
			this.player.queuedFullScreenChange = null;
		}
	}

	@Watch('player.state')
	onStateChange() {
		if (this.player.state === 'playing') {
			this.emitPlay();
		}
	}
}
</script>

<template>
	<div
		class="-player"
		tabindex="-1"
		:class="{ '-fullscreen': player.isFullscreen }"
		@fullscreenchange="onFullscreenChange"
		@mouseleave="onMouseOut"
		@mousemove="onMouseMove"
		@keydown="onKeypress"
	>
		<AppResponsiveDimensions
			class="-video-container"
			:class="{ '-with-stats': shouldShowVideoStats }"
			:style="{ minWidth: blackBarsBreakpoint || 'unset' }"
			:ratio="mediaItem.width / mediaItem.height"
			:max-width="playerMaxWidth"
			:max-height="deviceMaxHeight"
			@change="onChangeDimensions"
		>
			<div
				class="-content-container"
				:class="{
					'-paused-cursor': player.state === 'paused',
				}"
				@click="onVideoClick"
			>
				<AppVideoPlayerShakaLazy
					v-if="player && !GJ_IS_SSR"
					class="-video"
					:style="{ width }"
					:player="player"
					:autoplay="autoplay"
				/>

				<!--
				This will show behind the video so that we can switch to it while
				the video is loading and when it's unfocused/not active.
				-->
				<AppMediaItemBackdrop
					class="-backdrop"
					:style="{ height, width, position: GJ_IS_SSR ? 'relative' : null }"
					:media-item="mediaItem"
				>
					<AppImgResponsive
						class="-img"
						:style="{ width }"
						:src="mediaItem.mediaserver_url"
						alt=""
					/>
				</AppMediaItemBackdrop>

				<div
					class="-overlay -ui"
					:class="{
						'-paused-cursor': player.state === 'paused',
						'-darken': shouldShowLoading,
					}"
					@click="onVideoClick"
				>
					<AppLoading v-if="shouldShowLoading" no-color hide-label stationary />
					<template v-else>
						<transition>
							<div
								v-if="shouldShowPausedIndicator"
								class="-paused-indicator -ui anim-fade-enter-enlarge anim-fade-leave-shrink"
							>
								<AppJolticon class="-paused-indicator-icon" icon="play" />
							</div>
						</transition>
					</template>
				</div>

				<transition>
					<div
						v-if="shouldShowUI"
						class="-bottom -ui anim-fade-enter anim-fade-leave-down"
						@mouseenter="isHoveringControls = true"
						@mouseleave="isHoveringControls = false"
						@click.stop
					>
						<div class="-bottom-gradient">
							<div class="-bottom-controls">
								<AppPlayerScrubber :player="player" />

								<div class="-row">
									<AppPlayerPlayback :player="player" />
									<AppPlayerVolume
										:player="player"
										has-slider
										@volume-down="triggerVolumeDown"
										@volume-up="triggerVolumeUp"
									/>

									<div style="flex: auto" />

									<div
										v-if="player.duration > 0"
										class="-time anim-fade-in-enlarge"
									>
										<div class="-time-inner">
											{{ readableTime }}
										</div>
									</div>
									<AppPlayerFullscreen :player="player" />
								</div>
							</div>
						</div>
					</div>
				</transition>
			</div>

			<div v-if="shouldShowVideoStats" class="-video-stats">
				<span v-app-tooltip.touchable="$gettext(`Plays`)">
					<AppJolticon icon="play" />
					<span class="-video-stats-label">
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

.-fullscreen
	.-video-container
		width: 100vw !important
		height: 100vh !important

.-player
	position: relative
	height: 100%
	min-width: 100%
	display: flex
	flex-direction: column
	align-items: center

	&:focus
		outline: none

.-video-container
	position: relative

	&.-with-stats
		margin-bottom: 24px

	&:hover
		.-time-inner
			background-color: rgba($black, 1)

.-content-container
	height: 100%
	background-color: $black
	display: flex
	justify-content: center
	align-items: center
	position: relative
	overflow: hidden

	@media $media-sm-up
		rounded-corners-lg()

.-paused-cursor
	cursor: pointer

.-video
	position: relative
	margin: auto
	z-index: $-zindex-video

.-overlay
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	display: flex
	justify-content: center
	align-items: center

	&.-darken
		background-color: rgba($black, 0.5)

.-ui
	z-index: $-zindex-ui

.-backdrop
	position: absolute
	z-index: $-zindex-backdrop

.-img
	max-height: 100%

.-paused-indicator
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

	&-icon
		color: white
		font-size: 60px

.-bottom
	position: absolute
	left: 0
	right: 0
	bottom: 0

	&-gradient
		background-image: linear-gradient(to bottom, rgba($black, 0), rgba($black, 0.5))
		padding-top: 16px

	&-controls
		display: flex
		flex-direction: column
		padding-left: 4px
		padding-right: 4px

.-row
	display: flex

.-time
	display: inline-flex
	align-items: center
	margin-right: 8px

	&-inner
		rounded-corners()
		padding: 4px 6px
		background-color: rgba($black, 0.4)
		color: var(--dark-theme-fg)
		font-size: $font-size-small
		pointer-events: none
		user-select: none
		transition: background-color 250ms $strong-ease-out

.-video-stats
	position: absolute
	top: calc(100% + 4px)
	right: 0
	font-weight: bold

	> span
		display: inline-flex
		align-items: center

	@media $media-xs
		margin-right: ($grid-gutter-width-xs / 2)

	&-label
		margin-left: 4px
</style>
