<script lang="ts">
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import { useDrawerStore } from '../../../../_common/drawer/drawer-store';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { formatNumber } from '../../../../_common/filters/number';
import { FiresideRTCUser, setDesktopAudioPlayback } from '../../../../_common/fireside/rtc/user';
import AppLoading from '../../../../_common/loading/loading.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSlider from '../../../../_common/slider/AppSlider.vue';
import AppSticker from '../../../../_common/sticker/sticker.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideDesktopAudio from '../../../components/fireside/stream/AppFiresideDesktopAudio.vue';
import AppFiresideStreamVideo from '../../../components/fireside/stream/AppFiresideStreamVideo.vue';
import AppFiresideVideoStats from '../../../components/fireside/stream/video-stats/video-stats.vue';
import AppFiresideHeader from '../AppFiresideHeader.vue';
import AppFiresideBottomBarHostAvatar from '../_bottom-bar/AppFiresideBottomBarHostAvatar.vue';

const UIHideTimeout = 2000;
const UIHideTimeoutMovement = 2000;
const UITransitionTime = 200;

@Options({
	directives: {
		AppTooltip: vAppTooltip,
	},
	components: {
		AppFiresideDesktopAudio,
		AppFiresideHeader,
		AppFiresideStreamVideo,
		AppFiresideVideoStats,
		AppLoading,
		AppSlider,
		AppSticker,
		AppFiresideBottomBarHostAvatar,
		AppUserAvatar,
	},
})
export default class AppFiresideStream extends Vue {
	@Prop({ type: Object, required: true })
	rtcUser!: FiresideRTCUser;

	@Prop({ type: Boolean })
	hasHeader!: boolean;

	@Prop({ type: Boolean })
	hasHosts!: boolean;

	c = shallowSetup(() => useFiresideController()!);

	drawerStore = shallowSetup(() => useDrawerStore());

	private isHovered = false;
	private _ignorePointerTimer?: NodeJS.Timer;

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

	hideUITimer: NodeJS.Timer | null = null;
	streakTimer: NodeJS.Timer | null = null;
	hasQueuedStreakAnimation = false;
	shouldAnimateStreak = false;

	declare $refs: {
		paused?: HTMLDivElement;
	};

	get stickerStreak() {
		return this.drawerStore.streak.value;
	}

	get streakCount() {
		return formatFuzzynumber(this.stickerStreak?.count ?? 0);
	}

	get hasVolumeControls() {
		return !!this.c.rtc.value?.shouldShowVolumeControls;
	}

	get shouldShowUI() {
		if (import.meta.env.SSR) {
			return false;
		}

		return !!(
			(this.hasVideo && this.videoPaused) ||
			this.c.isShowingOverlayPopper.value ||
			this.showMutedIndicator ||
			this.isHovered ||
			this.hideUITimer
		);
	}

	get shouldShowVideo() {
		// We can only show local videos in one place at a time. This will
		// re-grab the video feed when it gets rebuilt.
		return !(this.c.isShowingStreamSetup.value && this.c.rtc.value?.isFocusingMe);
	}

	get hasOverlayItems() {
		return this.hasVideo || this.hasVolumeControls || this.hasHeader;
	}

	get memberCount() {
		return this.c.chatUsers.value?.count ?? 1;
	}

	get videoPaused() {
		return this.c.rtc.value?.videoPaused === true;
	}

	get showMutedIndicator() {
		return this.c.rtc.value?.shouldShowMutedIndicator === true;
	}

	get hasVideo() {
		return this.rtcUser.hasVideo && this.rtcUser.isListed && !this.rtcUser.videoMuted;
	}

	get isLoadingVideo() {
		return this.hasVideo && this.c.rtc.value?.videoChannel.isConnected !== true;
	}

	// When we want to darken the whole stream overlay instead of only sections.
	get shouldDarkenAll() {
		if (!this.shouldShowUI) {
			return false;
		}

		// If we're displaying any of this large content, or we're paused,
		// darken the whole overlay instead of individual rows.
		return this.videoPaused || this.hasHeader || this.hasHosts;
	}

