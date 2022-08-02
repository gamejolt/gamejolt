<script lang="ts" setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted } from 'vue';
import {
	ContentFocus,
	registerContentFocusWatcher,
} from '../../content-focus/content-focus.service';
import { useScroller } from '../../scroll/AppScrollScroller.vue';
import { registerStickerLayer, unregisterStickerLayer, useStickerStore } from '../sticker-store';
import { createStickerLayerController, provideStickerLayer } from './layer-controller';

// Lazy load all of this since we only need it when the drawer is showing.
const AppStickerLayerPlacementMask = defineAsyncComponent(
	() => import('./AppStickerLayerPlacementMask.vue')
);

const stickerStore = useStickerStore();
const scroller = useScroller();

const layer = createStickerLayerController(stickerStore);
provideStickerLayer(layer);
registerStickerLayer(stickerStore, layer);

let focusWatcherDeregister: (() => void) | null = null;

const isDragging = computed(() => stickerStore.isDragging.value);

const isShowingDrawer = computed(() => layer.isShowingDrawer.value);

onMounted(() => {
	layer.scroller.value = scroller;

	// We tell the ContentFocus service that content is unfocused when the
	// mask is active.
	focusWatcherDeregister = registerContentFocusWatcher(
		ContentFocus,
		() => !isShowingDrawer.value
	);
});

onBeforeUnmount(() => {
	unregisterStickerLayer(stickerStore, layer);
	focusWatcherDeregister?.();
});

function onContextMenu(e: MouseEvent) {
	if (!isShowingDrawer.value) {
		return;
	}
	e.preventDefault();
}
</script>

<template>
	<div class="-layer" :class="{ '-dragging': isDragging }" @contextmenu="onContextMenu">
		<AppStickerLayerPlacementMask
			v-if="isShowingDrawer"
			class="-placement-mask"
			:layer="layer"
		/>

		<!--
		I don't know why, but DO NOT PUT ELEMENTS AFTER THIS SLOT. For some
		reason vue was having a hard time not-rerendering everything on certain
		changes to the StickerService.
		-->
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-placement-mask
	z-index: $zindex-sticker-layer
</style>
