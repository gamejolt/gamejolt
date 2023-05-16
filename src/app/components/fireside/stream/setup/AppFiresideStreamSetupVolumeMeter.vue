<script lang="ts" setup>
import { computed, onMounted, onUnmounted, PropType, ref, toRefs } from 'vue';
import {
	FiresideProducer,
	getOwnDesktopAudioVolume,
	getOwnMicAudioVolume,
} from '../../../../../_common/fireside/rtc/producer';
import { kThemeLink } from '../../../../../_common/theme/variables';
import { styleWhen } from '../../../../../_styles/mixins';
import { kBorderRadiusBase } from '../../../../../_styles/variables';

const props = defineProps({
	producer: {
		type: Object as PropType<FiresideProducer>,
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
	<div
		:style="{
			position: `relative`,
			height: `5px`,
			overflow: `hidden`,
			backgroundColor: `rgba(0, 0, 0, 0.5)`,
			borderRadius: kBorderRadiusBase.px,
			...styleWhen(attachedToControl, {
				borderTopLeftRadius: 0,
				borderTopRightRadius: 0,
			}),
		}"
	>
		<div
			class="-fill"
			:style="{
				backgroundColor: kThemeLink,
				position: `absolute`,
				top: `-1px`,
				bottom: `-1px`,
				left: `-1px`,
				width: volumePercent,
				minWidth: `5px`,
				transition: `width 100ms cubic-bezier(0.39, 0.58, 0.57, 1)`,
				willChange: `width`,
				borderRadius: `0px ${kBorderRadiusBase.px} ${kBorderRadiusBase.px} 0px`,
			}"
		/>
	</div>
</template>
