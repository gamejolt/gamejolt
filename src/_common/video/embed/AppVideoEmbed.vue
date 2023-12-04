<script lang="ts" setup>
import { PropType, nextTick, onMounted, ref, toRefs, watch } from 'vue';
import { Ruler } from '../../ruler/ruler-service';
import { onScreenResize } from '../../screen/screen-service';
import { useEventSubscription } from '../../system/event/event-topic';

const props = defineProps({
	videoProvider: {
		type: String as PropType<'youtube' | 'vimeo'>,
		required: true,
	},
	videoId: {
		type: String,
		required: true,
	},
	maxVideoHeight: {
		type: Number,
		default: 0,
	},
	maxVideoWidth: {
		type: Number,
		default: 0,
	},
	autoplay: {
		type: Boolean,
	},
});

const { videoProvider, videoId, maxVideoHeight, maxVideoWidth, autoplay } = toRefs(props);

const VIDEO_RATIO = 0.5625; // 16:9

const embedUrl = ref('');
const width = ref<number | 'auto'>('auto');
const height = ref<number | 'auto'>('auto');
const innerElem = ref<HTMLElement>();

useEventSubscription(onScreenResize, () => recalculateDimensions());

onMounted(() => {
	recalculateDimensions();
});

watch(
	videoId,
	() => {
		if (!videoId.value) {
			return;
		}

		let url: string;
		const queryParams = [];

		if (videoProvider.value === 'youtube') {
			url = 'https://www.youtube.com/embed/' + videoId.value;

			// Youtube forcefully displays recommended videos on their widgets.
			// Using rel=0 makes it at least only show other videos from the same channel.
			// https://developers.google.com/youtube/player_parameters#release_notes_08_23_2018
			queryParams.push('rel=0');
		} else if (videoProvider.value === 'vimeo') {
			url = 'https://player.vimeo.com/video/' + videoId.value;
		} else {
			throw new Error('Invalid video provider.');
		}

		if (autoplay.value) {
			queryParams.push('autoplay=1');
		}

		if (queryParams.length > 0) {
			url += '?' + queryParams.join('&');
		}

		embedUrl.value = url;
	},
	{ immediate: true }
);

watch(maxVideoWidth, recalculateDimensions);
watch(maxVideoHeight, recalculateDimensions);

async function recalculateDimensions() {
	await nextTick();

	if (!innerElem.value) {
		return;
	}

	width.value = Ruler.width(innerElem.value);

	if (maxVideoWidth.value) {
		width.value = Math.min(maxVideoWidth.value, width.value);
	}

	height.value = width.value * VIDEO_RATIO;

	if (maxVideoHeight.value && height.value > maxVideoHeight.value) {
		height.value = maxVideoHeight.value;
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
				webkitallowfullscreen
				mozallowfullscreen
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
				webkitallowfullscreen
				mozallowfullscreen
				allowfullscreen
				:width="width"
				:height="height"
				:src="embedUrl"
			/>
		</div>
	</div>
</template>
