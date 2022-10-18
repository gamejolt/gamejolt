<script lang="ts">
const UIHideTimeout = 2000;
const UIHideTimeoutMovement = 2000;
const UITransitionTime = 200;
</script>

<script lang="ts" setup>
import { computed, onUnmounted, PropType, ref, toRefs, watch } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { FiresideRTCUser, setDesktopAudioPlayback } from '../../../../_common/fireside/rtc/user';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { useStickerStore } from '../../../../_common/sticker/sticker-store';
import { useCommonStore } from '../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideDesktopAudio from '../../../components/fireside/stream/AppFiresideDesktopAudio.vue';
import AppFiresideStreamVideo from '../../../components/fireside/stream/AppFiresideStreamVideo.vue';
import AppFiresideStreamStats from '../../../components/fireside/stream/stream-stats/AppFiresideStreamStats.vue';
import AppFiresideHeader from '../AppFiresideHeader.vue';
import AppFiresideBottomBar from '../_bottom-bar/AppFiresideBottomBar.vue';
import AppFiresideBottomBarHostAvatar from '../_bottom-bar/AppFiresideBottomBarHostAvatar.vue';

const props = defineProps({
	rtcUser: {
		type: Object as PropType<FiresideRTCUser>,
		required: true,
	},
	hasHeader: {
		type: Boolean,
	},
	hasHosts: {
		type: Boolean,
	},
	sidebarCollapsed: {
		type: Boolean,
		required: true,
	},
	noStats: {
		type: Boolean,
	},
});

const { rtcUser, hasHeader, hasHosts, sidebarCollapsed } = toRefs(props);

const c = useFiresideController()!;
const {
	rtc,
	shownUserCardHover,
	shouldHideStreamVideo,
	isHoveringOverlayControl,
	isShowingStreamSetup,
	isShowingStreamOverlay,
	isFullscreen,
	canFullscreen,
	toggleFullscreen,
} = c;

const { streak: stickerStreak } = useStickerStore();
const { user } = useCommonStore();

const _ignorePointerTimer = ref<NodeJS.Timer | null>();
const hideUITimer = ref<NodeJS.Timer | null>(null);
const streakTimer = ref<NodeJS.Timer | null>(null);

const pausedElement = ref<HTMLDivElement>();

const isHovered = ref(false);
const hasQueuedStreakAnimation = ref(false);
const shouldAnimateStreak = ref(false);

const streakCount = computed(() => formatFuzzynumber(stickerStreak.value?.count ?? 0));

const showVideoStatTabs = computed(() => user.value?.isMod === true);

const chatWidth = computed(() => {
	if (isFullscreen.value && sidebarCollapsed.value) {
		return 200;
	}
	return 350;
});

const shouldShowUI = computed(() => {
	if (import.meta.env.SSR) {
		return false;
	}

	return !!(
		videoPaused.value ||
		shownUserCardHover.value ||
		isHoveringOverlayControl.value ||
		showMutedIndicator.value ||
		isHovered.value ||
		hideUITimer.value
	);
});

const overlayPaddingRight = computed(() => {
	if (!isFullscreen.value || sidebarCollapsed.value) {
		return undefined;
	}

	return chatWidth.value + 'px';
});

const producer = computed(() => rtc.value?.producer);

/**
 * We can only show local videos in one place at a time. This will re-grab the
 * video feed when it gets rebuilt.
 */
const shouldShowVideo = computed(() => !(isShowingStreamSetup.value && rtc.value?.isFocusingMe));

/**
 * When the stream setup menu is showing its own stream, display a message
 * letting them know they can see their stream in the setup menu instead of
 * here.
 */
const showVideoPreviewMessage = computed(
	() => !!rtc.value && rtc.value.isFocusingMe && isShowingStreamSetup.value
);

const videoPaused = computed(() => rtc.value?.videoPaused === true);

const showMutedIndicator = computed(() => rtc.value?.shouldShowMutedIndicator === true);

const hasVideo = computed(() => {
	if (!rtcUser.value.hasVideo || !rtcUser.value.isListed) {
		return false;
	}
	if (rtcUser.value.isLocal && producer.value) {
		return !producer.value.videoMuted.value;
	}
	return true;
});

const isLoadingVideo = computed(
	() => hasVideo.value && rtc.value?.videoChannel.isConnected !== true
);

// When we want to darken the whole stream overlay instead of only sections.
const shouldDarkenAll = computed(() => {
	if (!shouldShowUI.value) {
		return false;
	}

	return videoPaused.value;
});

const shouldPlayDesktopAudio = computed(() => {
	if (!rtc.value) {
		return false;
	}

	return (
		hasVideo.value &&
		rtc.value.videoChannel.isConnected &&
		rtcUser.value.hasDesktopAudio &&
		!rtc.value.videoPaused
	);
});

