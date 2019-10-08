import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Analytics } from '../../../../../_common/analytics/analytics.service';
import { AppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import { Clipboard } from '../../../../../_common/clipboard/clipboard-service';
import FormComment from '../../../../../_common/comment/add/add.vue';
import {
	CommentAction,
	CommentMutation,
	CommentStore,
	CommentStoreModel,
} from '../../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../../_common/comment/modal/modal.service';
import AppCommentVideoLikeWidget from '../../../../../_common/comment/video/like-widget/like-widget.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import { number } from '../../../../../_common/filters/number';
import AppFiresidePostLikeWidget from '../../../../../_common/fireside/post/like/widget/widget.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { AppSocialFacebookLike } from '../../../../../_common/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../../_common/social/twitter/share/share';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';
import { AppCommentWidgetLazy } from '../../../lazy';
import AppEventItemControlsCommentAddPlaceholder from '../comment-add-placeholder/placeholder.vue';

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
export default class AppEventItemControlsFiresidePost extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Boolean)
	showUserFollow?: boolean;

	@Prop(Boolean)
	showComments?: boolean;

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

	get shareUrl() {
		return Environment.baseUrl + this.$router.resolve(this.post.routeLocation).href;
	}

	get commentsCount() {
		return this.commentStore ? this.commentStore.count : 0;
	}

	async created() {
		this.commentStore = await this.lockCommentStore({
			resource: 'Fireside_Post',
			resourceId: this.post.id,
		});

		// Bootstrap it with the post comment count since that's all we have.
		this.setCommentCount({ store: this.commentStore, count: this.post.comment_count });
	}

	destroyed() {
		if (this.commentStore) {
			this.releaseCommentStore(this.commentStore);
			this.commentStore = null;
		}
	}

	copyShareUrl() {
		Clipboard.copy(this.shareUrl);
	}

	openComments() {
		CommentModal.show({
			resource: 'Fireside_Post',
			resourceId: this.post.id,
			displayMode: 'comments',
		});
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
