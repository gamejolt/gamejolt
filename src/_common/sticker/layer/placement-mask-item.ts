import { Options, Prop, Vue } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import AppStickerTarget from '../target/target';
import { getRectForStickerTarget, StickerLayerController } from './layer-controller';
import { getStickerLayerTargetBoundingBox } from './placement-mask-target';

@Options({})
export default class AppStickerLayerPlacementMaskItem extends Vue {
	@Prop(propRequired()) target!: AppStickerTarget;
	@Prop(propRequired(StickerLayerController)) layer!: StickerLayerController;

	x = 0;
	y = 0;
	width = 0;
	height = 0;

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
