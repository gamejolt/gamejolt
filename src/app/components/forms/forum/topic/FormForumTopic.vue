<script lang="ts" setup>
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { toRef } from 'vue';
import { ContextCapabilities } from '../../../../../_common/content/content-context';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import { validateContentNoActiveUploads, validateContentRequired, validateMaxLength } from '../../../../../_common/form-vue/validators';
import { ForumChannelModel } from '../../../../../_common/forum/channel/channel.model';
import { $saveForumTopic, ForumTopicModel } from '../../../../../_common/forum/topic/topic.model';

type Props = {
	model?: ForumTopicModel;
	channel: ForumChannelModel;
};

const { model, channel } = defineProps<Props>();

const emit = defineEmits<{
	cancel: [];
}>();

const capabilities = ContextCapabilities.fromPayloadList([]);

const form: FormController<ForumTopicModel> = createForm({
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
