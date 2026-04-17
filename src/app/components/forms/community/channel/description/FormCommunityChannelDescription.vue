<script lang="ts" setup>
import { ref, toRef } from 'vue';

import {
	$saveCommunityChannelDescription,
	CommunityChannelModel,
} from '~common/community/channel/channel.model';
import { ContextCapabilities } from '~common/content/content-context';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '~common/form-vue/controls/AppFormControlContent.vue';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '~common/form-vue/validators';
import AppTranslate from '~common/translate/AppTranslate.vue';

type FormModel = CommunityChannelModel;

type Props = {
	model: FormModel;
};
const { model } = defineProps<Props>();

const lengthLimit = ref(5_000);
const descriptionContentCapabilities = ref(ContextCapabilities.getPlaceholder());

const form: FormController<FormModel> = createForm<FormModel>({
	loadUrl: `/web/dash/communities/description/save-channel/${model.id}`,
	model: toRef(() => model),
	modelClass: CommunityChannelModel,
	modelSaveHandler: $saveCommunityChannelDescription,
	onLoad(payload) {
		lengthLimit.value = payload.lengthLimit;
		form.formModel.description_content = model.description_content ?? '';

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
				:model-data="{
					type: 'resource',
					resource: 'Community_Channel',
					resourceId: model.id,
				}"
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
