<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import {
	ContentFocus,
	registerContentFocusWatcher,
} from '../../content-focus/content-focus.service';
import { useScroller } from '../../scroll/AppScrollScroller.vue';
import { registerStickerLayer, unregisterStickerLayer, useStickerStore } from '../sticker-store';
import { createStickerLayerController, provideStickerLayer } from './layer-controller';

const stickerStore = useStickerStore();
const scroller = useScroller();

const layer = createStickerLayerController(stickerStore);
provideStickerLayer(layer);
registerStickerLayer(stickerStore, layer);

let focusWatcherDeregister: (() => void) | null = null;

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
	<div @contextmenu="onContextMenu">
		<!--
		I don't know why, but DO NOT PUT ELEMENTS AFTER THIS SLOT. For some
		reason vue was having a hard time not-rerendering everything on certain
		changes to the StickerService.

		NOTE: May no longer be relevant since previous components were removed
		from this root element.
		-->
		<slot />
	</div>
</template>
