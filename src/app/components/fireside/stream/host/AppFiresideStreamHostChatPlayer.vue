<script lang="ts" setup>
import { PropType, watchEffect } from 'vue';
import { FiresideHost } from '../../../../../_common/fireside/rtc/host';
import { useFiresideController } from '../../controller/controller';
import { createFiresideStreamHostPlayer } from './player-controller';

const props = defineProps({
	host: {
		type: Object as PropType<FiresideHost>,
		required: true,
	},
});

// We want to freeze these. If it changed out from under us ever, it would break
// everything.
//
// eslint-disable-next-line vue/no-setup-props-destructure
const { host } = props;

const { logger } = useFiresideController()!;
const { player, playerElem } = createFiresideStreamHostPlayer({
	host,
	logger,
	playerType: 'chat',
});

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
