import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import { AppObserveDimensions } from '../../observe-dimensions/observe-dimensions.directive';
import { StickerLayerController, StickerLayerKey } from './layer-controller';
import AppStickerLayerPlacementMaskItem from './placement-mask-item.vue';

@Component({
	components: {
		AppStickerLayerPlacementMaskItem,
	},
	directives: {
		AppObserveDimensions,
	},
})
export default class AppStickerLayerPlacementMask extends Vue {
	@Inject(StickerLayerKey) layer!: StickerLayerController;

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
		this.width = width;
		this.height = height;
	}
}
