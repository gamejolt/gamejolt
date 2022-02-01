<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { assertNever } from '../../../utils/utils';
import { toggleVideoPlayback, trackVideoPlayerEvent, VideoPlayerController } from './controller';
import AppJolticon from '../../jolticon/AppJolticon.vue';

const props = defineProps({
	player: {
		type: Object as PropType<VideoPlayerController>,
		required: true,
	},
});

const icon = computed(() => {
	switch (props.player.state) {
		case 'playing':
			return 'pause';
		case 'paused':
			return 'play';
		default:
			assertNever(props.player.state);
	}
});

function onClickPlayback() {
	toggleVideoPlayback(props.player);
	trackVideoPlayerEvent(
		props.player,
		props.player.state === 'playing' ? 'play' : 'pause',
		'click-control'
	);
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
