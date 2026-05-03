<script lang="ts" setup>
import { ImgHTMLAttributes, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';

import { ImgHelper } from '~common/img/helper/helper-service';
import { getElementHeight, getElementWidth } from '~common/ruler/ruler-service';
import { onScreenResize } from '~common/screen/screen-service';
import { useEventSubscription } from '~common/system/event/event-topic';
import { getMediaserverUrlForBounds } from '~utils/image';
import { sleep } from '~utils/utils';

type Props = {
	src: string;
	alt?: string;
} & /* @vue-ignore */ Pick<ImgHTMLAttributes, 'onLoad' | 'onClick' | 'width' | 'height'>;

const { src, alt = '' } = defineProps<Props>();

const emit = defineEmits<{
	imgloadchange: [isLoaded: boolean];
}>();

const root = useTemplateRef('root');
const initialized = ref(false);
const processedSrc = ref(import.meta.env.SSR ? src : '');

watch(() => src, _updateSrc);

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

	const containerWidth = getElementWidth(parent);
	const containerHeight = getElementHeight(parent);

	// Make sure we never do a 0 width, just in case. Seems to happen in some
	// situations.
	if (containerWidth <= 0) {
		return;
	}

	const newSrc = getMediaserverUrlForBounds({
		src: src,
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
