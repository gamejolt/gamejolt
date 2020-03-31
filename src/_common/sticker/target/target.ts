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
}
