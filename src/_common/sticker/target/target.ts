import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { StickerPlacement } from '../placement/placement.model';
import AppSticker from '../sticker.vue';

@Component({
	components: {
		AppSticker,
	},
})
export default class AppStickerTarget extends Vue {
	@Prop(propRequired(Array)) stickers!: StickerPlacement[];
	@Prop(propOptional(Boolean, false)) showStickers!: boolean;
	@Prop(propOptional(Boolean, false)) noAnimateIn!: boolean;

	hiddenStickers = 0;

	// Sort so that the newer stickers go on top of the older ones.
	get sorted() {
		return [...this.stickers].sort((a, b) => a.id - b.id);
	}

	@Emit('hide-all')
	emitHideAll() {}

	getStickerAnimationDelay(placement: StickerPlacement) {
		return this.sorted.indexOf(placement) * 0.05 + 's';
	}

	onStickerRemoved() {
		this.hiddenStickers++;
		if (this.hiddenStickers === this.stickers.length) {
			this.hiddenStickers = 0;
			this.emitHideAll();
		}
	}
}
