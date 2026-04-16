<script lang="ts" setup>
import { toRef } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import { ContextCapabilities } from '~common/content/content-context';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '~common/form-vue/controls/AppFormControlContent.vue';
import {
	validateContentNoActiveUploads,
	validateContentRequired,
	validateMaxLength,
} from '~common/form-vue/validators';
import { ForumChannelModel } from '~common/forum/channel/channel.model';
import { $saveForumTopic, ForumTopicModel } from '~common/forum/topic/topic.model';
import AppTranslate from '~common/translate/AppTranslate.vue';

type FormModel = ForumTopicModel & {
	text_content?: string;
};

type Props = {
	model?: ForumTopicModel;
	channel: ForumChannelModel;
};

const { model, channel } = defineProps<Props>();

const emit = defineEmits<{
	cancel: [];
	submit: [topic: ForumTopicModel];
}>();

const capabilities = ContextCapabilities.fromPayloadList([]);

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(() => model),
	modelClass: ForumTopicModel,
	modelSaveHandler: $saveForumTopic,
	onInit() {
		form.formModel.channel_id = channel.id;

		if (form.method === 'edit' && model) {
			form.formModel.text_content = model.main_post.text_content;
		} else {
			form.formModel.text_content = '';
		}
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

function onCancel() {
	emit('cancel');
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="title" :label="$gettext('Title')">
			<AppFormControl type="text" :validators="[validateMaxLength(300)]" />

			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="text_content" :label="$gettext('Topic Content')">
			<AppFormControlContent
				content-context="forum-post"
				:capabilities="capabilities"
				:model-data="null"
				:validators="[validateContentRequired(), validateContentNoActiveUploads()]"
			/>

			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate v-if="form.method === 'add'">Add Topic</AppTranslate>
			<AppTranslate v-if="form.method === 'edit'">Save</AppTranslate>
		</AppFormButton>

		<AppButton v-if="form.method === 'edit'" trans @click="onCancel">
			<AppTranslate>Cancel</AppTranslate>
		</AppButton>
	</AppForm>
</template>
