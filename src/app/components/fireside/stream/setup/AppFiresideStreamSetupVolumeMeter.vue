<script lang="ts" setup>
import { computed, onMounted, onUnmounted, PropType, ref, toRefs } from 'vue';
import {
	FiresideRTCProducer,
	getOwnDesktopAudioVolume,
	getOwnMicAudioVolume,
} from '../../../../../_common/fireside/rtc/producer';

const props = defineProps({
	producer: {
		type: Object as PropType<FiresideRTCProducer>,
		required: true,
	},
	type: {
		type: String as PropType<'mic' | 'desktop-audio'>,
		required: true,
	},
});

const { producer, type } = toRefs(props);

const volume = ref(0);
let _refreshVolumeInterval: NodeJS.Timer | null = null;

onMounted(() => {
	_refreshVolumeInterval = setInterval(() => {
		volume.value =
			type.value === 'mic'
				? getOwnMicAudioVolume(producer.value)
				: getOwnDesktopAudioVolume(producer.value);
	}, 100);
});

onUnmounted(() => {
	if (_refreshVolumeInterval) {
		clearInterval(_refreshVolumeInterval);
	}
});

const volumePercent = computed(
	() => 'calc(' + Math.max(0, Math.min(100, volume.value * 100)) + '% + 4px)'
);
</script>

<template>
	<div class="-volume-meter">
		<div class="-full" :style="{ width: volumePercent }" />
	</div>
</template>

<style lang="stylus" scoped>
.-volume-meter
	position: relative
	height: 7px
	background-color: black
	overflow-x: clip

	.-full
		change-bg('highlight')
		position: absolute
		top: -2px
		left: -2px
		width: 0
		min-width: 5px
		height: calc(100% + 4px)
		transition: width 100ms cubic-bezier(0.39, 0.58, 0.57, 1)
		will-change: width
</style>
