import { Component, Emit, Prop } from 'vue-property-decorator';
import { ContentContext } from '../../content/content-context';
import AppFormControlContent from '../../form-vue/control/content/content.vue';
import AppForm from '../../form-vue/form';
import { BaseForm, FormOnInit } from '../../form-vue/form.service';
import { Model } from '../../model/model.service';
import { Comment, getCommentModelResourceName } from '../comment-model';
import '../comment.styl';

@Component({
	components: {
		AppFormControlContent,
	},
})
export default class FormComment extends BaseForm<Comment> implements FormOnInit {
	@Prop(Model)
	commentModel!: Model;

	@Prop(Number)
	parentId?: number;

	@Prop(Boolean)
	autofocus?: boolean;

	@Prop(String)
	placeholder?: string;

	@Prop(String)
	maxHeight?: string;

	@Prop(String)
	editorStartupActivity?: string;

	$refs!: {
		form: AppForm;
	};

	modelClass = Comment;
	resetOnSubmit = true;

	get contentContext(): ContentContext {
		switch (getCommentModelResourceName(this.commentModel)) {
			case 'Fireside_Post':
				return 'fireside-post-comment';
			case 'Game':
				return 'game-comment';
			case 'User':
				return 'user-comment';
		}
	}

	async onInit() {
		if (!this.model) {
			this.setField('comment_content', '');
			this.setField('resource', getCommentModelResourceName(this.commentModel));
			this.setField('resource_id', this.commentModel.id);

			if (this.parentId) {
				this.setField('parent_id', this.parentId);
			}

			// Wait for errors, then clear them.
			await this.$nextTick();
			this.$refs.form.clearErrors();
		}
	}

	@Emit('editor-focus')
	onFocusEditor() {}

	@Emit('editor-blur')
	onBlurEditor() {}

	onCancel() {
		this.$emit('cancel');
	}
}