	get shouldPlayDesktopAudio() {
		if (!this.c.rtc.value) {
			return false;
		}

		return (
			this.hasVideo &&
			this.c.rtc.value.videoChannel.isConnected &&
			this.rtcUser.hasDesktopAudio &&
			!this.c.rtc.value.videoPaused
		);
	}

	get shouldShowVideoStats() {
		if (!this.c.rtc.value) {
			return false;
		}
		return this.c.rtc.value.shouldShowVideoStats;
	}

	onMouseOut() {
		this.scheduleUIHide(UIHideTimeout);
	}

	onMouseMove() {
		this.scheduleUIHide(UIHideTimeoutMovement);
	}

	onVideoClick(event: Event) {
		this.scheduleUIHide(UIHideTimeout);

		if (event.target === this.$refs.paused) {
			this.togglePlayback();
		}
	}

	onOverlayTap(event: Event) {
		if (this._ignorePointerTimer) {
			event.stopImmediatePropagation();
		}
	}

	togglePlayback() {
		if (this.videoPaused) {
			this.pauseVideo();
		} else {
			this.unpauseVideo();
		}
	}

	onHostOptionsShow() {
		this.c.isShowingOverlayPopper.value = true;
	}

	onHostOptionsHide() {
		this.c.isShowingOverlayPopper.value = false;
	}

	unmuteDesktopAudio() {
		setDesktopAudioPlayback(this.rtcUser, true);
	}

	private animateStickerStreak() {
		if (!this.streakCount) {
			this.clearStreakTimer();
			return;
		}

		if (this.streakTimer != null) {
			this.hasQueuedStreakAnimation = true;
			return;
		}

		this.shouldAnimateStreak = true;
		this.streakTimer = setTimeout(() => {
			this.clearStreakTimer();
			if (this.hasQueuedStreakAnimation) {
				this.hasQueuedStreakAnimation = false;
				this.animateStickerStreak();
				return;
			}

			this.shouldAnimateStreak = false;
		}, 2_000);
	}

	private clearStreakTimer() {
		if (this.streakTimer) {
			clearTimeout(this.streakTimer);
		}
		this.streakTimer = null;
	}

	private scheduleUIHide(delay: number) {
		if (!this.shouldShowUI) {
			this.startIgnoringPointer();
		}

		this.isHovered = true;
		this.clearHideUITimer();
		this.hideUITimer = setTimeout(() => {
			this.isHovered = false;
			this.clearHideUITimer();
		}, delay);
	}

	private clearHideUITimer() {
		if (!this.hideUITimer) {
			return;
		}

		clearTimeout(this.hideUITimer);
		this.hideUITimer = null;
	}

	private startIgnoringPointer() {
		this.clearPointerIgnore();
		this._ignorePointerTimer = setTimeout(() => {
			this.clearPointerIgnore();
		}, UITransitionTime);
	}

	private clearPointerIgnore() {
		if (!this._ignorePointerTimer) {
			return;
		}

		clearTimeout(this._ignorePointerTimer);
		this._ignorePointerTimer = undefined;
	}

	private pauseVideo() {
		this.c.rtc.value!.videoPaused = false;
	}

	private unpauseVideo() {
		this.c.rtc.value!.videoPaused = true;
	}

	@Watch('stickerStreak')
	onStreakCountChanged() {
		if (this.stickerStreak) {
			this.animateStickerStreak();
		}
	}
}
</script>

