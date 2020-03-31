import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { StickerPlacement } from '../placement/placement.model';
import AppSticker from '../sticker.vue';

@Component({
	components: {
		AppSticker,
	},
})
export default class AppStickerTarget extends Vue {
	@Prop(propRequired(Array)) stickers!: StickerPlacement[];
	@Prop(propRequired(String)) resource!: string;
	@Prop(propRequired(Number)) resourceId!: number;

	// Sort so that the newer stickers go on top of the older ones.
	get sorted() {
		return this.stickers.sort((a, b) => a.id - b.id);
	}
}
