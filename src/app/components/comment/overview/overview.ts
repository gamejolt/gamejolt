import View from '!view!./overview.html?style=./overview.styl';
import { AppUserCardHover } from 'game-jolt-frontend-lib/components/user/card/hover/hover';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Comment } from '../../../../lib/gj-lib-client/components/comment/comment-model';
import {
	CommentState,
	CommentStore,
	CommentStoreModel,
} from '../../../../lib/gj-lib-client/components/comment/comment-store';
import { DisplayMode } from '../../../../lib/gj-lib-client/components/comment/modal/modal.service';
import { CommentThreadModal } from '../../../../lib/gj-lib-client/components/comment/thread/modal.service';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';

@View
@Component({
	components: {
		AppFadeCollapse,
		AppUserAvatarImg,
		AppUserCardHover,
	},
})
export class AppCommentOverview extends Vue {
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