const shouldShowVideoStats = computed(() => {
	if (!rtc.value) {
		return false;
	}
	return rtc.value.shouldShowVideoStats;
});

watch(stickerStreak, onStreakCountChanged);

watch(
	shouldShowUI,
	shouldShow => {
		isShowingStreamOverlay.value = shouldShow;
	},
	{
		immediate: true,
	}
);

onUnmounted(() => {
	isShowingStreamOverlay.value = false;
	isHoveringOverlayControl.value = false;
});

function onMouseOut() {
	scheduleUIHide(UIHideTimeout);
}

function onMouseMove() {
	scheduleUIHide(UIHideTimeoutMovement);
}

function onVideoClick(event: Event) {
	scheduleUIHide(UIHideTimeout);

	if (event.target === pausedElement.value) {
		togglePlayback();
	}
}

function onOverlayTap(event: Event) {
	if (_ignorePointerTimer.value) {
		event.stopImmediatePropagation();
	}
}

function togglePlayback() {
	if (videoPaused.value) {
		pauseVideo();
	} else {
		unpauseVideo();
	}
}

function unmuteDesktopAudio() {
	setDesktopAudioPlayback(rtcUser.value, true);
}

function animateStickerStreak() {
	if (!streakCount.value) {
		clearStreakTimer();
		return;
	}

	if (streakTimer.value != null) {
		hasQueuedStreakAnimation.value = true;
		return;
	}

	shouldAnimateStreak.value = true;
	streakTimer.value = setTimeout(() => {
		clearStreakTimer();
		if (hasQueuedStreakAnimation.value) {
			hasQueuedStreakAnimation.value = false;
			animateStickerStreak();
			return;
		}

		shouldAnimateStreak.value = false;
	}, 2_000);
}

function clearStreakTimer() {
	if (streakTimer.value) {
		clearTimeout(streakTimer.value);
	}
	streakTimer.value = null;
}

function scheduleUIHide(delay: number) {
	if (!shouldShowUI.value) {
		startIgnoringPointer();
	}

	isHovered.value = true;
	clearHideUITimer();
	hideUITimer.value = setTimeout(() => {
		isHovered.value = false;
		clearHideUITimer();
	}, delay);
}

function clearHideUITimer() {
	if (!hideUITimer.value) {
		return;
	}

	clearTimeout(hideUITimer.value);
	hideUITimer.value = null;
}

function startIgnoringPointer() {
	clearPointerIgnore();
	_ignorePointerTimer.value = setTimeout(() => {
		clearPointerIgnore();
	}, UITransitionTime);
}

function clearPointerIgnore() {
	if (!_ignorePointerTimer.value) {
		return;
	}

	clearTimeout(_ignorePointerTimer.value);
	_ignorePointerTimer.value = null;
}

function pauseVideo() {
	rtc.value!.videoPaused = false;
}

function unpauseVideo() {
	rtc.value!.videoPaused = true;
}

function onStreakCountChanged() {
	if (stickerStreak.value) {
		animateStickerStreak();
	}
}

function onMouseEnterControls() {
	isHoveringOverlayControl.value = true;
}

function onMouseLeaveControls() {
	isHoveringOverlayControl.value = false;
}
</script>

