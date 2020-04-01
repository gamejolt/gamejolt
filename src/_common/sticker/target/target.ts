import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
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

	// Sort so that the newer stickers go on top of the older ones.
	get sorted() {
		return [...this.stickers].sort((a, b) => a.id - b.id);
	}

	getStickerAnimationDelay(placement: StickerPlacement) {
		return this.sorted.indexOf(placement) * 0.05 + 's';
	}
}
