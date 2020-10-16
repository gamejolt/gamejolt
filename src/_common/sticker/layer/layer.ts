import Vue from 'vue';
import { Component, Inject, Prop, Provide } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import {
	DrawerStore,
	DrawerStoreKey,
	registerStickerLayer,
	unregisterStickerLayer,
} from '../../drawer/drawer-store';
import AppStickerDrawer from '../drawer/drawer.vue';
import AppStickerDrawerGhost from '../drawer/_ghost/ghost.vue';
import { StickerLayerController, StickerLayerKey } from './layer-controller';
import AppStickerLayerPlacementMask from './placement-mask.vue';

@Component({
	components: {
		AppStickerLayerPlacementMask,
		AppStickerDrawer,
		AppStickerDrawerGhost,
	},
})
export default class AppStickerLayer extends Vue {
	@Provide(StickerLayerKey) layer = new StickerLayerController();
	@Inject(DrawerStoreKey) drawer!: DrawerStore;

	@Prop(propOptional(Boolean, false)) hasFixedParent!: boolean;

	get isActiveLayer() {
		return this.drawer.activeLayer === this.layer;
	}

	get isShowingMask() {
		return this.drawer.isDrawerOpen && this.isActiveLayer;
	}

	created() {
		if (this.hasFixedParent) {
			// The layer controllers relativeScrollTop defaults to 0,
			// but any layers that have a fixed (different scroll-context)
			// parent should have a reference value set for future calculations.
			this.layer.relativeScrollTop = document.documentElement.scrollTop;
		}

		registerStickerLayer(this.drawer, this.layer);
	}

	beforeDestroy() {
		unregisterStickerLayer(this.drawer, this.layer);
	}
}
