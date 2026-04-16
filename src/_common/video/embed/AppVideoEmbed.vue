<script lang="ts" setup>
import { nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';

import { Ruler } from '~common/ruler/ruler-service';
import { onScreenResize } from '~common/screen/screen-service';
import { useEventSubscription } from '~common/system/event/event-topic';

type Props = {
	videoProvider: 'youtube' | 'vimeo';
	videoId: string;
	maxVideoHeight?: number;
	maxVideoWidth?: number;
	autoplay?: boolean;
};
const { videoProvider, videoId, maxVideoHeight = 0, maxVideoWidth = 0, autoplay } = defineProps<Props>();

const VIDEO_RATIO = 0.5625; // 16:9

const embedUrl = ref('');
const width = ref<number | 'auto'>('auto');
const height = ref<number | 'auto'>('auto');
const innerElem = useTemplateRef('innerElem');

useEventSubscription(onScreenResize, () => recalculateDimensions());

onMounted(() => {
	recalculateDimensions();
});

watch(
	() => videoId,
	() => {
		if (!videoId) {
			return;
		}

		let url: string;
		const queryParams = [];

		if (videoProvider === 'youtube') {
			url = 'https://www.youtube.com/embed/' + videoId;

			// Youtube forcefully displays recommended videos on their widgets.
			// Using rel=0 makes it at least only show other videos from the same channel.
			// https://developers.google.com/youtube/player_parameters#release_notes_08_23_2018
			queryParams.push('rel=0');
		} else if (videoProvider === 'vimeo') {
			url = 'https://player.vimeo.com/video/' + videoId;
		} else {
			throw new Error('Invalid video provider.');
		}

		if (autoplay) {
			queryParams.push('autoplay=1');
		}

		if (queryParams.length > 0) {
			url += '?' + queryParams.join('&');
		}

		embedUrl.value = url;
	},
	{ immediate: true }
);

watch(() => maxVideoWidth, recalculateDimensions);
watch(() => maxVideoHeight, recalculateDimensions);

async function recalculateDimensions() {
	await nextTick();

	if (!innerElem.value) {
		return;
	}

	width.value = Ruler.width(innerElem.value);

	if (maxVideoWidth) {
		width.value = Math.min(maxVideoWidth, width.value);
	}

	height.value = width.value * VIDEO_RATIO;

	if (maxVideoHeight && height.value > maxVideoHeight) {
		height.value = maxVideoHeight;
		width.value = height.value / VIDEO_RATIO;
	}
}
</script>

<template>
	<div>
		<div ref="innerElem">
			<iframe
				v-if="videoProvider === 'youtube' && embedUrl"
				:style="{ display: `block` }"
				nwdisable
				nwfaketop
				frameborder="0"
				allowfullscreen
				:width="width"
				:height="height"
				:src="embedUrl"
			/>

			<iframe
				v-if="videoProvider === 'vimeo' && embedUrl"
				:style="{ display: `block` }"
				nwdisable
				nwfaketop
				frameborder="0"
				allowfullscreen
				:width="width"
				:height="height"
				:src="embedUrl"
			/>
		</div>
	</div>
</template>
