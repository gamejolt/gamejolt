<script lang="ts" setup>
import { computed } from 'vue';

import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { SettingVideoPlayerMuted } from '~common/settings/settings.service';
import AppSlider, { ScrubberCallback } from '~common/slider/AppSlider.vue';
import {
	scrubVideoVolume,
	setVideoMuted,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '~common/video/player/controller';

type Props = {
	player: VideoPlayerController;
	hasSlider?: boolean;
	transitionSlider?: boolean;
};
const { player, hasSlider = false, transitionSlider = false } = defineProps<Props>();

const isMuted = computed(() => {
	if (player.altControlsBehavior) {
		return player.muted;
	} else {
		return player.volume === 0;
	}
});

function onClickMute() {
	let currentState = true;
	if (player.context === 'feed' || player.context == 'page') {
		currentState = SettingVideoPlayerMuted.get();
	}

	setVideoMuted(player, !currentState);
	trackVideoPlayerEvent(
		player,
		!player.volume || player.muted ? 'mute' : 'unmute',
		'click-control'
	);
}

function onVolumeScrub({ percent, stage }: ScrubberCallback) {
	scrubVideoVolume(player, percent, stage);
}
</script>

<template>
	<div class="inline-flex items-center">
		<div class="player-control-button" @click="onClickMute">
			<AppJolticon :icon="isMuted ? 'audio-mute' : 'audio'" />
		</div>

		<Transition name="fade" :duration="transitionSlider ? undefined : 0">
			<AppSlider
				v-if="hasSlider"
				class="max-w-[128px]"
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
