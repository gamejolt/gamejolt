<script lang="ts" setup>
import { computed, PropType, Ref, ref, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import {
	FiresideRTCUser,
	saveFiresideRTCUserPrefs,
	setDesktopAudioPlayback,
	setMicAudioPlayback,
	setUserDesktopAudioVolume,
	setUserMicrophoneAudioVolume,
} from '../../../../_common/fireside/rtc/user';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppPopcornKettle from '../../../../_common/popcorn/AppPopcornKettle.vue';
import { createPopcornKettleController } from '../../../../_common/popcorn/popcorn-kettle-controller';
import AppSlider, { ScrubberCallback } from '../../../../_common/slider/AppSlider.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { StickerPlacement } from '../../../../_common/sticker/placement/placement.model';
import { onFiresideStickerPlaced } from '../../../../_common/sticker/sticker-store';
import { useEventSubscription } from '../../../../_common/system/event/event-topic';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideStreamVideoPortal from '../../../components/fireside/stream/AppFiresideStreamVideoPortal.vue';
import AppFiresideBottomBarHostAvatar from './AppFiresideBottomBarHostAvatar.vue';

const props = defineProps({
	host: {
		type: Object as PropType<FiresideRTCUser>,
		required: true,
	},
});

useEventSubscription(onFiresideStickerPlaced, onStickerPlaced);

const { host } = toRefs(props);

const {
	isFullscreen,
	popperTeleportId,
	rtc,
	fetchedHostUserData,
	shownUserCardHover,
	isShowingStreamSetup,
} = useFiresideController()!;
const kettleController = createPopcornKettleController();

const isScrubbingMic = ref(false);
const isScrubbingDesktop = ref(false);

const micVolumeBeforeScrub = ref<number>();
const desktopVolumeBeforeScrub = ref<number>();

const isLoadingFollowState = ref(false);

const isFocused = computed(() => rtc.value?.focusedUser?.userId === host.value.userId);
const isMe = computed(() => rtc.value?.localUser?.userId === host.value.userId);
const showingVideoThumb = computed(() => {
	if (isMe.value && rtc.value?.producer?.videoMuted.value) {
		return false;
	}
	return !isFocused.value && host.value.hasVideo;
});

const canShowThumbStream = computed(() => {
	if (!rtc.value || rtc.value.videoPaused) {
		return false;
	}

	// We need to hide the video preview if we have the stream setup open,
	// otherwise it'll end up clearing the preview in the setup form when this
	// thumb stream shows.
	if (host.value.isLocal) {
		return !isShowingStreamSetup.value;
	}

	return true;
});

function onClick() {
	if (isFocused.value || !rtc.value) {
		return;
	}

	rtc.value.focusedUser = host.value;
}

function muteMic() {
	setMicAudioPlayback(host.value, false);
}

function unmuteMic() {
	setMicAudioPlayback(host.value, true);
}

function muteDesktop() {
	setDesktopAudioPlayback(host.value, false);
}

function unmuteDesktop() {
	setDesktopAudioPlayback(host.value, true);
}

function _handleScrub(
	scrubData: ScrubberCallback,
	data: {
		isScrubbing: Ref<boolean>;
		volumeBeforeScrub: Ref<number | undefined>;
		mute: () => void;
		unmute: () => void;
		currentPlaybackVolume: number;
		setVolume: (user: FiresideRTCUser, volume: number) => void;
	}
) {
	const { percent, stage } = scrubData;
	const { isScrubbing, volumeBeforeScrub, mute, unmute, currentPlaybackVolume, setVolume } = data;

	if (stage === 'start') {
		isScrubbing.value = true;
	}

	if (volumeBeforeScrub.value === undefined) {
		volumeBeforeScrub.value = currentPlaybackVolume;
	}

	if (stage === 'start' || stage === 'scrub') {
		setVolume(host.value, percent);
		unmute();
		return;
	}

	if (stage === 'end') {
		let volume = isScrubbing.value ? percent : currentPlaybackVolume;
		if (percent === 0) {
			mute();
			volume = volumeBeforeScrub.value ?? 1;
		}
		setVolume(host.value, volume);
		volumeBeforeScrub.value = undefined;

		isScrubbing.value = false;
		saveFiresideRTCUserPrefs(host.value);
	}
}

function onMicAudioScrub(data: ScrubberCallback) {
	_handleScrub(data, {
		currentPlaybackVolume: host.value.micPlaybackVolumeLevel,
		isScrubbing: isScrubbingMic,
		mute: muteMic,
		unmute: unmuteMic,
		setVolume: setUserMicrophoneAudioVolume,
		volumeBeforeScrub: micVolumeBeforeScrub,
	});
}

function onDesktopAudioScrub(data: ScrubberCallback) {
	_handleScrub(data, {
		currentPlaybackVolume: host.value.desktopPlaybackVolumeLevel,
		isScrubbing: isScrubbingDesktop,
		mute: muteDesktop,
		unmute: unmuteDesktop,
		setVolume: setUserDesktopAudioVolume,
		volumeBeforeScrub: desktopVolumeBeforeScrub,
	});
}

async function onStickerPlaced(placement: StickerPlacement) {
	const myId = host.value.userModel?.id;
	const {
		target_data: { host_user_id },
		sticker: { img_url },
	} = placement;

	// Don't animate stickers if we weren't the target.
	if (!host_user_id || myId !== host_user_id) {
		return;
	}

	// We display stickers on the stream for focused users. Don't animate if
	// we're focused.
	if (isFocused.value) {
		return;
	}

	kettleController.addKernel({
		kernelImage: img_url,
		duration: 2_500,
		baseSize: 48,
		velocity: 22.5,
		downwardGravityStrength: 2,
		popAngleVariance: 20,
		useClassFadeIn: true,
		fadeInStop: 0,
		fadeOutStart: 0.8,
		fadeOut: true,
	});
}

async function onUserCardShow() {
	const user = host.value.userModel;
	if (!user) {
		return;
	}

	// Don't fetch for self or if we already have cached following state.
	if (host.value.isLocal || fetchedHostUserData.get(user.id) !== undefined) {
		return;
	}

	isLoadingFollowState.value = true;
	try {
		const response = await Api.sendFieldsRequest(`/mobile/user/${user.id}`, {
			isFollowing: true,
			dogtags: true,
		});

		const is_following = response.isFollowing === true;
		const dogtags = response.dogtags;

		fetchedHostUserData.set(user.id, { is_following, dogtags });
		user.is_following = is_following;
		user.dogtags = dogtags;
	} catch (e) {
		console.error('Error fetching following state for user', e);
	} finally {
		isLoadingFollowState.value = false;
	}
}

function onUserCardHovered() {
	if (!isFullscreen.value || !host.value.userModel) {
		return;
	}
	shownUserCardHover.value = host.value.userModel.id;
}

function onUserCardUnhovered() {
	const { id } = host.value.userModel || {};
	if (!isFullscreen.value || (id !== undefined && shownUserCardHover.value === id)) {
		shownUserCardHover.value = undefined;
	}
}
</script>

<template>
	<div class="-thumb">
		<AppUserCardHover
			:user="host.userModel || undefined"
			:hover-delay="0"
			no-stats
			:disable-follow-widget="isLoadingFollowState"
			:to="isFullscreen ? `#${popperTeleportId}` : undefined"
			@show="onUserCardShow"
			@hovered="onUserCardHovered"
			@unhovered="onUserCardUnhovered"
		>
			<template #default>
				<div class="-click-capture" @click="onClick">
					<div class="-video-thumb" :class="{ '-hidden': !showingVideoThumb }">
						<template v-if="showingVideoThumb">
							<AppFiresideStreamVideoPortal
								v-if="canShowThumbStream"
								:rtc-user="host"
								video-fit="cover"
								low-bitrate
							/>
							<AppJolticon v-else icon="camera" />
						</template>
					</div>

					<div class="-avatar-wrap" :class="{ '-small': showingVideoThumb }">
						<AppFiresideBottomBarHostAvatar
							class="-avatar-item"
							:host="host"
							:fill-parent="!showingVideoThumb"
							fill-radius="lg"
						/>

						<AppPopcornKettle :controller="kettleController" />
					</div>

					<div class="-active-indicator" :class="{ '-active': isFocused }" />
				</div>

				<div class="-flags">
					<transition>
						<span
							v-if="host.showMicMuted"
							class="-flag anim-fade-enter-enlarge anim-fade-leave-shrink"
							:class="{
								'-flag-notice': host.showMicMuted,
							}"
						>
							<AppJolticon
								v-if="host.showMicMuted"
								v-app-tooltip="$gettext(`Muted`)"
								icon="audio-mute"
							/>
						</span>
					</transition>
				</div>
			</template>

			<template v-if="!isMe" #trailing>
				<div class="-host-controls">
					<hr />

					<div class="-host-audio">
						<div class="-host-audio-col">
							<AppTranslate> Microphone </AppTranslate>
							<AppSlider
								:percent="
									host.remoteMicAudioMuted ? 0 : host.micPlaybackVolumeLevel
								"
								@scrub="onMicAudioScrub"
							/>
						</div>

						<AppButton
							class="-host-audio-button"
							sparse
							trans
							:icon="host.showMicMuted ? 'microphone-off' : 'microphone'"
							@click="host.showMicMuted ? unmuteMic() : muteMic()"
						/>
					</div>

					<template v-if="host.hasDesktopAudio">
						<AppSpacer vertical :scale="2" />

						<div class="-host-audio">
							<div class="-host-audio-col">
								<AppTranslate> Desktop/Game </AppTranslate>
								<AppSlider
									:percent="
										host.remoteDesktopAudioMuted
											? 0
											: host.desktopPlaybackVolumeLevel
									"
									@scrub="onDesktopAudioScrub"
								/>
							</div>

							<AppButton
								class="-host-audio-button"
								sparse
								trans
								:icon="host.showDesktopAudioMuted ? 'audio-mute' : 'audio'"
								@click="
									host.showDesktopAudioMuted ? unmuteDesktop() : muteDesktop()
								"
							/>
						</div>
					</template>
				</div>
			</template>
		</AppUserCardHover>
	</div>
