<script lang="ts" setup>
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { useFiresideController } from '../../components/fireside/controller/controller';

const { videoPaused } = useFiresideController()!;

function togglePlayback() {
	if (videoPaused.value) {
		_pauseVideo();
	} else {
		_unpauseVideo();
	}
}

function _pauseVideo() {
	videoPaused.value = false;
}

function _unpauseVideo() {
	videoPaused.value = true;
}
</script>

<template>
	<div class="-options-wrap" @click.capture.stop="togglePlayback">
		<div class="-options">
			<AppJolticon class="-icon" :icon="videoPaused ? 'play' : 'pause'" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'
</style>
