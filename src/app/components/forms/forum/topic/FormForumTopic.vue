<script lang="ts" setup>
import { PropType, ref, toRefs } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { ContextCapabilities } from '../../../../../_common/content/content-context';
import AppForm, {
	FormController,
	createForm,
	defineFormProps,
} from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import {
	validateContentNoActiveUploads,
	validateContentRequired,
	validateMaxLength,
} from '../../../../../_common/form-vue/validators';
import { ForumChannelModel } from '../../../../../_common/forum/channel/channel.model';
import { $saveForumTopic, ForumTopicModel } from '../../../../../_common/forum/topic/topic.model';

const props = defineProps({
	channel: {
		type: Object as PropType<ForumChannelModel>,
		required: true,
	},
	...defineFormProps<ForumTopicModel>(true),
});

const emit = defineEmits({
	submit: () => true,
	cancel: () => true,
});

const { channel, model } = toRefs(props);

const capabilities = ref<ContextCapabilities>(ContextCapabilities.fromPayloadList([]));

const form: FormController<ForumTopicModel> = createForm({
	model,
	modelClass: ForumTopicModel,
	modelSaveHandler: $saveForumTopic,
	onInit() {
		form.formModel.channel_id = channel.value.id;

		if (form.method === 'edit' && model.value) {
			form.formModel.text_content = model.value.main_post.text_content;
		} else {
			form.formModel.text_content = '';
		}
	},
	onSubmitSuccess() {
		emit('submit');
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
			<span v-if="form.method === 'add'">{{ $gettext(`Add Topic`) }}</span>
			<span v-if="form.method === 'edit'">{{ $gettext(`Save`) }}</span>
		</AppFormButton>

		<AppButton v-if="form.method === 'edit'" trans @click="onCancel">
			{{ $gettext(`Cancel`) }}
		</AppButton>
	</AppForm>
</template>
