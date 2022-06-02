<script lang="ts" setup>
import { computed } from 'vue';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { useFiresideController } from '../../components/fireside/controller/controller';

const { rtc } = useFiresideController()!;

const videoPaused = computed(() => rtc.value?.videoPaused === true);

function togglePlayback() {
	if (!rtc.value) {
		return;
	}

	if (videoPaused.value) {
		_pauseVideo();
	} else {
		_unpauseVideo();
	}
}

function _pauseVideo() {
	rtc.value!.videoPaused = false;
}

function _unpauseVideo() {
	rtc.value!.videoPaused = true;
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
