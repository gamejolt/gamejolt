<script lang="ts" setup>
import { toRef } from 'vue';

import { LinkData } from '~common/content/content-editor/modals/link/link-modal.service';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import { validateBasicLink } from '~common/form-vue/validators';

type FormModel = LinkData;

type Props = {
	model: FormModel;
};
const { model } = defineProps<Props>();

const emit = defineEmits<{
	submit: [model: FormModel];
}>();

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(() => model),
	onInit() {
		form.formModel.href ??= form.formModel.href || '';
		form.formModel.title ??= form.formModel.title || '';
	},
	onSubmit() {
		emit('submit', form.formModel);
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="href" :optional="false" :label="$gettext(`Link Destination`)">
			<AppFormControl
				placeholder="https://example.com"
				focus
				:validators="[validateBasicLink()]"
			/>
		</AppFormGroup>

		<div :style="{ flex: 'row', justifyContent: 'end' }">
			<AppFormButton :disabled="!form.valid">
				{{ $gettext(`Insert link`) }}
			</AppFormButton>

			<slot name="buttons" />
		</div>
	</AppForm>
</template>
