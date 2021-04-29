import { Component, Emit, Prop } from 'vue-property-decorator';
import { ContentContext } from '../../content/content-context';
import { ContentRules } from '../../content/content-editor/content-rules';
import AppFormControlContent from '../../form-vue/control/content/content.vue';
import AppForm from '../../form-vue/form';
import { BaseForm, FormOnInit, FormOnLoad } from '../../form-vue/form.service';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { Comment, getCommentModelResourceName } from '../comment-model';
import '../comment.styl';

@Component({
	components: {
		AppFormControlContent,
	},
})
export default class FormComment extends BaseForm<Comment> implements FormOnInit, FormOnLoad {
	@Prop(Model)
	commentModel!: Model;

	@Prop(Number)
	parentId?: number;

	@Prop(Boolean)
	autofocus?: boolean;

	@Prop(String)
	placeholder?: string;

	$refs!: {
		form: AppForm;
	};

	modelClass = Comment;
	resetOnSubmit = true;
	lengthLimit = 5_000;

	get loadUrl() {
		return `/comments/save`;
	}

	get displayRules() {
		if (Screen.isMobile) {
			return new ContentRules({ maxMediaWidth: 200, maxMediaHeight: 200 });
		}

		return new ContentRules({ maxMediaWidth: 300, maxMediaHeight: 300 });
	}

	get maxHeight() {
		if (Screen.isMobile) {
			return 250;
		}

		return 400;
	}

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

	get shouldShowGuidelines() {
		return !this.formModel.comment_content && !this.changed && this.method !== 'edit';
	}

	get contentModelId() {
		return this.model?.id || null;
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

	onLoad(payload: any) {
		this.lengthLimit = payload.lengthLimit;
	}

	@Emit('editor-focus')
	onFocusEditor() {}

	@Emit('editor-blur')
	onBlurEditor() {}

	onCancel() {
		this.$emit('cancel');
	}
}
