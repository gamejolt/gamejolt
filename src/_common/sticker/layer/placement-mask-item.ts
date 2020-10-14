import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import AppStickerTarget from '../target/target';
import { getRectForStickerTarget, StickerLayerController } from './layer-controller';

// How much extra padding (in px) should we put around each target for the
// cutout that we make?
const TargetVPadding = 4;
const TargetHPadding = 8;

@Component({})
export default class AppStickerLayerPlacementMaskItem extends Vue {
	@Prop(propRequired()) target!: AppStickerTarget;
	@Prop(propRequired(StickerLayerController)) layer!: StickerLayerController;
	@Prop(propOptional(Boolean, false)) asMask!: boolean;

	x = 0;
	y = 0;
	width = 0;
	height = 0;

	get classes() {
		return this.asMask
			? ['-mask']
			: ['-rect', this.layer.hoveredTarget === this.target && '-rect-hovered'];
	}

	created() {
		const rect = getRectForStickerTarget(this.layer, this.target);
		if (!rect) {
			if (GJ_BUILD_TYPE === 'development') {
				console.error(`Couldn't find rect for target!`, this.target);
			}
			return;
		}

		const { x, y, width, height } = rect;
		this.x = x - TargetHPadding;
		this.y = y - TargetVPadding;
		this.width = width + TargetHPadding * 2;
		this.height = height + TargetVPadding * 2;
	}
}
