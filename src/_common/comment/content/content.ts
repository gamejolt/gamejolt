import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import AppContentViewer from '../../content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../fade-collapse/fade-collapse.vue';
import { date } from '../../filters/date';
import AppStickerControlsOverlay from '../../sticker/controls-overlay/controls-overlay.vue';
import AppStickerReactions from '../../sticker/reactions/reactions.vue';
import { StickerTargetController } from '../../sticker/target/target-controller';
import AppStickerTarget from '../../sticker/target/target.vue';
import { Comment } from '../comment-model';
import '../comment.styl';

@Component({
	components: {
		AppFadeCollapse,
		AppContentViewer,
		AppStickerTarget,
		AppStickerReactions,
		AppStickerControlsOverlay,
	},
	filters: {
		date,
	},
})
export default class AppCommentContent extends Vue {
	@Prop(propRequired(Comment)) comment!: Comment;
	@Prop(propOptional(String, '')) content!: string;
	@Prop(propOptional(Boolean, false)) canPlaceStickers!: boolean;

	canToggleContent = false;
	showFullContent = false;
	stickerTargetController = new StickerTargetController(this.comment);

	readonly date = date;
}
