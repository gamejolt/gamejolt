<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Inject, mixins, Options, Prop } from 'vue-property-decorator';
import { Analytics } from '../../analytics/analytics.service';
import AppMessageThreadAdd from '../../message-thread/add/add.vue';
import { BaseModal } from '../../modal/base';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { useCommonStore } from '../../store/common-store';
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

	@Prop(Object)
	model!: Model;

	@Prop(String)
	displayMode!: DisplayMode;

	@Prop(Boolean)
	autofocus?: boolean;

	commonStore = setup(() => useCommonStore());

	@Inject({ from: CommentStoreManagerKey })
	commentManager!: CommentStoreManager;

	get user() {
		return this.commonStore.user;
	}

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
</script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<app-comment-widget
				:model="model"
				:thread-comment-id="commentId"
				:show-tabs="false"
				:show-add="false"
				@remove="onRemove"
				@error="onError"
			/>
		</div>

		<template v-if="shouldShowReply" #footer>
			<div>
				<app-message-thread-add
					v-if="parent"
					hide-message-split
					:class="{ '-thread-editor-focus': isEditorFocused }"
				>
					<form-comment
						:comment-model="model"
						:parent-id="parent.id"
						:placeholder="$gettext(`Leave a reply...`)"
						:autofocus="autofocus"
						@submit="_onCommentAdd"
						@editor-focus="onEditorFocus"
						@editor-blur="onEditorBlur"
					/>
				</app-message-thread-add>
			</div>
		</template>
	</app-modal>
</template>

<style lang="stylus" scoped>
// On mobile, we need to make space for the content editor controls. They
// would overlap the Reply form field otherwise.
@media $media-xs
	::v-deep(.message-thread-add.-thread-editor-focus)
		padding-bottom: 42px
</style>