<template>
	<div
		class="-stream theme-dark"
		:class="{
			'-fullscreen': isFullscreen,
		}"
		:style="`--overlay-right: ${overlayPaddingRight || 0}; --chat-width: ${chatWidth}px`"
		@mouseleave="onMouseOut"
		@mousemove="onMouseMove"
		@touchmove="onMouseMove"
		@click="onVideoClick"
	>
		<template v-if="showVideoPreviewMessage">
			<div class="-video-hidden-notice">
				<strong>
					<AppTranslate class="text-muted"> See video preview in sidebar </AppTranslate>
				</strong>
			</div>
		</template>
		<template v-else-if="hasVideo">
			<template v-if="isLoadingVideo">
				<div class="-overlay -visible-center">
					<AppLoading centered stationary no-color hide-label />
				</div>
			</template>
			<template v-else>
				<div :key="rtcUser.uid" :style="{ width: '100%', height: '100%' }">
					<template v-if="shouldShowVideo">
						<div v-if="shouldHideStreamVideo" class="-video-hidden-notice">
							<strong>
								<AppTranslate class="text-muted">
									We're hiding this video to conserve your system resources
								</AppTranslate>
							</strong>
						</div>
						<template v-else>
							<AppFiresideStreamVideo
								class="-video-player -click-target"
								:rtc-user="rtcUser"
							/>
						</template>
					</template>

					<AppFiresideDesktopAudio v-if="shouldPlayDesktopAudio" :rtc-user="rtcUser" />
					<AppFiresideStreamStats
						v-if="!noStats && shouldShowVideoStats"
						class="-stream-stats"
						:has-tab-switcher="showVideoStatTabs"
					/>
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

		<div class="-overlay" :class="{ '-darken': shouldDarkenAll }" @click.capture="onOverlayTap">
			<template v-if="shouldShowUI">
				<template v-if="videoPaused || showMutedIndicator">
					<transition>
						<div
							ref="pausedElement"
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
						v-if="hasHeader || canFullscreen"
						class="-overlay-top -control"
						:class="{ '-fade-top': !shouldDarkenAll }"
						@mouseenter="onMouseEnterControls"
						@mouseleave="onMouseLeaveControls"
					>
						<div
							class="-row"
							:style="{
								paddingRight: overlayPaddingRight,
							}"
						>
							<AppFiresideHeader
								v-if="hasHeader"
								class="-header"
								:fireside="c.fireside"
								:sticker-target-controller="c.stickerTargetController"
								overlay
							/>
							<AppSpacer v-if="hasHeader && canFullscreen" horizontal :scale="2" />
							<AppButton
								v-if="canFullscreen"
								class="-button-lg"
								sparse
								circle
								overlay
								trans
								style="margin-left: auto"
								:icon="isFullscreen ? 'unfullscreen' : 'fullscreen'"
								@click="toggleFullscreen()"
							/>
						</div>
					</div>

					<div class="-flex-spacer" />

					<div
						:class="{
							'-fade-bottom': !shouldDarkenAll,
						}"
					>
						<div
							class="-overlay-bottom -control"
							style="width: 100%"
							@click.stop
							@mouseenter="onMouseEnterControls"
							@mouseleave="onMouseLeaveControls"
						>
							<div class="-video-controls">
								<div
									class="-video-controls-left"
									:class="{
										'-fullscreen': isFullscreen,
									}"
								>
									<AppButton
										v-if="hasVideo || isFullscreen"
										class="-button-lg"
										sparse
										circle
										trans
										overlay
										:icon="videoPaused ? 'play' : 'pause'"
										:style="{
											visibility: hasVideo ? 'visible' : 'hidden',
										}"
										@click.capture.stop="togglePlayback"
									/>

									<AppButton
										v-if="rtcUser.showDesktopAudioMuted"
										v-app-tooltip="$gettext(`Ummute video`)"
										class="-button-lg"
										circle
										sparse
										trans
										overlay
										icon="audio-mute"
										@click.capture.stop="unmuteDesktopAudio"
									/>

									<div v-if="rtcUser.userModel" class="-user-tag">
										<AppUserAvatar
											class="-user-tag-avatar"
											:user="rtcUser.userModel"
											disable-link
										/>
										<span class="-user-tag-username">
											@{{ rtcUser.userModel.username }}
										</span>
									</div>
								</div>

								<template v-if="hasHosts">
									<AppFiresideBottomBar class="-hosts" overlay />
									<div
										class="-chat-spacer"
										:class="{ '-chat-spacer-shrink': sidebarCollapsed }"
									/>
								</template>
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

.-stream
	--overlay-right: 0
	--overlay-position: absolute
	--chat-width: 350px
	right: 0 !important

	&.-fullscreen
		--overlay-position: fixed
		background-color: black

.jolticon
	text-shadow: $-text-shadow

.-button-lg
	padding: 12px !important
	line-height: 24px !important

	::v-deep(.jolticon)
		font-size: $font-size-large
		width: 24px

.-row
	display: flex
	flex-direction: row
	width: 100%
	align-items: center

.-stream
.-video-player
	&
	> .-overlay
		position: var(--overlay-position)
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

.-video-hidden-notice
	change-bg(bg)
	width: 100%
	height: 100%
	display: flex
	justify-content: center
	align-items: center
	text-align: center
	padding: 16px

.-stream-stats
	z-index: $-z-control - 1

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

.-header
	flex: auto

.-overlay-members
	opacity: 0.75
	font-weight: bold

.-overlay-top
	display: flex
	align-items: flex-start
	min-width: 0

.-overlay-bottom
	display: flex
	align-items: flex-end
	width: min-content
	min-width: 0

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

.-paused-indicator-icon
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
	flex: none

.-user-tag-username
	text-overflow()
	width: 100%

.-video-controls
	display: flex
	align-items: flex-end
	flex: 1
	grid-gap: 8px
	max-width: 100%

.-video-controls-left
	position: relative
	display: inline-flex
	grid-gap: 8px
	align-items: flex-end
	flex-grow: 0
	flex-shrink: 100
	flex-basis: var(--chat-width)
	flex-direction: row

	&.-fullscreen
		flex-direction: column-reverse
		align-items: flex-start

		.-user-tag
			position: absolute
			max-width: calc(min(33vw, 300px))
			left: 0
			bottom: calc(100% + 16px)

.-hosts
	margin-left: 0
	margin-right: 0
	margin-bottom: -($-base-padding)
	flex: auto
	width: auto

.-chat-spacer
	flex-grow: 0
	flex-shrink: 0
	flex-basis: var(--chat-width)

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