<template>
	<div
		class="-stream theme-dark"
		@mouseleave="onMouseOut"
		@mousemove="onMouseMove"
		@touchmove="onMouseMove"
		@click="onVideoClick"
	>
		<template v-if="hasVideo">
			<template v-if="isLoadingVideo">
				<div class="-overlay -visible-center">
					<AppLoading centered stationary no-color hide-label />
				</div>
			</template>
			<template v-else>
				<div :key="rtcUser.uid" :style="{ width: '100%', height: '100%' }">
					<AppFiresideStreamVideo
						v-if="shouldShowVideo"
						class="-video-player -click-target"
						:rtc-user="rtcUser"
					/>
					<div v-else class="-video-sidebar-notice">
						<strong>
							<AppTranslate class="text-muted">
								See video preview in sidebar
							</AppTranslate>
						</strong>
					</div>

					<AppFiresideDesktopAudio v-if="shouldPlayDesktopAudio" :rtc-user="rtcUser" />
					<AppFiresideVideoStats v-if="shouldShowVideoStats" @click.capture.stop />
				</div>
			</template>
		</template>
		<template v-else>
			<div class="-overlay -visible-center">
				<div class="-host-wrapper">
					<AppFiresideBottomBarHostAvatar class="-host" :host="rtcUser" />
				</div>
			</div>
		</template>

		<div
			v-if="hasOverlayItems || showMutedIndicator"
			class="-overlay"
			:class="{ '-darken': shouldDarkenAll }"
			@click.capture="onOverlayTap"
		>
			<template v-if="shouldShowUI">
				<template v-if="videoPaused || showMutedIndicator">
					<transition>
						<div
							ref="paused"
							class="-paused-indicator -click-target anim-fade-leave-shrink"
						>
							<AppJolticon
								class="-paused-indicator-icon"
								:icon="showMutedIndicator ? 'audio-mute' : 'play'"
							/>
						</div>
					</transition>
				</template>

				<div class="-overlay-inner">
					<div
						v-if="hasHeader"
						class="-overlay-top -control"
						:class="{ '-fade-top': !shouldDarkenAll }"
					>
						<div style="flex: auto; overflow: hidden">
							<AppFiresideHeader is-overlay />
							<div class="-overlay-members">
								<AppTranslate
									:translate-n="memberCount"
									:translate-params="{ count: formatNumber(memberCount) }"
									translate-plural="%{ count } members"
								>
									%{ count } member
								</AppTranslate>
							</div>
						</div>
					</div>

					<div class="-flex-spacer" />

					<div
						:class="{
							'-fade-bottom': !shouldDarkenAll,
						}"
					>
						<div class="-overlay-bottom -control" @click.stop>
							<div class="-video-controls">
								<div v-if="hasVideo && !hasHosts">
									<AppButton
										circle
										trans
										overlay
										:icon="videoPaused ? 'play' : 'pause'"
										@click.capture.stop="togglePlayback"
									/>
								</div>

								<div v-if="rtcUser.showDesktopAudioMuted">
									<AppButton
										v-app-tooltip="$gettext(`Ummute video`)"
										circle
										trans
										overlay
										icon="audio-mute"
										@click.capture.stop="unmuteDesktopAudio"
									/>
								</div>

								<div v-if="rtcUser.userModel" class="-user-tag">
									<AppUserAvatar
										class="-user-tag-avatar"
										:user="rtcUser.userModel"
										disable-link
									/>
									<span>@{{ rtcUser.userModel.username }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>

		<div
			v-if="stickerStreak && stickerStreak.count > 1"
			class="-combo"
			:class="{ '-fade': shouldShowUI }"
		>
			<div
				class="badge"
				:class="{
					'-hot-streak': stickerStreak.count >= 5,
					'-super-hot-streak': stickerStreak.count >= 10,
				}"
			>
				<AppTranslate v-if="Screen.isDesktop">STREAK</AppTranslate>
				x{{ streakCount }}
			</div>

			<img
				class="-combo-sticker"
				:class="{ '-keep-animating': shouldAnimateStreak }"
				draggable="false"
				onmousedown="return false"
				style="user-drag: none"
				:src="stickerStreak.sticker.img_url"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-text-shadow = 1px 1px 3px rgba($black, 0.5)
$-overlay-bg = rgba($black, 0.5)
$-base-padding = 8px
$-z-overlay = 1
$-z-control = 3
$-z-combo = 2

.jolticon
	text-shadow: $-text-shadow

.-stream
.-video-player
	&
	> .-overlay
		position: absolute
		top: 0
		right: 0
		bottom: 0
		left: 0
		color: var(--theme-fg)
		text-shadow: $-text-shadow

	> .-overlay
		z-index: $-z-overlay
		background-color: transparent
		transition: background-color 200ms $strong-ease-out

		&.-darken
			background-color: $-overlay-bg

.-video-sidebar-notice
	change-bg(bg)
	width: 100%
	height: 100%
	display: flex
	justify-content: center
	align-items: center