</template>

<style lang="stylus" scoped>
.-thumb
.-click-capture
	position: relative
	width: calc(var(--fireside-host-size) * (16 / 9))
	height: var(--fireside-host-size)

.-click-capture
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	cursor: pointer
	user-select: none

.-video-thumb
.-avatar-wrap
	rounded-corners-lg()

.-video-thumb
	position: absolute
	top: 0
	display: flex
	align-items: center
	justify-content: center
	width: calc(var(--fireside-host-size) * (16 / 9))
	height: var(--fireside-host-size)
	background-color: var(--theme-bg-subtle)
	overflow: hidden

	&.-hidden
		visibility: hidden

.-avatar-wrap
	position: absolute
	left: 0
	top: @left
	width: 100%
	height: @width
	z-index: 1
	transition: all 400ms

	&.-small
		left: -2px
		top: @left
		width: 32px
		height: @width

.-avatar-item
	position: absolute
	z-index: 1

.-avatar-stickers
	position: absolute
	left: 0
	top: 0
	width: calc(max(33%, 24px))
	height: @width
	display: flex
	align-items: center
	justify-content: center
	z-index: 1

.-avatar-sticker-item
	position: absolute
	width: 100%
	height: 100%
	animation-name: anim-sticker
	animation-duration: 2s
	animation-timing-function: $ease-in-out-back
	animation-iteration-count: 1
	transform: rotate(0) scale(1)
	opacity: 0

