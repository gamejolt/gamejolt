import { Analytics } from '../../../../_common/analytics/analytics.service';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { Clipboard } from '../../../../_common/clipboard/clipboard-service';
import FormComment from '../../../../_common/comment/add/add.vue';
import {
	CommentAction,
	CommentMutation,
	CommentState,
	CommentStore,
	CommentStoreModel,
} from '../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../_common/comment/modal/modal.service';
import AppCommentVideoLikeWidget from '../../../../_common/comment/video/like-widget/like-widget.vue';
import { CommentVideo } from '../../../../_common/comment/video/video-model';
import { Environment } from '../../../../_common/environment/environment.service';
import AppFiresidePostLikeWidget from '../../../../_common/fireside/post/like/widget/widget.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppSocialFacebookLike } from '../../../../_common/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../_common/social/twitter/share/share';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import { number } from '../../../../_common/filters/number';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { AppCommentWidgetLazy } from '../../lazy';
import AppEventItemControlsCommentAddPlaceholder from './comment-add-placeholder/placeholder.vue';

@Component({
	components: {
		AppPopper,
		AppCommentWidget: AppCommentWidgetLazy,
		AppFiresidePostLikeWidget,
		AppCommentVideoLikeWidget,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		FormComment,
		AppEventItemControlsCommentAddPlaceholder,
	},
	directives: {
		AppTooltip,
		AppAuthRequired,
	},
	filters: {
		number,
	},
})
export default class AppEventItemControls extends Vue {
	@Prop(FiresidePost)
	post?: FiresidePost;

	@Prop(Boolean)
	showUserFollow?: boolean;

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
	clickedComment = false;
	clickedCommentType = '';

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

		return Environment.baseUrl + this.$router.resolve(this.post.routeLocation).href;
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
			CommentModal.show({
				resource: 'Fireside_Post',
				resourceId: this.post.id,
				displayMode: 'comments',
			});
		}

		this.emitExpand();
	}

	copyShareUrl() {
		Clipboard.copy(this.shareUrl);
	}

	onClickCommentAddPlaceholder(type: string) {
		Analytics.trackEvent('inline-comment-form', 'click', type);
		this.clickedCommentType = type;
		this.clickedComment = true;
	}

	onSubmitNewComment() {
		this.clickedComment = false; // Unloading the editor after submitting
		this.openComments();
	}
}
