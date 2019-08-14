import { Component, Prop } from 'vue-property-decorator';
import { CommentState, CommentStore } from '../../../components/comment/comment-store';
import { BaseModal } from '../../../components/modal/base';
import { Screen } from '../../../components/screen/screen-service';
import { AppState, AppStore } from '../../../vue/services/app/app-store';
import { Analytics } from '../../analytics/analytics.service';
import AppMessageThreadAdd from '../../message-thread/add/add.vue';
import FormComment from '../add/add.vue';
import { Comment } from '../comment-model';
import { CommentMutation } from '../comment-store';
import { DisplayMode } from '../modal/modal.service';
import AppCommentWidget from '../widget/widget.vue';

@Component({
	components: {
		AppCommentWidget,
		FormComment,
		AppMessageThreadAdd,
	},
})
export default class AppCommentThreadModal extends BaseModal {
	@Prop(Number)
	commentId!: number;

	@Prop(String)
	resource!: string;

	@Prop(Number)
	resourceId!: number;

	@Prop(String)
	displayMode!: DisplayMode;

	@Prop(Boolean)
	autofocus?: boolean;

	@AppState
	user!: AppStore['user'];

	@CommentState
	getCommentStore!: CommentStore['getCommentStore'];

	@CommentMutation
	onCommentAdd!: CommentStore['onCommentAdd'];

	hasError = false;
	isEditorFocused = false;

	readonly Screen = Screen;

	get parent() {
		const store = this.getCommentStore(this.resource, this.resourceId);
		if (store) {
			const comment = store.comments.find(c => c.id === this.commentId);
			if (comment && comment.parent_id) {
				const parent = store.comments.find(c => c.id === comment.parent_id);
				return parent;
			}
			return comment;
		}
	}

	get username() {
		const store = this.getCommentStore(this.resource, this.resourceId);
		if (store) {
			const comment = store.comments.find(c => c.id === this.commentId);
			if (comment) {
				return comment.user.username;
			}
		}
	}

	get displayModeTitle() {
		switch (this.displayMode) {
			case 'comments':
				return this.$gettext('Comment');
			case 'shouts':
				return this.$gettext('Shout');
		}
		return '';
	}

	_onCommentAdd(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'add');
		this.onCommentAdd(comment);
		this.$emit('add', comment);
	}

	onRemove(_comment: Comment) {
		// If the parent comment of the thread got removed, close this modal
		if (!this.parent) {
			this.modal.dismiss();
		}
	}

	onError(_e: Error) {
		this.hasError = true;
	}

	onEditorFocus() {
		this.isEditorFocused = true;
	}

	onEditorBlur() {
		this.isEditorFocused = false;
	}
}
