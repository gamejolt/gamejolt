<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';

import { vAppObserveDimensions } from '~common/observe-dimensions/observe-dimensions.directive';
import { useScroller } from '~common/scroll/AppScrollScroller.vue';
import { getScrollLeft, getScrollTop } from '~common/scroll/scroll.service';
import AppStickerChargeCard from '~common/sticker/charge/AppStickerChargeCard.vue';
import AppStickerLayerDrawer from '~common/sticker/layer/AppStickerLayerDrawer.vue';
import AppStickerLayerGhost from '~common/sticker/layer/AppStickerLayerGhost.vue';
import AppStickerLayerPlacementMaskItem from '~common/sticker/layer/AppStickerLayerPlacementMaskItem.vue';
import AppStickerLayerPlacementMaskTarget from '~common/sticker/layer/AppStickerLayerPlacementMaskTarget.vue';
import {
	calculateStickerTargetRects,
	StickerLayerController,
} from '~common/sticker/layer/layer-controller';
import {
	closeStickerDrawer,
	isStickerTargetMine,
	useStickerStore,
} from '~common/sticker/sticker-store';

type Props = {
	layer: StickerLayerController;
};
const { layer } = defineProps<Props>();

const { canChargeAllTargets } = layer;

const parentScroller = useScroller();
const stickerStore = useStickerStore();
const { isDragging, sticker, targetController } = stickerStore;

const hasCalculated = ref(false);
const _width = ref(0);
const _height = ref(0);

const viewbox = computed(() => `0 0 ${_width.value} ${_height.value}`);

const isChargeableResource = toRef(() => targetController.value?.canReceiveCharge.value);
const isTargetMine = computed(() => isStickerTargetMine(stickerStore, targetController.value));

function onDimensionsChange([
	{
		contentRect: { width, height },
	},
]: ResizeObserverEntry[]) {
	hasCalculated.value = true;
	_width.value = width;
	_height.value = height;

	// We want to pull scroll information from the scroller if this layer
	// sits within one.
	const scrollElement = parentScroller?.element.value;

	// The scroll functions will either work on the scroller, or if
	// undefined is passed in it will pull from the main document.
	const scrollLeft = getScrollLeft(scrollElement);
	const scrollTop = getScrollTop(scrollElement);

	calculateStickerTargetRects(layer, scrollLeft, scrollTop);
}

function onClickMask() {
	closeStickerDrawer(stickerStore);
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
			<svg v-if="_width > 0" :viewBox="viewbox" xmlns="http://www.w3.org/2000/svg">
				<!--
				This creates a mask that we use to punch out the targets from the
				black overlay.
				-->
				<mask id="myMask">
					<rect x="0" y="0" :width="_width" :height="_height" fill="white" />
					<template v-if="hasCalculated">
						<AppStickerLayerPlacementMaskItem
							v-for="(target, i) of layer.layerItems.value"
							:key="`${viewbox}-${i}`"
							:target="target"
							:layer="layer"
						/>
					</template>
				</mask>

				<rect
					x="0"
					y="0"
					:width="_width"
					:height="_height"
					mask="url(#myMask)"
					fill="#000"
					opacity="0.75"
				/>
			</svg>

			<template v-if="hasCalculated">
				<AppStickerLayerPlacementMaskTarget
					v-for="(target, i) of layer.layerItems.value"
					:key="`${viewbox}-${i}`"
					:target="target"
					:layer="layer"
				/>
			</template>
		</div>

		<AppStickerLayerDrawer class="-drawer" />
		<div
			v-if="canChargeAllTargets || (isChargeableResource && !isTargetMine)"
			class="-charge-wrapper"
			:class="{
				'-charge-shift': isDragging,
			}"
		>
			<div class="-charge-card anim-fade-in-down">
				<AppStickerChargeCard elevate />
			</div>
		</div>
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

.-charge-wrapper
	z-index: 2
	position: fixed
	display: inline-flex
	justify-content: center
	// Always offset by the shell-top in case this sticker mask is displayed
	// with a lower z-index than the shell.
	top: var(--shell-top)
	right: 0
	transition: transform 250ms $strong-ease-out

	@media $media-mobile
		padding: 12px 16px 0
		left: 0

	@media $media-md-up
		padding: 32px 32px 0 0

.-charge-card
	transform: translateY(0)

.-charge-shift
	transform: translateY(calc(12px - 100%))

.-ghost
	z-index: 3

.-drawer
	z-index: 4
</style>
