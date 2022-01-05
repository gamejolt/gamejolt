import { Emit, Inject, mixins, Options, Prop } from 'vue-property-decorator';
import { Analytics } from '../../analytics/analytics.service';
import AppMessageThreadAdd from '../../message-thread/add/add.vue';
import { BaseModal } from '../../modal/base';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { AppState, AppStore } from '../../store/app-store';
import FormComment from '../add/add.vue';
import { canCommentOnModel, Comment, getCommentModelResourceName } from '../comment-model';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	getCommentStore,
	onCommentAdd,
} from '../comment-store';
import { DisplayMode } from '../modal/modal.service';
import AppCommentWidget from '../widget/widget.vue';

@Options({
	components: {
		AppCommentWidget,
		FormComment,
		AppMessageThreadAdd,
	},
})
export default class AppCommentThreadModal extends mixins(BaseModal) {
	@Prop(Number)
	commentId!: number;

	@Prop(Model)
	model!: Model;

	@Prop(String)
	displayMode!: DisplayMode;

	@Prop(Boolean)
	autofocus?: boolean;

	@Inject({ from: CommentStoreManagerKey })
	commentManager!: CommentStoreManager;

	@AppState
	user!: AppStore['user'];

	hasError = false;
	isEditorFocused = false;

	readonly Screen = Screen;

	@Emit('add')
	emitAdd(_comment: Comment) {}

	get parent() {
		const store = getCommentStore(
			this.commentManager,
			getCommentModelResourceName(this.model),
			this.model.id
		);
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
		const store = getCommentStore(
			this.commentManager,
			getCommentModelResourceName(this.model),
			this.model.id
		);
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

	get shouldShowReply() {
		if (!canCommentOnModel(this.model, this.parent)) {
			return false;
		}

		return this.user && !this.hasError;
	}

	unmounted() {
		// If there was a permalink in the URL, we want to remove it when closing the comment modal.
		const hash = this.$route.hash;
		if (!hash || hash.indexOf('#comment-') !== 0) {
			return;
		}

		this.$router.replace({ ...this.$route, hash: '' });
	}

	_onCommentAdd(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'add');
		onCommentAdd(this.commentManager, comment);
		this.emitAdd(comment);
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
