import View from '!view!./controls.html';
import { Clipboard } from 'game-jolt-frontend-lib/components/clipboard/clipboard-service';
import {
	CommentAction,
	CommentMutation,
	CommentState,
	CommentStore,
	CommentStoreModel,
} from 'game-jolt-frontend-lib/components/comment/comment-store';
import { CommentModal } from 'game-jolt-frontend-lib/components/comment/modal/modal.service';
import { AppCommentVideoLikeWidget } from 'game-jolt-frontend-lib/components/comment/video/like-widget/like-widget';
import { CommentVideo } from 'game-jolt-frontend-lib/components/comment/video/video-model';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { AppFiresidePostLikeWidget } from 'game-jolt-frontend-lib/components/fireside/post/like/widget/widget';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppPopper } from 'game-jolt-frontend-lib/components/popper/popper';
import { AppSocialFacebookLike } from 'game-jolt-frontend-lib/components/social/facebook/like/like';
import { AppSocialTwitterShare } from 'game-jolt-frontend-lib/components/social/twitter/share/share';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { AppCommentWidgetLazy } from '../../lazy';

@View
@Component({
	components: {
		AppPopper,
		AppCommentWidget: AppCommentWidgetLazy,
		AppFiresidePostLikeWidget,
		AppCommentVideoLikeWidget,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppEventItemControls extends Vue {
	@Prop(FiresidePost)
	post?: FiresidePost;

	@Prop(CommentVideo)
	video?: CommentVideo;

	@Prop(Boolean)
	showComments?: boolean;

	@CommentState
	getCommentStore!: CommentStore['getCommentStore'];

	@CommentAction
	lockCommentStore!: CommentStore['lockCommentStore'];

	@CommentMutation
	releaseCommentStore!: CommentStore['releaseCommentStore'];

	@CommentMutation
	setCommentCount!: CommentStore['setCommentCount'];

	commentStore: CommentStoreModel | null = null;
	isShowingShare = false;

	readonly FiresidePost = FiresidePost;

	@Emit('comment')
	emitComments() {}

	@Emit('expand')
	emitExpand() {}

	get sharePopoverId() {
		if (!this.post) {
			return '';
		}
		return `activity-feed-share-${this.post.id}`;
	}

	get shareUrl() {
		if (!this.post) {
			return '';
		}

		return (
			Environment.baseUrl +
			this.$router.resolve({
				name: 'discover.games.view.devlog.view',
				params: {
					slug: this.post.game.slug,
					id: this.post.game.id + '',
					postSlug: this.post.slug,
				},
			}).href
		);
	}

	get commentsCount() {
		return this.commentStore ? this.commentStore.count : 0;
	}

	async created() {
		if (this.post) {
			this.commentStore = await this.lockCommentStore({
				resource: 'Fireside_Post',
				resourceId: this.post.id,
			});

			// Bootstrap it with the post comment count since that's all we have.
			this.setCommentCount({ store: this.commentStore, count: this.post.comment_count });
		}
	}

	destroyed() {
		if (this.commentStore) {
			this.releaseCommentStore(this.commentStore);
			this.commentStore = null;
		}
	}

	onCommentAdded() {
		this.emitExpand();
	}

	openComments() {
		if (this.post) {
			CommentModal.show({ resource: 'Fireside_Post', resourceId: this.post.id });
		}

		this.emitExpand();
	}

	copyShareUrl() {
		Clipboard.copy(this.shareUrl);
	}
}
