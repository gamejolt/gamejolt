import { Clipboard } from 'game-jolt-frontend-lib/components/clipboard/clipboard-service';
import FormComment from 'game-jolt-frontend-lib/components/comment/add/add.vue';
import {
	CommentAction,
	CommentMutation,
	CommentState,
	CommentStore,
	CommentStoreModel,
} from 'game-jolt-frontend-lib/components/comment/comment-store';
import { CommentModal } from 'game-jolt-frontend-lib/components/comment/modal/modal.service';
import AppCommentVideoLikeWidget from 'game-jolt-frontend-lib/components/comment/video/like-widget/like-widget.vue';
import { CommentVideo } from 'game-jolt-frontend-lib/components/comment/video/video-model';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import AppFiresidePostLikeWidget from 'game-jolt-frontend-lib/components/fireside/post/like/widget/widget.vue';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppSocialFacebookLike } from 'game-jolt-frontend-lib/components/social/facebook/like/like';
import { AppSocialTwitterShare } from 'game-jolt-frontend-lib/components/social/twitter/share/share';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { AppCommentWidgetLazy } from '../../lazy';
import AppEventItemControlsCommentAddPlaceholder from './comment-add-placeholder/placeholder/placeholder.vue';

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
	openGifModal = false;

	readonly FiresidePost = FiresidePost;
	readonly Screen = Screen;

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

	openComments(autofocus = false) {
		if (this.post) {
			CommentModal.show({
				resource: 'Fireside_Post',
				resourceId: this.post.id,
				displayMode: 'comments',
				autofocus,
			});
		}

		this.emitExpand();
	}

	copyShareUrl() {
		Clipboard.copy(this.shareUrl);
	}

	onClickCommentAddPlaceholder(type: string) {
		// On mobile there won't be enough space to fit the editing controls inline
		if (Screen.isXs) {
			this.openComments(true);
		} else {
			this.clickedComment = true;
			if (type === 'gif') {
				this.openGifModal = true;
			}
		}
	}

	onSubmitNewComment() {
		this.clickedComment = false; // Unloading the editor after submitting
		this.openComments();
	}
}