.-active-indicator
	position: absolute
	flex: none
	border-radius: 40%
	height: 16px
	width: 0
	bottom: -24px
	opacity: 0
	background-color: var(--theme-primary)
	transition: width 400ms $ease-out-back, opacity 250ms

	&.-active
		width: 48px
		opacity: 1

.-host-controls
	margin-top: -10px
	padding: 10px

	hr
		margin-left: -10px
		margin-right: -10px

.-host-audio
	display: flex
	gap: 8px

.-host-audio-col
	flex: auto
	display: flex
	flex-direction: column
	font-size: $font-size-small

.-host-audio-button
	flex: none
	align-self: end

.-flags
	position: absolute
	display: flex
	flex-direction: row
	justify-content: flex-end
	bottom: -2px
	left: -2px
	right: -2px
	grid-gap: 4px
	z-index: 2

.-flag
	flex: 1
	elevate-1()
	flex: none
	display: flex
	align-items: center
	justify-content: center
	width: 24px
	height: 24px
	border-radius: 100%
	background-color: var(--theme-bg)
	color: var(--theme-fg)
	cursor: default

.-flag-notice
	color: var(--theme-notice)

// Copied from AppStickerReactionsItem
@keyframes anim-sticker
	0%
		transform: rotate(0) scale(1)
		opacity: 0

	25%
		opacity: 1

	// Slide to the left
	30%
		transform: rotate(-30deg) scale(1.2)

	33%
		transform: rotate(-20deg) scale(1.2)

	36%
		transform: rotate(-25deg) scale(1.2)

	// Slide to the right
	63%
		transform: rotate(30deg) scale(1.2)

	66%
		transform: rotate(20deg) scale(1.2)

	69%
		transform: rotate(25deg) scale(1.2)

	75%
		opacity: 1

	// Criss cross
	100%
		transform: rotate(0deg) scale(1)
		opacity: 0
</style>
