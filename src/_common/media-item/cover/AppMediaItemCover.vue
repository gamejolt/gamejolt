<script lang="ts" setup>
import { ref, useTemplateRef, watch } from 'vue';

import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '~common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItemModel } from '~common/media-item/media-item-model';
import { getElementWidth } from '~common/ruler/ruler-service';
import { getScreen } from '~common/screen/screen-service';
import { useResizeObserver } from '~utils/resize-observer';

type Props = {
	mediaItem: MediaItemModel;
	maxHeight?: number;
	blur?: boolean;
};
const { mediaItem, maxHeight, blur } = defineProps<Props>();

const emit = defineEmits<{
	loaded: [];
}>();

const isLoaded = ref(false);
const height = ref('auto');
const el = useTemplateRef('el');

if (import.meta.env.SSR) {
	recalcHeight();
	isLoaded.value = true;
}

useResizeObserver({ target: el, callback: recalcHeight });
watch([() => mediaItem, () => maxHeight], recalcHeight);

function recalcHeight() {
	if (mediaItem) {
		if (el.value) {
			const newDimensions = mediaItem.getDimensions(getElementWidth(el.value), undefined, {
				force: true,
			});

			// We extend the header to the right and left by 20% on XS since the
			// screen is so small. This makes sure that we also calculate the
			// height larger.
			if (getScreen().isXs.value) {
				newDimensions.height *= 1.4;
			}

			if (maxHeight && newDimensions.height > maxHeight) {
				newDimensions.height = maxHeight;
			}

			height.value = newDimensions.height + 'px';
			return;
		}

		// If no element yet, set the height to auto.
		height.value = 'auto';
		return;
	}

	// Make sure it's collapsed if there is no header.
	height.value = '0';
}

function onLoadChange(newIsLoaded: boolean) {
	isLoaded.value = newIsLoaded;

	if (isLoaded.value) {
		emit('loaded');
	}
}
</script>

<template>
	<div ref="el" class="media-item-cover-container" :class="{ '-blur': blur }">
		<section class="section media-item-cover" :class="{ loaded: isLoaded }">
			<div class="media-item-cover-img">
				<AppMediaItemBackdrop class="-backdrop" :media-item="mediaItem" :style="{ height }">
					<AppImgResponsive
						v-show="isLoaded"
						:src="mediaItem.mediaserver_url"
						alt=""
						@imgloadchange="onLoadChange"
					/>
				</AppMediaItemBackdrop>
			</div>

			<div>
				<slot />
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.-backdrop
	display: flex
	align-items: center

.media-item-cover-container
	change-bg('gray')
	display: block
	overflow: hidden
	width: 100%
	height: auto

.media-item-cover
	padding: 0
	position: relative
	overflow: hidden
	height: 100%
	display: flex
	flex-direction: column
	justify-content: center

	&-img
		position: relative
		width: 100%

		@media $media-xs
			width: 140%
			margin-left: -20%

		img
			position: relative
			width: 100%

.-blur
	img
		filter: blur(15px)
</style>
