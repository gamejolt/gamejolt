import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../utils/vue';
import { StickerPlacement } from './placement/placement.model';

@Component({})
export default class AppSticker extends Vue {
	@Prop(propRequired(StickerPlacement)) sticker!: StickerPlacement;

	$refs!: {
		sticker: HTMLDivElement;
	};

	mounted() {
		this.$refs.sticker.style.left = this.sticker.position_x * 100 + '%';
		this.$refs.sticker.style.top = this.sticker.position_y * 100 + '%';
		this.$refs.sticker.style.transform = `rotate(${this.sticker.rotation * 90 - 45}deg)`;
	}
}
