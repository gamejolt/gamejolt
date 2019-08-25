import { Comment } from '../../../../_common/comment/comment-model';
import {
	CommentState,
	CommentStore,
	CommentStoreModel,
} from '../../../../_common/comment/comment-store';
import { DisplayMode } from '../../../../_common/comment/modal/modal.service';
import { CommentThreadModal } from '../../../../_common/comment/thread/modal.service';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
	components: {
		AppFadeCollapse,
		AppUserAvatarImg,
		AppUserCardHover,
		AppContentViewer,
		AppUserVerifiedTick,
	},
})
export default class AppCommentOverview extends Vue {
	@Prop(Array)
	comments!: Comment[];

	@Prop(String)
	resource!: string;

	@Prop(Number)
	resourceId!: number;

	@Prop(String)
	displayMode!: DisplayMode;

	@CommentState
	getCommentStore!: CommentStore['getCommentStore'];

	get commentStoreDirtyState() {
		const store = this.getCommentStore(this.resource, this.resourceId);
		if (store instanceof CommentStoreModel) {
			return store.overviewNeedsRefresh;
		}
		return false;
	}

	@Watch('commentStoreDirtyState')
	reloadComments() {
		if (this.commentStoreDirtyState) {
			const store = this.getCommentStore(this.resource, this.resourceId);
			if (store instanceof CommentStoreModel) {
				store.overviewNeedsRefresh = false;
			}

			this.$emit('reload-comments');
		}
	}

	open(comment: Comment) {
		CommentThreadModal.show({
			resource: this.resource,
			resourceId: this.resourceId,
			commentId: comment.id,
			displayMode: this.displayMode,
		});
	}
}