.-click-target
	cursor: pointer

.-overlay-inner
	height: 100%
	width: 100%
	display: flex
	flex-direction: column
	padding: $-base-padding

	> *
		z-index: $-z-control

.-visible-center
	opacity: 1 !important
	display: flex
	align-items: center
	justify-content: center

.-host-wrapper
	width: calc(min(30%, 300px))
	padding-top: @width
	position: relative

.-host
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-overlay-members
	opacity: 0.75
	font-weight: bold

.-overlay-top
	display: flex
	align-items: flex-start

.-overlay-bottom
	display: flex
	align-items: flex-end
	width: min-content

.-fade-top
.-fade-bottom
	position: relative
	margin: -($-base-padding)
	padding: $-base-padding

.-fade-top
	background: linear-gradient(to bottom, rgba($black 0.8), rgba($black 0.35) 60%, rgba($black, 0))

.-fade-bottom
	background: linear-gradient(to top, rgba($black 0.8), rgba($black 0.35) 60%, rgba($black, 0))

.-control
	user-select: none

.-flex-spacer
	margin: auto
	pointer-events: none

.-paused-indicator
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	align-items: center
	justify-content: center

	&-icon
		font-size: 60px
		pointer-events: none
		color: white

.-user-tag
	rounded-corners()
	display: inline-flex
	align-items: center
	padding: 4px 8px
	gap: 4px
	background-color: rgba($black, 0.5)
	font-weight: 700
	color: white

.-user-tag-avatar
	width: 16px
	height: @width

.-video-controls
	display: flex
	align-items: center
	flex: 1
	grid-gap: 12px

	.-volume
		display: inline-flex
		align-items: center
		flex: auto
		grid-gap: 4px

		&-slider
			max-width: 200px

.-hosts
	margin-top: 8px

.-combo
	position: absolute
	top: 16px
	right: @top
	display: inline-flex
	grid-gap: 4px
	font-weight: bold
	color: white
	align-items: center
	z-index: $-z-combo
	transition: opacity 200ms $strong-ease-out

	&.-fade
		opacity: 0.45

	&
	> *
		font-size: $font-size-base
		user-select: none
		pointer-events: none

	img
		width: 56px
		height: @width

	@media $media-mobile
		&
		> *
			font-size: $font-size-tiny

		img
			width: 24px
			height: @width

.-combo-sticker
	animation-name: new-indicator
	// Make sure this is the same, or lower, than the TS file.
	animation-duration: 1s
	animation-timing-function: $ease-in-out-back
	animation-iteration-count: 1
	animation-play-state: paused
	transform: rotate(0), scale(1)

.-keep-animating
	animation-play-state: running
	animation-iteration-count: infinite

.-hot-streak
	animation-name: hot-streak
	animation-duration: 1s
	animation-iteration-count: infinite

.-super-hot-streak
	animation-name: super-hot-streak-animation
	animation-iteration-count: infinite
	animation-duration: 4s
	animation-direction: alternate

@keyframes hot-streak
	0%
		transform: scale(1)

	50%
		transform: scale(1.1)

@keyframes new-indicator
	0%
		transform: rotate(0) scale(1)

	// Slide to the left
	30%
		transform: rotate(-25deg) scale(1.1)

	33%
		transform: rotate(-15deg) scale(1.1)

	36%
		transform: rotate(-20deg) scale(1.1)

	// Slide to the right
	63%
		transform: rotate(25deg) scale(1.1)

	66%
		transform: rotate(15deg) scale(1.1)

	69%
		transform: rotate(20deg) scale(1.1)

	// Criss cross
	100%
		transform: rotate(0deg) scale(1)

@keyframes super-hot-streak-animation
	0%
		background: orange
		color: black
		transform: scale(1)

	20%
		background: violet
		color: white
		transform: scale(1.1)

	40%
		background: blue
		color: white
		transform: scale(1)

	60%
		background: cyan
		color: black
		transform: scale(1.1)

	80%
		background: green
		color: white
		transform: scale(1)

	100%
		background: yellow
		color: black
		transform: scale(1.1)
</style>
