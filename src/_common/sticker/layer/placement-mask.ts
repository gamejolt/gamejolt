import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { findVueParent, propRequired } from '../../../utils/vue';
import { Analytics } from '../../analytics/analytics.service';
import { DrawerStore, DrawerStoreKey, setDrawerOpen } from '../../drawer/drawer-store';
import { AppObserveDimensions } from '../../observe-dimensions/observe-dimensions.directive';
import { Scroll } from '../../scroll/scroll.service';
import AppScrollScrollerTS from '../../scroll/scroller/scroller';
import AppScrollScroller from '../../scroll/scroller/scroller.vue';
import AppStickerLayerDrawer from './drawer.vue';
import AppStickerLayerGhost from './ghost.vue';
import { calculateStickerTargetRects, StickerLayerController } from './layer-controller';
import AppStickerLayerPlacementMaskItem from './placement-mask-item.vue';
import AppStickerLayerPlacementMaskTarget from './placement-mask-target.vue';

@Component({
	components: {
		AppStickerLayerPlacementMaskItem,
		AppStickerLayerPlacementMaskTarget,
		AppStickerLayerGhost,
		AppStickerLayerDrawer,
	},
	directives: {
		AppObserveDimensions,
	},
})
export default class AppStickerLayerPlacementMask extends Vue {
	@Prop(propRequired(StickerLayerController)) layer!: StickerLayerController;

	@Inject({ from: DrawerStoreKey })
	drawer!: DrawerStore;

	hasCalculated = false;
	private width = 0;
	private height = 0;

	get viewbox() {
		return `0 0 ${this.width} ${this.height}`;
	}

	onDimensionsChange([
		{
			contentRect: { width, height },
		},
	]: ResizeObserverEntry[]) {
		this.hasCalculated = true;
		this.width = width;
		this.height = height;

		// We want to pull scroll information from the scroller if this layer
		// sits within one.
		const scrollElement =
			findVueParent<AppScrollScrollerTS>(this, AppScrollScroller)?.scrollElement ?? undefined;

		// The scroll functions will either work on the scroller, or if
		// undefined is passed in it will pull from the main document.
		const scrollLeft = Scroll.getScrollLeft(scrollElement);
		const scrollTop = Scroll.getScrollTop(scrollElement);

		calculateStickerTargetRects(this.layer, scrollLeft, scrollTop);
	}

	onClickMask() {
		Analytics.trackEvent('sticker-drawer', 'click-mask-hide');
		setDrawerOpen(this.drawer, false);
	}
}
