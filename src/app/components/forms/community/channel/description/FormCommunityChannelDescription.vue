<script lang="ts" setup>
import { ref, toRefs } from 'vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { ContextCapabilities } from '../../../../../../_common/content/content-context';
import AppForm, {
	createForm,
	defineFormProps,
	FormController,
} from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '../../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../../../../../_common/form-vue/validators';
import AppTranslate from '../../../../../../_common/translate/AppTranslate.vue';

const props = defineProps({
	...defineFormProps<CommunityChannel>(true),
});

const { model } = toRefs(props);

const lengthLimit = ref(5_000);
const descriptionContentCapabilities = ref(ContextCapabilities.getPlaceholder());

const form: FormController<CommunityChannel> = createForm({
	loadUrl: `/web/dash/communities/description/save-channel/${model.value.id}`,
	model,
	modelClass: CommunityChannel,
	saveMethod: '$saveDescription' as const,
	onLoad(payload) {
		lengthLimit.value = payload.lengthLimit;
		form.formModel.description_content = model.value.description_content ?? '';

		descriptionContentCapabilities.value = ContextCapabilities.fromPayloadList(
			payload.contentCapabilities
		);
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="description_content" hide-label>
			<AppFormControlContent
				:placeholder="$gettext(`Write your channel description here...`)"
				content-context="community-channel-description"
				:capabilities="descriptionContentCapabilities"
				:model-id="model.id"
				:validators="[
					validateContentRequired(),
					validateContentNoActiveUploads(),
					validateContentMaxLength(lengthLimit),
				]"
				:max-height="0"
			/>

			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton show-when-valid>
			<AppTranslate>Save Description</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
