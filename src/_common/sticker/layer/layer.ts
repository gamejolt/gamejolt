import Vue from 'vue';
import { Component, Inject, Prop, Provide } from 'vue-property-decorator';
import { findVueParent, propOptional } from '../../../utils/vue';
import { ContentFocus } from '../../content-focus/content-focus.service';
import {
	DrawerStore,
	DrawerStoreKey,
	registerStickerLayer,
	unregisterStickerLayer,
} from '../../drawer/drawer-store';
import AppScrollScrollerTS from '../../scroll/scroller/scroller';
import AppScrollScroller from '../../scroll/scroller/scroller.vue';
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
	@Prop(propOptional(Boolean, false)) hasFixedParent!: boolean;

	@Inject(DrawerStoreKey) drawer!: DrawerStore;

	@Provide(StickerLayerKey) layer = new StickerLayerController(this.drawer);

	private focusWatcherDeregister!: () => void;

	created() {
		registerStickerLayer(this.drawer, this.layer);
	}

	mounted() {
		this.layer.scroller = findVueParent<AppScrollScrollerTS>(this, AppScrollScroller) ?? null;

		// We tell the ContentFocus service that content is unfocused when the
		// mask is active.
		this.focusWatcherDeregister = ContentFocus.registerWatcher(
			() => !this.layer.isShowingDrawer
		);
	}

	beforeDestroy() {
		unregisterStickerLayer(this.drawer, this.layer);
		this.focusWatcherDeregister();
	}
}
