import Vue from 'vue';
import { Component, Inject, Provide } from 'vue-property-decorator';
import {
	DrawerStore,
	DrawerStoreKey,
	registerStickerLayer,
	unregisterStickerLayer,
} from '../../drawer/drawer-store';
import AppStickerDrawer from '../drawer/drawer.vue';
import { StickerLayerController, StickerLayerKey } from './layer-controller';
import AppStickerLayerPlacementMask from './placement-mask.vue';

@Component({
	components: {
		AppStickerLayerPlacementMask,
		AppStickerDrawer,
	},
})
export default class AppStickerLayer extends Vue {
	@Provide(StickerLayerKey) layer = new StickerLayerController();
	@Inject(DrawerStoreKey) drawer!: DrawerStore;

	get isShowingMask() {
		return this.drawer.isDrawerOpen && this.drawer.activeLayer === this.layer;
	}

	created() {
		registerStickerLayer(this.drawer, this.layer);
	}

	beforeDestroy() {
		unregisterStickerLayer(this.drawer, this.layer);
	}
}
