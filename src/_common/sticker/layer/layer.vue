<script lang="ts">
import { defineAsyncComponent } from '@vue/runtime-core';
import { ref } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../utils/vue';
import {
	ContentFocus,
	registerContentFocusWatcher,
} from '../../content-focus/content-focus.service';
import {
	registerStickerLayer,
	unregisterStickerLayer,
	useDrawerStore,
} from '../../drawer/drawer-store';
import { useScroller } from '../../scroll/scroller/scroller.vue';
import {
	createStickerLayerController,
	provideStickerLayer,
	StickerLayerController,
} from './layer-controller';

@Options({
	components: {
		// Lazy load all of this since we only need it when the drawer is showing.
		AppStickerLayerPlacementMask: defineAsyncComponent(() => import('./placement-mask.vue')),
	},
})
export default class AppStickerLayer extends Vue {
	@Prop({ type: Boolean, default: false }) hasFixedParent!: boolean;

	drawer = shallowSetup(() => useDrawerStore());

	layer!: StickerLayerController;

	scroller = setup(() => ref(useScroller()));

	private focusWatcherDeregister!: () => void;

	get isDragging() {
		return this.drawer.isDragging.value;
	}

	get isShowingDrawer() {
		return this.layer.isShowingDrawer.value;
	}

	created() {
		this.layer = createStickerLayerController(this.drawer);
		provideStickerLayer(this.layer);
		registerStickerLayer(this.drawer, this.layer);
	}

	mounted() {
		this.layer.scroller.value = this.scroller;

		// We tell the ContentFocus service that content is unfocused when the
		// mask is active.
		this.focusWatcherDeregister = registerContentFocusWatcher(
			ContentFocus,
			() => !this.isShowingDrawer
		);
	}

	beforeUnmount() {
		unregisterStickerLayer(this.drawer, this.layer);
		this.focusWatcherDeregister();
	}

	onContextMenu(e: MouseEvent) {
		if (!this.isShowingDrawer) {
			return;
		}
		e.preventDefault();
	}
}
</script>

<template>
	<div class="-layer" :class="{ '-dragging': isDragging }" @contextmenu="onContextMenu">
		<app-sticker-layer-placement-mask
			v-if="isShowingDrawer"
			class="-placement-mask"
			:layer="layer"
		/>

		<!--
		I don't know why, but DO NOT PUT ELEMENTS AFTER THIS SLOT. For some
		reason vue was having a hard time not-rerendering everything on certain
		changes to drawer store.
		-->
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-placement-mask
	z-index: $zindex-sticker-layer
</style>
