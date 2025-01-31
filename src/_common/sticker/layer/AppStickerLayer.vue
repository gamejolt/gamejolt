<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, toRaw, toRefs, watchEffect } from 'vue';
import { registerContentFocusWatcher } from '../../content-focus/content-focus.service';
import { useScroller } from '../../scroll/AppScrollScroller.vue';
import { registerStickerLayer, unregisterStickerLayer, useStickerStore } from '../sticker-store';
import AppStickerLayerPlacementMask from './AppStickerLayerPlacementMask.vue';
import { createStickerLayerController, provideStickerLayer } from './layer-controller';

const props = defineProps({
	/**
	 * Indicates that this sticker layer doesn't show the placement overlay, and
	 * only contains rect data for its sticker target children.
	 * --------
	 * This should almost always be `true`, except when used in locations like:
	 * - AppShell
	 * - AppModal
	 */
	noMask: {
		type: Boolean,
	},
});

const { noMask } = toRefs(props);

const stickerStore = useStickerStore();
const { activeLayer } = stickerStore;

const scroller = useScroller();

const layer = createStickerLayerController(stickerStore);
const { isShowingDrawer, isMask } = layer;

watchEffect(() => (isMask.value = !noMask.value));

provideStickerLayer(layer);
registerStickerLayer(stickerStore, layer);

let focusWatcherDeregister: (() => void) | null = null;

const isActiveMask = computed(
	() => activeLayer.value && toRaw(activeLayer.value?.preferredMask.value) === toRaw(layer)
);

onMounted(() => {
	layer.scroller.value = scroller;

	// We tell the ContentFocus service that content is unfocused when the
	// mask is active.
	focusWatcherDeregister = registerContentFocusWatcher(() => !isShowingDrawer.value);
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
		<AppStickerLayerPlacementMask
			v-if="!noMask && isActiveMask"
			class="-placement-mask"
			:layer="activeLayer!"
		/>

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

<style lang="stylus" scoped>
.-placement-mask
	z-index: $zindex-sticker-layer
</style>
