import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../utils/vue';
import { StickerPlacement } from './placement/placement.model';

@Component({})
export default class AppSticker extends Vue {
	@Prop(propRequired(StickerPlacement)) sticker!: StickerPlacement;
	@Prop(propOptional(Boolean, true)) canRemove!: boolean;

	$refs!: {
		outer: HTMLDivElement;
		inner: HTMLImageElement;
	};

	@Emit('remove-all')
	emitRemoveAll() {}

	mounted() {
		this.onUpdateStickerPlacement();
	}

	@Watch('sticker.position_x')
	@Watch('sticker.position_y')
	@Watch('sticker.rotation')
	async onUpdateStickerPlacement() {
		await this.$nextTick();

		this.$refs.outer.style.left = `calc(${5 + this.sticker.position_x * 90}% - 32px)`;
		this.$refs.outer.style.top = `calc(${5 + this.sticker.position_y * 90}% - 32px)`;
		// Transform the inner element so the parent component can assign translateY() while transitioning in
		this.$refs.inner.style.transform = `rotate(${this.sticker.rotation * 90 - 45}deg)`;
	}

	onClickRemove() {
		if (this.canRemove) {
			this.emitRemoveAll();
		}
	}
}
