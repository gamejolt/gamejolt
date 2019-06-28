import { Comment } from 'game-jolt-frontend-lib/components/comment/comment-model';
import {
	CommentState,
	CommentStore,
	CommentStoreModel,
} from 'game-jolt-frontend-lib/components/comment/comment-store';
import { DisplayMode } from 'game-jolt-frontend-lib/components/comment/modal/modal.service';
import { CommentThreadModal } from 'game-jolt-frontend-lib/components/comment/thread/modal.service';
import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import AppUserCardHover from 'game-jolt-frontend-lib/components/user/card/hover/hover.vue';
import AppUserAvatarImg from 'game-jolt-frontend-lib/components/user/user-avatar/img/img.vue';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
	components: {
		AppFadeCollapse,
		AppUserAvatarImg,
		AppUserCardHover,
		AppContentViewer,
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
