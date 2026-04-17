<script lang="ts" setup>
import { computed } from 'vue';

import AppJolticon from '~common/jolticon/AppJolticon.vue';
import {
	toggleVideoPlayback,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '~common/video/player/controller';
import { assertNever } from '~utils/utils';

type Props = {
	player: VideoPlayerController;
};
const { player } = defineProps<Props>();

const icon = computed(() => {
	switch (player.state) {
		case 'playing':
			return 'pause';
		case 'paused':
			return 'play';
		default:
			assertNever(player.state);
	}
});

function onClickPlayback() {
	toggleVideoPlayback(player);
	trackVideoPlayerEvent(player, player.state === 'playing' ? 'play' : 'pause', 'click-control');
}
</script>

<template>
	<div class="player-control-button" @click.capture.prevent="onClickPlayback">
		<AppJolticon :icon="icon" />
	</div>
</template>

<style lang="stylus" scoped>
@import './common'
</style>
