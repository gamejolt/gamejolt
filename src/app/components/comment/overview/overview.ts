import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import {
	Comment,
	getCommentBlockReason,
	getCommentModelResourceName,
} from '../../../../_common/comment/comment-model';
import {
	CommentState,
	CommentStore,
	CommentStoreModel,
} from '../../../../_common/comment/comment-store';
import { DisplayMode } from '../../../../_common/comment/modal/modal.service';
import { CommentThreadModal } from '../../../../_common/comment/thread/modal.service';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import { Model } from '../../../../_common/model/model.service';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';

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

	@Prop(Model)
	model!: Model;

	@Prop(String)
	displayMode!: DisplayMode;

	@CommentState
	getCommentStore!: CommentStore['getCommentStore'];

	get displayComments() {
		return this.comments.filter(c => getCommentBlockReason(c) === false);
	}

	get commentStoreDirtyState() {
		const store = this.getCommentStore(getCommentModelResourceName(this.model), this.model.id);
		if (store instanceof CommentStoreModel) {
			return store.overviewNeedsRefresh;
		}
		return false;
	}

	@Watch('commentStoreDirtyState')
	reloadComments() {
		if (this.commentStoreDirtyState) {
			const store = this.getCommentStore(
				getCommentModelResourceName(this.model),
				this.model.id
			);
			if (store instanceof CommentStoreModel) {
				store.overviewNeedsRefresh = false;
			}

			this.$emit('reload-comments');
		}
	}

	open(comment: Comment) {
		CommentThreadModal.show({
			model: this.model,
			commentId: comment.id,
			displayMode: this.displayMode,
		});
	}
}
