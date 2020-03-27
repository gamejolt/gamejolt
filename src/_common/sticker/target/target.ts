import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { StickerPlacement } from '../placement/placement.model';
import AppSticker from '../sticker.vue';

export function getStickerTargetId(resource: string, resourceId: number) {
	return 'sticker-target-' + resource + '-' + resourceId.toString();
}

@Component({
	components: {
		AppSticker,
	},
})
export default class AppStickerTarget extends Vue {
	@Prop(propRequired(Array)) stickers!: StickerPlacement[];
	@Prop(propRequired(String)) resource!: string;
	@Prop(propRequired(Number)) resourceId!: number;

	get divId() {
		return getStickerTargetId(this.resource, this.resourceId);
	}
}
