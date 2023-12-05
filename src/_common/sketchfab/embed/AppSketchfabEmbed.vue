<script lang="ts">
import { nextTick, onMounted, ref, toRefs, watch } from 'vue';
import { Ruler } from '../../ruler/ruler-service';
import { onScreenResize } from '../../screen/screen-service';
import { useEventSubscription } from '../../system/event/event-topic';

const RATIO = 0.5625; // 16:9

/**
 * Regex used for app-form components to validate text input to be valid sketchfab input.
 * Matches all 3 valid sketchfab input formats: new urls, old urls, standalone ids.
 * @see getSketchfabIdFromInput for more info on the formats.
 */
export const SKETCHFAB_FIELD_VALIDATION_REGEX =
	/^(?:(?:https:\/\/)?(?:www\.)?(?:sketchfab\.com\/3d-models\/(?:[a-z0-9]+-)+([0-9a-f]{32})\/?))$|^(?:(?:https:\/\/)?(?:www\.)?(?:sketchfab\.com\/models\/([0-9a-f]{32})\/?))$|^([0-9a-f]{32})$/i;

const SKETCHFAB_URL_REGEX_1 =
	/^(?:(?:https:\/\/)?(?:www\.)?(?:sketchfab\.com\/3d-models\/(?:[a-z0-9]+-)+([0-9a-f]{32})\/?))$/i;
const SKETCHFAB_URL_REGEX_2 =
	/^(?:(?:https:\/\/)?(?:www\.)?(?:sketchfab\.com\/models\/([0-9a-f]{32})\/?))$/i;

export function getSketchfabIdFromInput(input: string) {
	// The input has to be validated with the SKETCHFAB_FIELD_VALIDATOR_REGEX.
	// That means that the input has to take one of these 3 forms:
	// - new sketchfab url format (https://sketchfab.com/3d-models/name-id), matched with SKETCHFAB_URL_REGEX_1
	// - old sketchfab url format (https://sketchfab.com/models/id), matched with SKETCHFAB_URL_REGEX_2
	// - standalone sketchfab id (example: 70001ecdc29c43ceba1d766f09fe79c0)

	// Try to extract the sketchfab model ID from a url using the two different model url regex matchers.
	for (const regex of [SKETCHFAB_URL_REGEX_1, SKETCHFAB_URL_REGEX_2]) {
		const urlMatches = regex.exec(input.trim());
		if (urlMatches !== null && urlMatches.length === 2) {
			const id = urlMatches[1];
			return id;
		}
	}
	// Does not match either of the two regexes above. Due to the above assumption, this must be a standalone sketchfab model id.
	return input;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	sketchfabId: {
		type: String,
		required: true,
	},
	maxWidth: {
		type: Number,
		default: 0,
	},
	maxHeight: {
		type: Number,
		default: 0,
	},
	autoplay: {
		type: Boolean,
	},
});

const { sketchfabId, maxWidth, maxHeight, autoplay } = toRefs(props);

const embedUrl = ref('');
const width = ref(0);
const height = ref(0);
const innerElem = ref<HTMLElement>();

useEventSubscription(onScreenResize, () => recalculateDimensions());

onMounted(() => {
	recalculateDimensions();
});

watch(
	sketchfabId,
	() => {
		if (!sketchfabId.value) {
			return;
		}

		let url = `https://sketchfab.com/models/${sketchfabId.value}/embed`;

		if (autoplay.value) {
			url += '?autostart=1';
		}

		embedUrl.value = url;
	},
	{ immediate: true }
);

async function recalculateDimensions() {
	await nextTick();

	if (!innerElem.value) {
		return;
	}

	width.value = Ruler.width(innerElem.value);

	if (maxWidth.value) {
		width.value = Math.min(maxWidth.value, width.value);
	}

	height.value = width.value * RATIO;

	if (maxHeight.value && height.value > maxHeight.value) {
		height.value = maxHeight.value;
		width.value = height.value / RATIO;
	}
}
</script>

<template>
	<div>
		<div ref="innerElem">
			<iframe
				nwdisable
				nwfaketop
				frameborder="0"
				allowvr
				allowfullscreen
				mozallowfullscreen
				webkitallowfullscreen
				:width="width"
				:height="height"
				:src="embedUrl"
			/>
		</div>
	</div>
</template>
