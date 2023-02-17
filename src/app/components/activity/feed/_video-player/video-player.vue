<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Inject, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { ContentFocus } from '../../../../../_common/content-focus/content-focus.service';
import AppImgResponsive from '../../../../../_common/img/AppImgResponsive.vue';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import AppResponsiveDimensions, {
	AppResponsiveDimensionsChangeEvent,
} from '../../../../../_common/responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	createScrollInview,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import {
	SettingVideoPlayerFeedAutoplay,
	SettingVideoPlayerVolume,
} from '../../../../../_common/settings/settings.service';
import AppVideo, { VideoSourceArray } from '../../../../../_common/video/AppVideo.vue';
import {
	createVideoPlayerController,
	scrubVideoVolume,
	toggleVideoPlayback,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '../../../../../_common/video/player/controller';
import { createDenseReadableTimestamp } from '../../../../../_common/video/player/player.vue';
import { AppVideoPlayerShakaLazy } from '../../../lazy';
import { ActivityFeedItem } from '../item-service';
import { ActivityFeedKey, ActivityFeedView, InviewConfigFocused } from '../view';

/**
 * How much time in ms to wait before loading the video player in once this item
 * becomes focused. We delay the load so if they're scrolling through the feed
 * fast we're not loading a ton video players in and slowing down the feed.
 */
const LoadDelay = 300;

@Options({
	components: {
		AppScrollInview,
		AppImgResponsive,
		AppResponsiveDimensions,
		AppMediaItemBackdrop,
		AppLoading,
		AppVideo,
		AppVideoPlayerShakaLazy,
	},
})
export default class AppActivityFeedVideoPlayer extends Vue {
	@Prop({ type: Object, required: true })
	feedItem!: ActivityFeedItem;

	@Prop({ type: Object, required: true })
	mediaItem!: MediaItem;

	@Prop({ type: Array, required: true })
	manifests!: VideoSourceArray;

	@Inject({ from: ActivityFeedKey })
	feed!: ActivityFeedView;

	autoplay = SettingVideoPlayerFeedAutoplay.get();
	player: VideoPlayerController | null = null;
	isHovered = false;

	private responsiveHeight = -1;
	private responsiveWidth = -1;

	shouldLoadVideo = false;
	shouldLoadVideoTimer: null | NodeJS.Timer = null;

	readonly InviewConfigFocused = InviewConfigFocused;
	readonly focusedController = setup(() => createScrollInview());
	readonly Screen = Screen;

	get shouldShowLoading() {
		if (this.player) {
			return (
				this.player.isLoading && (this.shouldAutoplay || this.player.state === 'playing')
			);
		}
		return true;
	}

	get height() {
		return import.meta.env.SSR ? null : `${this.responsiveHeight}px`;
	}

	get width() {
		return import.meta.env.SSR ? null : `${this.responsiveWidth}px`;
	}

	get maxPlayerHeight() {
		if (import.meta.env.SSR) {
			return undefined;
		}

		if (Screen.isMobile) {
			window.screen.height * 0.45;
		}
		return Screen.height * 0.45;
	}

	private get shouldshowGeneralControls() {
		// Clicking on 'playback controls while the video is trying to play can end up de-syncing the player state.
		if (this.player?.isLoading) {
			return false;
		}
		return Screen.isMobile || this.isHovered || this.player?.state === 'paused';
	}

	get shouldShowPlaybackControl() {
		if (!this.contentHasFocus) {
			return false;
		}
		return this.shouldshowGeneralControls;
	}

	get isMuted() {
		if (!this.player) {
			return false;
		}
		return this.player.volume === 0 || this.player.muted;
	}

	get shouldShowMuteControl() {
		return this.shouldshowGeneralControls || this.isMuted;
	}

	get remainingTime() {
		if (!this.player) {
			return null;
		}

		return createDenseReadableTimestamp(this.player.duration - this.player.currentTime);
	}

	get currentTime() {
		if (!this.player) {
			return 0;
		}
		return Math.floor(this.player.currentTime / 1000);
	}

	get contentHasFocus() {
		return ContentFocus.hasFocus;
	}

	get shouldAutoplay() {
		return this.contentHasFocus && this.autoplay;
	}

	@Emit('play') emitPlay() {}
	@Emit('time') emitTime(_timestamp: number) {}

	onChangeDimensions(event: AppResponsiveDimensionsChangeEvent) {
		this.responsiveHeight = event.height;
		this.responsiveWidth = event.containerWidth;
	}

	onMouseOut() {
		this.isHovered = false;
	}

	onMouseIn() {
		this.isHovered = true;
	}

	onClickPlayback() {
		if (!this.player) {
			return;
		}

		if (this.player.state === 'playing') {
			SettingVideoPlayerFeedAutoplay.set(false);
		} else {
			SettingVideoPlayerFeedAutoplay.set(true);
		}

		// This function needs to come after the changes to Settings,
		// as it gets handled asynchronously through the Shaka player component.
		toggleVideoPlayback(this.player);
		trackVideoPlayerEvent(
			this.player,
			this.player.state === 'playing' ? 'play' : 'pause',
			'click-control'
		);
	}

	onClickMute() {
		if (!this.player) {
			return;
		}

		scrubVideoVolume(
			this.player,
			!this.isMuted ? 0 : Math.max(0.25, SettingVideoPlayerVolume.get()),
			'end'
		);
		this.player.muted = this.player.volume === 0;

		trackVideoPlayerEvent(this.player, this.isMuted ? 'mute' : 'unmute', 'click-control');
	}

	mounted() {
		this.onIsFocusedChange();
	}

	beforeUnmount() {
		this.clearVideoShouldLoadTimer();
	}

	@Watch('player.state')
	onStateChange() {
		if (this.player?.state === 'playing') {
			this.emitPlay();
		}
	}

	@Watch('contentHasFocus', { immediate: true })
	onContentFocusChange() {
		if (!this.player) {
			return;
		}
		if (!this.contentHasFocus) {
			toggleVideoPlayback(this.player, 'paused');
		} else if (SettingVideoPlayerFeedAutoplay.get()) {
			toggleVideoPlayback(this.player, 'playing');
		}
	}

	@Watch('currentTime')
	onCurrentTimeChange() {
		// We only emit the current time if they're watching it unmuted.
		if (this.player?.volume !== 0) {
			this.emitTime(this.currentTime);
		}
	}

	@Watch('focusedController.isFocused')
	onIsFocusedChange() {
		const isFocused = this.focusedController.isFocused;

		if (isFocused) {
			this.setVideoShouldLoadTimer();
		} else {
			this.clearVideoShouldLoadTimer();
			this.shouldLoadVideo = false;
		}
	}

	@Watch('shouldLoadVideo')
	onShouldLoadVideoChange() {
		if (this.shouldLoadVideo) {
			this.player = createVideoPlayerController(this.manifests, 'feed');
			this.autoplay = SettingVideoPlayerFeedAutoplay.get();
		} else {
			this.player = null;
		}
	}

	private clearVideoShouldLoadTimer() {
		if (this.shouldLoadVideoTimer) {
			clearTimeout(this.shouldLoadVideoTimer);
			this.shouldLoadVideoTimer = null;
		}
	}

	private setVideoShouldLoadTimer() {
		this.clearVideoShouldLoadTimer();
		this.shouldLoadVideoTimer = setTimeout(() => {
			this.shouldLoadVideo = true;
		}, LoadDelay);
	}
}
</script>

<template>
	<AppScrollInview
		class="-player theme-dark"
		:config="InviewConfigFocused"
		:controller="focusedController"
		@mouseleave="onMouseOut"
		@mouseenter="onMouseIn"
	>
		<AppResponsiveDimensions
			class="-video-container"
			:ratio="mediaItem.width / mediaItem.height"
			:max-height="maxPlayerHeight"
			@change="onChangeDimensions"
		>
			<div class="-content-container">
				<AppVideoPlayerShakaLazy
					v-if="player && !GJ_IS_SSR"
					class="-video"
					:style="{ width }"
					:player="player"
					:autoplay="autoplay"
					allow-degraded-autoplay
				/>

				<div v-if="shouldShowLoading" class="-overlay -ui">
					<AppLoading no-color hide-label stationary />
				</div>

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
			</div>
		</AppResponsiveDimensions>

		<div v-if="player" class="-bottom -ui" @click.stop>
			<div class="-bottom-gradient">
				<div class="-bottom-controls">
					<transition name="fade">
						<div
							v-if="shouldShowPlaybackControl"
							class="-control"
							@click="onClickPlayback"
						>
							<AppJolticon :icon="player.state === 'playing' ? 'pause' : 'play'" />
						</div>
					</transition>

					<transition-group tag="div" name="fade" class="-transitions-group">
						<div
							v-for="control of ['time', 'bars', 'volume']"
							:key="control"
							class="-transitions"
						>
							<template v-if="player">
								<template v-if="control === 'time'">
									<transition name="fade">
										<div
											v-if="player.state === 'playing' && player.duration > 0"
											class="-time"
										>
											<div class="-time-inner">
												{{ remainingTime }}
											</div>
										</div>
									</transition>
								</template>
								<template v-else-if="control === 'bars'">
									<transition name="fade">
										<div v-if="player.state === 'playing'" class="-bars">
											<div class="-bar -bar-1" />
											<div class="-bar -bar-2" />
											<div class="-bar -bar-3" />
										</div>
									</transition>
								</template>
								<template v-else-if="control === 'volume'">
									<div
										v-if="shouldShowMuteControl"
										class="-control"
										@click="onClickMute"
									>
										<AppJolticon
											:icon="player.volume > 0 ? 'audio' : 'audio-mute'"
										/>
									</div>
								</template>
							</template>
						</div>
					</transition-group>
				</div>
			</div>
		</div>
	</AppScrollInview>
</template>

<style lang="stylus" scoped>
@import '../variables'
@import '../../../../../_common/video/player/common'

$-zindex-backdrop = 0
$-zindex-video = 1
$-zindex-ui = 2
$-controls-height = 48px
$-controls-spacing = 8px

.-ssr
	display: flex
	justify-content: center
	align-items: center

	> .jolticon
		position: absolute
		font-size: $jolticon-size * 10
		filter: drop-shadow(0 0 6px $black)

.-player
	position: relative
	overflow: hidden
	height: 100%
	width: 100%

	&:hover
		.-time-inner
			background-color: rgba($black, 1)

.-video-container
	position: relative
	// Overrides the 'width' styling, allowing us to add borders to the sides of videos and image placeholders.
	min-width: 100%

.-content-container
	height: 100%
	background-color: $black
	display: flex
	justify-content: center

.-video
	z-index: $-zindex-video

.-overlay
	position: absolute
	display: flex
	justify-content: center
	align-items: center
	background-color: rgba($black, 0.5)
	width: 100%
	height: 100%

.-ui
	z-index: $-zindex-ui

.-backdrop
	position: absolute
	top: 0
	z-index: $-zindex-backdrop

.-img
	max-height: 100%

.-control
	display: inline-flex
	justify-content: center
	align-items: center
	width: $-controls-height
	height: @width

	::v-deep(.jolticon)
		font-size: $jolticon-size * 1.5
		color: $white

.-time
	display: inline-flex
	justify-content: center
	align-items: center
	margin-right: $-controls-spacing
	height: $-controls-height

	&-inner
		rounded-corners()
		background-color: rgba($black, 0.4)
		color: var(--dark-theme-fg)
		padding: 4px 8px
		font-size: $font-size-small
		transition: background-color 250ms $strong-ease-out

.fade
	&-enter-from
	&-leave-to
		opacity: 0
		visibility: hidden

	&-leave-active
		transition: opacity 250ms $strong-ease-out, visibility 250ms

.-transitions
	transition: transform 250ms $strong-ease-out, opacity 1s

	&-group
		display: inline-flex
		margin-left: auto

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
		padding-left: 4px
		padding-right: 4px

.-bars
	display: inline-flex
	align-items: center
	margin-right: $-controls-spacing
	height: $-controls-height
	padding: ($-controls-height / 3) 0

	.-bar
		rounded-corners()
		display: inline-block
		width: 4px
		height: 20%
		margin: 0 2px
		background-color: var(--theme-highlight)
		animation-name: sound-indicator
		animation-iteration-count: infinite
		animation-timing-function: linear

		&-1
			animation-delay: 0ms
			animation-duration: 2.3s

		&-2
			animation-delay: -690ms
			animation-direction: reverse
			animation-duration: 3s

		&-3
			animation-delay: -420ms
			animation-duration: 3.4s

@keyframes sound-indicator
	0%
		height: 20%

	10%
		height: 60%

	20%
		height: 40%

	30%
		height: 80%

	40%
		height: 40%

	50%
		height: 60%

	60%
		height: 20%

	70%
		height: 80%

	80%
		height: 40%

	90%
		height: 60%

	100%
		height: 20%
</style>
