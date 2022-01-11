import { ref } from 'vue';
import { setup } from 'vue-class-component';
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../analytics/analytics.service';
import { DrawerStore, DrawerStoreKey, setDrawerOpen } from '../../drawer/drawer-store';
import { AppObserveDimensions } from '../../observe-dimensions/observe-dimensions.directive';
import { Scroll } from '../../scroll/scroll.service';
import { useScroller } from '../../scroll/scroller/scroller.vue';
import AppStickerLayerDrawer from './drawer.vue';
import AppStickerLayerGhost from './ghost.vue';
import { calculateStickerTargetRects, StickerLayerController } from './layer-controller';
import AppStickerLayerPlacementMaskItem from './placement-mask-item.vue';
import AppStickerLayerPlacementMaskTarget from './placement-mask-target.vue';

@Options({
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
	@Prop({ type: Object, required: true }) layer!: StickerLayerController;

	@Inject({ from: DrawerStoreKey })
	drawer!: DrawerStore;

	hasCalculated = false;
	width = 0;
	height = 0;
	private parentScroller = setup(() => ref(useScroller()));

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
		const scrollElement = this.parentScroller?.element ?? undefined;

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
