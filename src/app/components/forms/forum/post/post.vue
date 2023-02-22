<script lang="ts">
import { nextTick } from 'vue';
import { Emit, mixins, Options, Prop } from 'vue-property-decorator';
import { ContextCapabilities } from '../../../../../_common/content/content-context';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../../../../_common/form-vue/validators';
import { ForumPost } from '../../../../../_common/forum/post/post.model';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';

class Wrapper extends BaseForm<ForumPost> {}

@Options({
	components: {
		AppFormControlContent,
	},
})
export default class FormForumPost extends mixins(Wrapper) {
	@Prop(Object) topic!: ForumTopic;
	@Prop(Object) replyTo?: ForumPost;

	modelClass = ForumPost;

	readonly validateContentRequired = validateContentRequired;
	readonly validateContentMaxLength = validateContentMaxLength;
	readonly validateContentNoActiveUploads = validateContentNoActiveUploads;

	capabilities = ContextCapabilities.fromPayloadList([]);

	@Emit('cancel')
	emitCancel() {}

	created() {
		this.form.resetOnSubmit = true;
	}

	async onInit() {
		this.setField('topic_id', this.topic.id);

		if (this.replyTo) {
			this.setField('reply_to', this.replyTo.id); // Post ID.
		}

		if (!this.model) {
			this.setField('text_content', '');

			// Wait for errors to appear, then clear them.
			await nextTick();
			this.form.clearErrors();
		}
	}

	onCancel() {
		this.emitCancel();
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="text_content" :label="$gettext('Post Content')" :hide-label="true">
			<AppFormControlContent
				content-context="forum-post"
				:capabilities="capabilities"
				:validators="[validateContentRequired(), validateContentNoActiveUploads()]"
				:max-height="0"
			/>

			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate v-if="method === 'add'">Add Reply</AppTranslate>
			<AppTranslate v-if="method === 'edit'">Save</AppTranslate>
		</AppFormButton>

		<AppButton v-if="method === 'edit' || replyTo" trans @click="onCancel">
			<AppTranslate>Cancel</AppTranslate>
		</AppButton>
	</AppForm>
</template>
