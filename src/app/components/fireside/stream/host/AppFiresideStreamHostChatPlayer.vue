<script lang="ts" setup>
import { PropType, watchEffect } from 'vue';
import { FiresideRTCUser } from '../../../../../_common/fireside/rtc/user';
import { createFiresideStreamHostPlayer } from './player-controller';

const props = defineProps({
	rtcUser: {
		type: Object as PropType<FiresideRTCUser>,
		required: true,
	},
});

// We want to freeze these. If it changed out from under us ever, it would break
// everything.
//
// eslint-disable-next-line vue/no-setup-props-destructure
const { rtcUser } = props;

const { player, playerElem } = createFiresideStreamHostPlayer(rtcUser, 'chat');

watchEffect(() => {
	if (rtcUser.micAudioPlayState) {
		player.value?.play();
	} else {
		player.value?.stop();
	}
});

watchEffect(() => {
	player.value?.setVolume(Math.round(rtcUser.micPlaybackVolumeLevel * 100));
});
</script>

<template>
	<div ref="playerElem" :style="{ display: `none` }" />
</template>
