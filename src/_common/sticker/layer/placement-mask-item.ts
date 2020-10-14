import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findVueParent, propRequired } from '../../../utils/vue';
import { Scroll } from '../../scroll/scroll.service';
import AppScrollScrollerTS from '../../scroll/scroller/scroller';
import AppScrollScroller from '../../scroll/scroller/scroller.vue';
import AppStickerTarget from '../target/target';

// How much extra padding (in px) should we put around each target for the
// cutout that we make?
const TargetVPadding = 4;
const TargetHPadding = 8;

@Component({})
export default class AppStickerLayerPlacementMaskItem extends Vue {
	@Prop(propRequired()) target!: AppStickerTarget;

	x = 0;
	y = 0;
	width = 0;
	height = 0;

	created() {
		// We only pull once and then cache. This should get recalculated when
		// the dimensions of the whole placement-mask change.
		const { x, y, width, height } = this.target.$el.getBoundingClientRect();

		// We want to pull scroll information from the scroller if this layer
		// sits within one.
		const scrollElement =
			findVueParent<AppScrollScrollerTS>(this, AppScrollScroller)?.scrollElement ?? undefined;

		// The scroll functions will either work on the scroller, or if
		// undefined is passed in it will pull from the main document. We need
		// to subtract this scroll distance since getBoundingClientRect()
		// returns x/y from the left/top of the scroll context.
		const xRemove = Scroll.getScrollLeft(scrollElement);
		const yRemove = Scroll.getScrollTop(scrollElement);

		this.x = x + xRemove - TargetHPadding;
		this.y = y + yRemove - TargetVPadding;
		this.width = width + TargetHPadding * 2;
		this.height = height + TargetVPadding * 2;
	}
}
