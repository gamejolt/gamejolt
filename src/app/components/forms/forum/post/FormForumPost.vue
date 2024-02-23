<script lang="ts" setup>
import { nextTick, PropType, ref, toRefs } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { ContextCapabilities } from '../../../../../_common/content/content-context';
import AppForm, {
	createForm,
	defineFormProps,
	FormController,
} from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import {
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../../../../_common/form-vue/validators';
import { $saveForumPost, ForumPostModel } from '../../../../../_common/forum/post/post.model';
import { ForumTopicModel } from '../../../../../_common/forum/topic/topic.model';
import { $gettext } from '../../../../../_common/translate/translate.service';

const props = defineProps({
	topic: {
		type: Object as PropType<ForumTopicModel>,
		required: true,
	},
	// TODO(component-setup-refactor-forms-1): `replyTo` is not being provided by parent, shall we remove this prop?
	replyTo: {
		type: Object as PropType<ForumPostModel>,
		default: undefined,
	},
	...defineFormProps<ForumPostModel>(true),
});

const emit = defineEmits({
	submit: (_model: ForumPostModel) => true,
	cancel: () => true,
});

const { topic, replyTo, model } = toRefs(props);

const capabilities = ref<ContextCapabilities>(ContextCapabilities.fromPayloadList([]));

const form: FormController<ForumPostModel> = createForm({
	model,
	modelClass: ForumPostModel,
	modelSaveHandler: $saveForumPost,
	resetOnSubmit: true,
	async onInit() {
		form.formModel.topic_id = topic.value.id;

		if (replyTo?.value) {
			form.formModel.reply_to = replyTo.value.id; // Post ID.
		}

		if (!model.value) {
			form.formModel.text_content = '';

			// Wait for errors to appear, then clear them.
			await nextTick();
			form.clearErrors();
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
			<span v-if="form.method === 'add'">{{ $gettext(`Add Reply`) }}</span>
			<span v-if="form.method === 'edit'">{{ $gettext(`Save`) }}</span>
		</AppFormButton>

		<AppButton v-if="form.method === 'edit' || replyTo" trans @click="onCancel">
			{{ $gettext(`Cancel`) }}
		</AppButton>
	</AppForm>
</template>
