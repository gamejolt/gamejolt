<script lang="ts">
import { computed, PropType, shallowReactive, toRefs } from 'vue';
import { configFiresideMicVolume } from '../../../../_common/config/config.service';
import {
	FiresideRTCUser,
	setAudioPlayback,
	setUserMicrophoneAudioVolume,
} from '../../../../_common/fireside/rtc/user';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppPopper from '../../../../_common/popper/popper.vue';
import AppSlider, { ScrubberCallback } from '../../../../_common/slider/AppSlider.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideStreamVideo from '../../../components/fireside/stream/AppFiresideStreamVideo.vue';
import AppFiresideHostThumbIndicator from './host-thumb-indicator.vue';
</script>

<script lang="ts" setup>
const props = defineProps({
	host: {
		type: Object as PropType<FiresideRTCUser>,
		required: true,
	},
	hideOptions: {
		type: Boolean,
	},
});

const emit = defineEmits({
	showPopper: () => true,
	hidePopper: () => true,
});

const { host, hideOptions } = toRefs(props);

const c = shallowReactive(useFiresideController()!);

const isFocused = computed(() => c.rtc.value?.focusedUser?.uid === host.value.uid);

const isMe = computed(() => c.rtc.value?.localUser?.uid === host.value.uid);

const showingVideoThumb = computed(() => !isFocused.value && host.value.hasVideo);

function onClick() {
	if (isFocused.value || !c.rtc.value) {
		return;
	}

	c.rtc.value.focusedUser = host.value;
}

function mute() {
	setAudioPlayback(host.value, false);
}

function unmute() {
	setAudioPlayback(host.value, true);
}

function onMicAudioScrub({ percent }: ScrubberCallback) {
	setUserMicrophoneAudioVolume(host.value, percent);
}
</script>

<template>
	<div class="-thumb">
		<AppUserCardHover :user="host.userModel" :hover-delay="0" no-stats>
			<div class="-click-capture" @click="onClick">
				<div class="-display-thumb" :class="{ '-hidden': !showingVideoThumb }">
					<template v-if="showingVideoThumb">
						<AppFiresideStreamVideo
							v-if="c.rtc.value && !c.rtc.value.videoPaused"
							:rtc-user="host"
							low-bitrate
						/>
						<AppJolticon v-else icon="camera" class="-display-thumb-icon" />
					</template>
				</div>

				<div class="-avatar-wrap" :class="{ '-full': !showingVideoThumb }">
					<AppFiresideHostThumbIndicator :host="host" />
				</div>

				<div class="-spacer" />
				<div class="-active-indicator" :class="{ '-active': isFocused }" />
			</div>

			<div v-if="!isMe" class="-options">
				<transition>
					<span
						v-if="host.micAudioMuted || host.playbackVolumeLevel < 1"
						class="-option anim-fade-enter-enlarge anim-fade-leave-shrink"
						:class="{
							'-option-warn': host.micAudioMuted || host.playbackVolumeLevel <= 0,
						}"
						:style="{
							flex: host.micAudioMuted ? 'none' : 'auto',
						}"
					>
						<AppJolticon
							v-if="host.micAudioMuted"
							v-app-tooltip="$gettext(`Muted`)"
							icon="audio-mute"
						/>
						<template v-else-if="host.playbackVolumeLevel < 1">
							<AppJolticon
								:icon="host.playbackVolumeLevel <= 0 ? 'audio-mute' : 'audio'"
							/>
							<strong class="tiny">
								{{
									' ' +
									Math.min(
										100,
										Math.max(0, Math.round(host.playbackVolumeLevel * 100))
									)
								}}
							</strong>
						</template>
					</span>
				</transition>

				<div class="-options-spacer" />

				<AppPopper
					v-if="!hideOptions"
					placement="top"
					@show="() => emit('showPopper')"
					@hide="() => emit('hidePopper')"
				>
					<a v-app-tooltip="$gettext('Options')" class="-option -option-show-hover">
						<AppJolticon icon="cog" />
					</a>

					<template #popover>
						<div class="list-group">
							<div v-if="configFiresideMicVolume.value" class="list-group-item">
								<div class="list-group-item-heading">
									<AppTranslate> Microphone Volume </AppTranslate>
								</div>
								<AppSlider
									:percent="host.playbackVolumeLevel"
									@scrub="onMicAudioScrub"
								/>
							</div>

							<a v-if="!host.micAudioMuted" class="list-group-item" @click="mute">
								<AppTranslate>Mute</AppTranslate>
							</a>
							<a v-else class="list-group-item" @click="unmute">
								<AppTranslate>Unmute</AppTranslate>
							</a>
						</div>
					</template>
				</AppPopper>
			</div>
		</AppUserCardHover>
	</div>
</template>

<style lang="stylus" scoped>
.-thumb
.-click-capture
	position: relative
	width: var(--fireside-host-size)
	height: var(--fireside-host-size)

.-click-capture
	display: flex
	flex-direction: column
	align-items: center
	cursor: pointer
	user-select: none

.-display-thumb
	rounded-corners()
	flex: auto
	display: flex
	align-items: center
	justify-content: center
	width: 100%
	background-color: var(--theme-bg-subtle)
	overflow: hidden

	&.-hidden
		visibility: hidden

.-stream-player
	width: 100%
	height: 100%

.-avatar-wrap
	position: absolute
	width: calc(var(--fireside-host-size) * 0.5)
	height: calc(var(--fireside-host-size) * 0.5)
	bottom: 0
	transition: all 250ms $strong-ease-out

	&.-full
		width: calc(var(--fireside-host-size) - 12px)
		height: calc(var(--fireside-host-size) - 12px)
		bottom: 12px

.-spacer
	flex: none
	height: calc(var(--fireside-host-size) * 0.3)

.-active-indicator
	flex: none
	border-radius: 40%
	height: 4px
	width: 0
	opacity: 0
	background-color: var(--theme-link)
	transition: width 400ms $ease-out-back, opacity 250ms

	&.-active
		width: 30px
		opacity: 1

.-options
	position: absolute
	display: flex
	flex-direction: row
	justify-content: flex-end
	bottom: 8px
	left: 8px
	right: 8px
	grid-gap: 4px
	z-index: 2

	&-spacer
		flex: auto

.-option
	flex: 1
	elevate-1()
	display: flex
	width: 24px
	height: 24px
	border-radius: (@height / 2)
	background-color: var(--theme-bg)
	align-items: center
	justify-content: center
	color: var(--theme-fg)
	cursor: default

	a&
		cursor: pointer

		&:hover
			color: var(--theme-bi-fg)
			background-color: var(--theme-bi-bg)

	&-warn
		color: var(--theme-notice)

.-option-show-hover
	visibility: hidden

.-thumb:hover
	.-option-show-hover
		visibility: visible
		display: flex
</style>
