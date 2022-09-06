<script lang="ts">
import { nextTick } from 'vue';
import { Emit, mixins, Options, Prop } from 'vue-property-decorator';
import { trackCommentAdd } from '../../analytics/analytics.service';
import { ContentContext } from '../../content/content-context';
import { ContentRules } from '../../content/content-editor/content-rules';
import AppFormControlContent from '../../form-vue/controls/AppFormControlContent.vue';
import { BaseForm, FormOnLoad, FormOnSubmitSuccess } from '../../form-vue/form.service';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../form-vue/validators';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { Comment, getCommentModelResourceName } from '../comment-model';
import '../comment.styl';

class Wrapper extends BaseForm<Comment> {}

@Options({
	components: {
		AppFormControlContent,
	},
})
export default class FormComment
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnSubmitSuccess
{
	@Prop(Object)
	commentModel!: Model;

	@Prop(Number)
	parentId?: number;

	@Prop(Boolean)
	autofocus?: boolean;

	@Prop(String)
	placeholder?: string;

	modelClass = Comment;
	lengthLimit = 5_000;

	readonly validateContentRequired = validateContentRequired;
	readonly validateContentMaxLength = validateContentMaxLength;
	readonly validateContentNoActiveUploads = validateContentNoActiveUploads;

	get loadUrl() {
		if (this.model?.id) {
			return `/comments/save/${this.model.id}`;
		} else {
			return `/comments/save?resource=${getCommentModelResourceName(this.commentModel)}`;
		}
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
			await nextTick();
			this.form.clearErrors();
		}
	}

	created() {
		this.form.resetOnSubmit = true;
	}

	onLoad(payload: any) {
		this.lengthLimit = payload.lengthLimit;
	}

	onSubmitSuccess() {
		if (this.method === 'add') {
			trackCommentAdd();
		}
	}

	@Emit('editor-focus')
	onFocusEditor() {}

	@Emit('editor-blur')
	onBlurEditor() {}

	@Emit('cancel')
	emitCancel() {}

	onCancel() {
		this.emitCancel();
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="comment_content" :label="$gettext('Leave a Comment')" hide-label>
			<AppFormControlContent
				:placeholder="placeholder || $gettext(`Leave a comment...`)"
				:content-context="contentContext"
				:autofocus="autofocus"
				:validators="[
					validateContentRequired(),
					validateContentNoActiveUploads(),
					validateContentMaxLength(lengthLimit),
				]"
				:max-height="maxHeight"
				:display-rules="displayRules"
				:model-id="contentModelId"
				focus-end
				@focus="onFocusEditor"
				@blur="onBlurEditor"
			/>

			<AppFormControlErrors label="comment" />
		</AppFormGroup>

		<p v-if="shouldShowGuidelines" class="-guidelines">
			Remember to be respectful and follow our
			<AppLinkHelp page="guidelines">Site Guidelines</AppLinkHelp>.
		</p>
		<div v-else class="-buttons">
			<AppButton v-if="method === 'edit'" trans @click="onCancel">
				<AppTranslate>Cancel</AppTranslate>
			</AppButton>

			<AppFormButton show-when-valid>
				<AppTranslate v-if="method === 'add'">Add Comment</AppTranslate>
				<AppTranslate v-else-if="method === 'edit'">Save</AppTranslate>
			</AppFormButton>
		</div>
	</AppForm>
</template>

<style lang="stylus" scoped>
.-guidelines
	font-size: $font-size-small
	margin-bottom: 8px

.-buttons
	text-align: right

::v-deep(.form-group)
	margin-bottom: 8px
</style>
