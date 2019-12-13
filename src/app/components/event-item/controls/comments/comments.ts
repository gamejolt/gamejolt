import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Analytics } from '../../../../../_common/analytics/analytics.service';
import { AppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import FormComment from '../../../../../_common/comment/add/add.vue';
import {
	CommentAction,
	CommentMutation,
	CommentStore,
	CommentStoreModel,
} from '../../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../../_common/comment/modal/modal.service';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Model } from '../../../../../_common/model/model.service';
import { AppCommentWidgetLazy } from '../../../lazy';
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
	@Prop(Model)
	model!: Model;

	@Prop(Boolean)
	showFeed?: boolean;

	@CommentAction
	lockCommentStore!: CommentStore['lockCommentStore'];

	@CommentMutation
	releaseCommentStore!: CommentStore['releaseCommentStore'];

	@CommentMutation
	setCommentCount!: CommentStore['setCommentCount'];

	commentStore: CommentStoreModel | null = null;
	clickedComment = false;
	clickedCommentType = '';

	get commentsCount() {
		return this.commentStore ? this.commentStore.count : 0;
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
		if (this.showFeed) {
			return false;
		}

		if (this.model instanceof FiresidePost && this.model.communities.length > 0) {
			const community = this.model.communities[0].community;
			return !community.isBlocked;
		}

		return true;
	}

	async created() {
		this.commentStore = await this.lockCommentStore({
			resource: this.resource,
			resourceId: this.resourceId,
		});

		// Bootstrap it with the post comment count since that's all we have.
		this.setCommentCount({ store: this.commentStore, count: this.resourceCommentCount });
	}

	destroyed() {
		if (this.commentStore) {
			this.releaseCommentStore(this.commentStore);
			this.commentStore = null;
		}
	}

	@Watch('commentsCount', { immediate: true })
	onCommentsCountChanged(newCount: number) {
		this.$emit('count', newCount);
	}

	openComments() {
		CommentModal.show({
			resource: this.resource,
			resourceId: this.resourceId,
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
