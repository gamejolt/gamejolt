<script lang="ts" setup>
import { PropType, watchEffect } from 'vue';
import { FiresideRTCHost } from '../../../../../_common/fireside/rtc/host';
import { createFiresideStreamHostPlayer } from './player-controller';

const props = defineProps({
	host: {
		type: Object as PropType<FiresideRTCHost>,
		required: true,
	},
});

// We want to freeze these. If it changed out from under us ever, it would break
// everything.
//
// eslint-disable-next-line vue/no-setup-props-destructure
const { host } = props;

const { player, playerElem } = createFiresideStreamHostPlayer(host, 'chat');

watchEffect(() => {
	if (host.micAudioPlayState) {
		player.value?.play();
	} else {
		player.value?.stop();
	}
});

watchEffect(() => {
	player.value?.setVolume(Math.round(host.micPlaybackVolumeLevel * 100));
});
</script>

<template>
	<div ref="playerElem" :style="{ display: `none` }" />
</template>
