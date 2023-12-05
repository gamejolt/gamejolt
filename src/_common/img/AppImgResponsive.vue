<script lang="ts" setup>
import { nextTick, onMounted, ref, toRefs, watch } from 'vue';
import { getMediaserverUrlForBounds } from '../../utils/image';
import { sleep } from '../../utils/utils';
import { Ruler } from '../ruler/ruler-service';
import { onScreenResize } from '../screen/screen-service';
import { useEventSubscription } from '../system/event/event-topic';
import { ImgHelper } from './helper/helper-service';

const props = defineProps({
	src: {
		type: String,
		required: true,
	},
	alt: {
		type: String,
		default: '',
	},
});

const emit = defineEmits({
	imgloadchange: (_isLoaded: boolean) => true,
});

const { src } = toRefs(props);

const root = ref<HTMLElement>();
const initialized = ref(false);
const processedSrc = ref(import.meta.env.SSR ? src.value : '');

watch(src, _updateSrc);

useEventSubscription(onScreenResize, () => _updateSrc());

onMounted(async () => {
	// Make sure the view is compiled.
	await nextTick();
	_updateSrc();
});

async function _updateSrc() {
	// Try waiting for any resizes and breakpoint changes to happen before
	// getting the container information.
	await sleep(0);

	const parent = root.value?.parentElement;
	if (!parent) {
		return;
	}

	const containerWidth = Ruler.width(parent);
	const containerHeight = Ruler.height(parent);

	// Make sure we never do a 0 width, just in case. Seems to happen in some
	// situations.
	if (containerWidth <= 0) {
		return;
	}

	const newSrc = getMediaserverUrlForBounds({
		src: src.value,
		maxWidth: containerWidth,
		maxHeight: containerHeight,
	});

	// Only if the src changed from previous runs. They may be the same if the
	// user resized the window but image container didn't change dimensions.
	if (!initialized.value || newSrc !== processedSrc.value) {
		processedSrc.value = newSrc;
		initialized.value = true;

		// Keep the isLoaded state up to date?
		emit('imgloadchange', false);
		await ImgHelper.loaded(newSrc);
		emit('imgloadchange', true);
	}
}
</script>

<template>
	<img ref="root" class="img-responsive" :src="processedSrc" :alt="alt" />
</template>
