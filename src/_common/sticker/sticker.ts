import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../utils/vue';
import { StickerPlacement } from './placement/placement.model';
import { removeStickerFromTarget, StickerTargetController } from './target/target-controller';

@Component({})
export default class AppSticker extends Vue {
	@Prop(propRequired(StickerPlacement)) sticker!: StickerPlacement;
	@Prop(propOptional(StickerTargetController, null)) controller!: StickerTargetController | null;
	@Prop(propOptional(Boolean, true)) isClickable!: boolean;

	$refs!: {
		outer: HTMLDivElement;
		live: HTMLDivElement;
		inner: HTMLImageElement;
	};

	@Emit('click')
	emitClick() {}

	get isLive() {
		return this.controller?.isLive == true;
	}

	mounted() {
		this.onUpdateStickerPlacement();
		if (this.isLive) {
			// Don't attach to the outer ref, since it may have an animation attached by its parent.
			this.$refs.live.addEventListener(
				'animationend',
				_ => {
					if (this.controller) {
						removeStickerFromTarget(this.controller, this.sticker);
					}
				},
				true
			);
		}
	}

	@Watch('sticker.position_x')
	@Watch('sticker.position_y')
	@Watch('sticker.rotation')
	async onUpdateStickerPlacement() {
		await this.$nextTick();

		this.$refs.outer.style.left = `calc(${this.sticker.position_x * 100}% - 32px)`;
		this.$refs.outer.style.top = `calc(${this.sticker.position_y * 100}% - 32px)`;
		// Transform the inner element so the parent component can assign
		// translateY() while transitioning in
		this.$refs.inner.style.transform = `rotate(${this.sticker.rotation * 90 - 45}deg)`;
	}

	onClickRemove() {
		if (this.isClickable) {
			this.emitClick();
		}
	}
}
