<script lang="ts" setup>
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import {
	queueVideoFullscreenChange,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '~common/video/player/controller';

type Props = {
	player: VideoPlayerController;
};
const { player } = defineProps<Props>();

function toggleFullscreen() {
	trackVideoPlayerEvent(
		player,
		!player.isFullscreen ? 'fullscreen' : 'un-fullscreen',
		'click-control'
	);
	queueVideoFullscreenChange(player, !player.isFullscreen);
}
</script>

<template>
	<div class="player-control-button" @click="toggleFullscreen">
		<AppJolticon :icon="!player.isFullscreen ? 'fullscreen' : 'unfullscreen'" />
	</div>
</template>

<style lang="stylus" scoped>
@import './common'
</style>
