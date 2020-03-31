import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../utils/vue';
import { StickerPlacement } from './placement/placement.model';

@Component({})
export default class AppSticker extends Vue {
	@Prop(propRequired(StickerPlacement)) sticker!: StickerPlacement;
	@Prop(propOptional(Boolean, true)) canRemove!: boolean;

	isRemoved = false;

	$refs!: {
		sticker: HTMLDivElement;
	};

	async mounted() {
		this.onUpdateStickerPlacement();
	}

	@Watch('sticker.position_x')
	@Watch('sticker.position_y')
	@Watch('sticker.rotation')
	async onUpdateStickerPlacement() {
		await this.$nextTick();

		this.$refs.sticker.style.left = `calc(${this.sticker.position_x * 100}% - 32px)`;
		this.$refs.sticker.style.top = `calc(${this.sticker.position_y * 100}% - 32px)`;
		this.$refs.sticker.style.transform = `rotate(${this.sticker.rotation * 90 - 45}deg)`;
	}

	onClickRemove() {
		if (this.canRemove) {
			this.isRemoved = true;
		}
	}
}
