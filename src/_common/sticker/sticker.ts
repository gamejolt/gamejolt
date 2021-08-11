import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../utils/vue';
import { StickerPlacement } from './placement/placement.model';

@Component({})
export default class AppSticker extends Vue {
	@Prop(propRequired(StickerPlacement)) sticker!: StickerPlacement;
	@Prop(propOptional(Boolean, true)) isClickable!: boolean;

	declare $refs: {
		outer: HTMLDivElement;
		inner: HTMLImageElement;
	};

	@Emit('click')
	emitClick() {}

	mounted() {
		this.onUpdateStickerPlacement();
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
