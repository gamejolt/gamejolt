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
	attachedToControl: {
		type: Boolean,
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
	<div class="-volume-meter" :class="{ '-attached': attachedToControl }">
		<div class="-fill" :style="{ width: volumePercent }" />
	</div>
</template>

<style lang="stylus" scoped>
.-volume-meter
	position: relative
	height: 5px
	overflow: hidden
	background-color: rgba(0, 0, 0, 0.5)
	border-radius: $border-radius-base

	.-fill
		background-color: var(--theme-link)
		position: absolute
		top: -1px
		bottom: -1px
		left: -1px
		width: 0
		min-width: 5px
		transition: width 100ms cubic-bezier(0.39, 0.58, 0.57, 1)
		will-change: width
		border-radius: 0px $border-radius-base $border-radius-base 0px

.-attached
	border-top-left-radius: 0
	border-top-right-radius: 0
</style>
