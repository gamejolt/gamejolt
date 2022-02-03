<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../utils/vue';
import { Analytics } from '../../analytics/analytics.service';
import { setDrawerOpen, useDrawerStore } from '../../drawer/drawer-store';
import { vAppObserveDimensions } from '../../observe-dimensions/observe-dimensions.directive';
import { useScroller } from '../../scroll/AppScrollScroller.vue';
import { Scroll } from '../../scroll/scroll.service';
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
		AppObserveDimensions: vAppObserveDimensions,
	},
})
export default class AppStickerLayerPlacementMask extends Vue {
	@Prop({ type: Object, required: true }) layer!: StickerLayerController;

	drawer = shallowSetup(() => useDrawerStore());

	hasCalculated = false;
	width = 0;
	height = 0;
	private parentScroller = shallowSetup(() => useScroller());

	get viewbox() {
		return `0 0 ${this.width} ${this.height}`;
	}

	get isDragging() {
		return this.drawer.isDragging.value;
	}

	get sticker() {
		return this.drawer.sticker.value;
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
		const scrollElement = this.parentScroller?.element.value ?? undefined;

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
</script>

<template>
	<!--
	We set the keys below to the "viewbox" so that we recalculate all the
	sticker targets/masks every time dimensions for the page change. Chances are
	that new content has loaded in or shifted the targets around.
	-->
	<div
		v-app-observe-dimensions="onDimensionsChange"
		class="-container"
		:class="{ '-dragging': isDragging }"
	>
		<div class="-overlay" @click.stop="onClickMask">
			<svg v-if="width > 0" :viewBox="viewbox" xmlns="http://www.w3.org/2000/svg">
				<!--
				This creates a mask that we use to punch out the targets from the
				black overlay.
				-->
				<mask id="myMask">
					<rect x="0" y="0" :width="width" :height="height" fill="white" />
					<template v-if="hasCalculated">
						<AppStickerLayerPlacementMaskItem
							v-for="(target, i) of layer.targets.value"
							:key="`${viewbox}-${i}`"
							:target="target"
							:layer="layer"
						/>
					</template>
				</mask>

				<rect
					x="0"
					y="0"
					:width="width"
					:height="height"
					mask="url(#myMask)"
					fill="#888"
					opacity="0.5"
				/>
			</svg>

			<template v-if="hasCalculated">
				<AppStickerLayerPlacementMaskTarget
					v-for="(target, i) of layer.targets.value"
					:key="`${viewbox}-${i}`"
					:target="target"
					:layer="layer"
				/>
			</template>
		</div>

		<AppStickerLayerDrawer class="-drawer" />
		<AppStickerLayerGhost v-if="sticker" class="-ghost" />
	</div>
</template>

<style lang="stylus" scoped>
.-container
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	overflow: hidden

.-dragging
	cursor: grabbing !important

	.-ghost
		z-index: 4

.-overlay
	z-index: 1

.-ghost
	z-index: 2

.-drawer
	z-index: 3
</style>
