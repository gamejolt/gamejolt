<script lang="ts">
import { toRaw } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppStickerTarget from '../target/target.vue';
import {
	getRectForStickerTarget,
	StickerLayerController,
	StickerLayerTargetRect,
} from './layer-controller';

// How much extra padding (in px) should we put around each target for the
// cutout that we make?
const TargetVPadding = 4;
const TargetHPadding = 8;

export function getStickerLayerTargetBoundingBox(rect: StickerLayerTargetRect) {
	const { x, y, width, height } = rect;
	return {
		x: x - TargetHPadding,
		y: y - TargetVPadding,
		width: width + TargetHPadding * 2,
		height: height + TargetVPadding * 2,
	};
}

@Options({})
export default class AppStickerLayerPlacementMaskTarget extends Vue {
	@Prop({ type: Object, required: true }) target!: AppStickerTarget;
	@Prop({ type: Object, required: true }) layer!: StickerLayerController;

	x = 0;
	y = 0;
	width = 0;
	height = 0;

	get styles() {
		return {
			transform: `translate(${this.x}px, ${this.y}px)`,
			width: this.width + 'px',
			height: this.height + 'px',
		};
	}

	get isHovered() {
		return toRaw(this.layer.hoveredTarget.value) === toRaw(this.target);
	}

	mounted() {
		const rect = getRectForStickerTarget(this.layer, this.target);
		if (!rect) {
			return;
		}

		const { x, y, width, height } = getStickerLayerTargetBoundingBox(rect);
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
}
</script>

<template>
	<div class="-target" :class="{ '-hovered': isHovered }" :style="styles" />
</template>

<style lang="stylus" scoped>
.-target
	rounded-corners-lg()
	position: absolute
	top: 0
	left: 0
	border-width: $border-width-large
	border-color: var(--theme-link-hover)
	border-style: dashed
	background-color: transparent

.-hovered
	border-color: var(--theme-link)
	border-style: solid
</style>
