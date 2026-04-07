<script lang="ts" setup>
import { nextTick, toRef } from 'vue';
import { ContextCapabilities } from '../../../../../_common/content/content-context';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../../../../_common/form-vue/validators';
import { $saveForumPost, ForumPostModel } from '../../../../../_common/forum/post/post.model';
import { ForumTopicModel } from '../../../../../_common/forum/topic/topic.model';

type Props = {
	model?: ForumPostModel;
	topic: ForumTopicModel;
	replyTo?: ForumPostModel;
};

const { model, topic, replyTo } = defineProps<Props>();

const emit = defineEmits<{
	cancel: [];
}>();

const capabilities = ContextCapabilities.fromPayloadList([]);

const form: FormController<ForumPostModel> = createForm({
	model: toRef(() => model),
	modelClass: ForumPostModel,
	modelSaveHandler: $saveForumPost,
	resetOnSubmit: true,
	async onInit() {
		form.formModel.topic_id = topic.id;

		if (replyTo) {
			form.formModel.reply_to = replyTo.id;
		}

		if (!model) {
			form.formModel.text_content = '';

			// Wait for errors to appear, then clear them.
			await nextTick();
			form.clearErrors();
		}
	},
});

function onCancel() {
	emit('cancel');
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="text_content" :label="$gettext('Post Content')" :hide-label="true">
			<AppFormControlContent
				content-context="forum-post"
				:capabilities="capabilities"
				:model-data="null"
				:validators="[validateContentRequired(), validateContentNoActiveUploads()]"
				:max-height="0"
			/>

			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate v-if="form.method === 'add'">Add Reply</AppTranslate>
			<AppTranslate v-if="form.method === 'edit'">Save</AppTranslate>
		</AppFormButton>

		<AppButton v-if="form.method === 'edit' || replyTo" trans @click="onCancel">
			<AppTranslate>Cancel</AppTranslate>
		</AppButton>
	</AppForm>
</template>
