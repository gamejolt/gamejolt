<script lang="ts" setup>
import { SettingVideoPlayerMuted } from '../../settings/settings.service';
import AppSlider, { ScrubberCallback } from '../../slider/AppSlider.vue';
import {
	VideoPlayerController,
	scrubVideoVolume,
	setVideoMuted,
	trackVideoPlayerEvent,
} from './controller';

import { PropType, computed, toRefs } from 'vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';

const props = defineProps({
	player: {
		type: Object as PropType<VideoPlayerController>,
		required: true,
	},
	hasSlider: {
		type: Boolean,
	},
	transitionSlider: {
		type: Boolean,
	},
});

const { player, hasSlider, transitionSlider } = toRefs(props);

const isMuted = computed(() => {
	if (player.value.altControlsBehavior) {
		return player.value.muted;
	} else {
		return player.value.volume === 0;
	}
});

function onClickMute() {
	let currentState = true;
	if (player.value.context === 'feed' || player.value.context == 'page') {
		currentState = SettingVideoPlayerMuted.get();
	}

	setVideoMuted(player.value, !currentState);
	trackVideoPlayerEvent(
		player.value,
		!player.value.volume || player.value.muted ? 'mute' : 'unmute',
		'click-control'
	);
}

function onVolumeScrub({ percent, stage }: ScrubberCallback) {
	scrubVideoVolume(player.value, percent, stage);
}
</script>

<template>
	<div
		:style="{
			display: `inline-flex`,
			alignItems: `center`,
		}"
	>
		<div class="player-control-button" @click="onClickMute">
			<AppJolticon :icon="isMuted ? 'audio-mute' : 'audio'" />
		</div>

		<Transition name="fade" :duration="transitionSlider ? undefined : 0">
			<AppSlider
				v-if="hasSlider"
				:style="{
					maxWidth: `128px`,
				}"
				:percent="player.volume"
				overlay
				@scrub="onVolumeScrub"
			/>
		</Transition>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

.fade-enter-from
.fade-leave-to
	opacity: 0
	visibility: hidden

.fade-leave-active
	transition: opacity 250ms $strong-ease-out, visibility 250ms
</style>
