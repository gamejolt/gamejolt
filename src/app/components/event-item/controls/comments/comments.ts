import Vue from 'vue';
import { Component, Inject, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { Analytics } from '../../../../../_common/analytics/analytics.service';
import { AppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import FormComment from '../../../../../_common/comment/add/add.vue';
import { Comment } from '../../../../../_common/comment/comment-model';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	CommentStoreModel,
	lockCommentStore,
	releaseCommentStore,
	setCommentCount,
} from '../../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../../_common/comment/modal/modal.service';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Model } from '../../../../../_common/model/model.service';
import { AppCommentWidgetLazy } from '../../../lazy';
import { hasInlineCommentsSplitTest } from '../../../split-test/split-test-service';
import AppEventItemControlsCommentsAddPlaceholder from './add-placeholder/add-placeholder.vue';

@Component({
	components: {
		FormComment,
		AppEventItemControlsCommentsAddPlaceholder,
		AppCommentWidget: AppCommentWidgetLazy,
	},
	directives: {
		AppAuthRequired,
	},
})
export default class AppEventItemControlsComments extends Vue {
	@Inject(CommentStoreManagerKey) commentManager!: CommentStoreManager;

	@Prop(propRequired(Model)) model!: Model;
	@Prop(propOptional(Boolean, false)) showFeed!: boolean;
	@Prop(propRequired(String)) eventLabel!: string;

	commentStore: CommentStoreModel | null = null;
	clickedComment = false;
	clickedCommentType = '';

	get commentsCount() {
		return this.commentStore ? this.commentStore.totalCount : 0;
	}

	get resource() {
		if (this.model instanceof FiresidePost) {
			return 'Fireside_Post';
		}

		throw new Error('Unexpected model type for app-event-item-control-comments');
	}

	get resourceId() {
		if (this.model instanceof FiresidePost) {
			return this.model.id;
		}

		throw new Error('Unexpected model type for app-event-item-control-comments');
	}

	get resourceCommentCount() {
		if (this.model instanceof FiresidePost) {
			return this.model.comment_count;
		}

		throw new Error('Unexpected model type for app-event-item-control-comments');
	}

	get shouldShowInlineComment() {
		if (!hasInlineCommentsSplitTest()) {
			return false;
		}
		if (this.model instanceof FiresidePost && !this.model.canComment) {
			return false;
		}
		return !this.showFeed;
	}

	created() {
		this.commentStore = lockCommentStore(this.commentManager, this.resource, this.resourceId);

		// Bootstrap it with the post comment count since that's all we have.
		setCommentCount(this.commentStore, this.resourceCommentCount);
	}

	destroyed() {
		if (this.commentStore) {
			releaseCommentStore(this.commentManager, this.commentStore);
			this.commentStore = null;
		}
	}

	@Watch('commentsCount', { immediate: true })
	onCommentsCountChanged(newCount: number) {
		this.$emit('count', newCount);
	}

	openComments() {
		CommentModal.show({
			model: this.model,
			displayMode: 'comments',
			initialTab: Comment.SORT_YOU,
		});
	}

	onClickCommentAddPlaceholder(type: string) {
		Analytics.trackEvent('post-controls', `comment-${type ?? 'focus'}`, this.eventLabel);
		this.clickedCommentType = type;
		this.clickedComment = true;
	}

	onSubmitNewComment() {
		Analytics.trackEvent('post-controls', 'comment-add', this.eventLabel);
		this.clickedComment = false; // Unloading the editor after submitting
		this.openComments();
	}
}
