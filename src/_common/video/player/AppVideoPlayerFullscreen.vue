<script lang="ts" setup>
import { PropType } from 'vue';
import {
	queueVideoFullscreenChange,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from './controller';
import AppJolticon from '../../jolticon/AppJolticon.vue';

const props = defineProps({
	player: {
		type: Object as PropType<VideoPlayerController>,
		required: true,
	},
});

function toggleFullscreen() {
	trackVideoPlayerEvent(
		props.player,
		!props.player.isFullscreen ? 'fullscreen' : 'un-fullscreen',
		'click-control'
	);
	queueVideoFullscreenChange(props.player, !props.player.isFullscreen);
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
