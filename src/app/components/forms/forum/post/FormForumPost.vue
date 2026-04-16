<script lang="ts" setup>
import { nextTick, toRef } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import { ContextCapabilities } from '~common/content/content-context';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '~common/form-vue/controls/AppFormControlContent.vue';
import {
	validateContentNoActiveUploads,
	validateContentRequired,
} from '~common/form-vue/validators';
import { $saveForumPost, ForumPostModel } from '~common/forum/post/post.model';
import { ForumTopicModel } from '~common/forum/topic/topic.model';
import AppTranslate from '~common/translate/AppTranslate.vue';

type FormModel = ForumPostModel;

type Props = {
	model?: ForumPostModel;
	topic: ForumTopicModel;
	replyTo?: ForumPostModel;
};

const { model, topic, replyTo } = defineProps<Props>();

const emit = defineEmits<{
	cancel: [];
	submit: [post: ForumPostModel];
}>();

const capabilities = ContextCapabilities.fromPayloadList([]);

const form: FormController<FormModel> = createForm<FormModel>({
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
