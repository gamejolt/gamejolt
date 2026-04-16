<script lang="ts" setup>
import { toRef } from 'vue';

import { CustomButtonData } from '~common/content/content-editor/modals/custom-button/custom-button-modal.service';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import { validateMinLength } from '~common/form-vue/validators.js';

type FormModel = CustomButtonData;

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
		form.formModel.customButtonId ??= '';
	},
	async onSubmit() {
		emit('submit', form.formModel);
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="customButtonId" :optional="false" :label="$gettext(`Custom Button ID`)">
			<AppFormControl placeholder="1234" focus :validators="[validateMinLength(8)]" />
		</AppFormGroup>

		<AppFormButton :disabled="!form.valid">
			{{ $gettext(`Insert custom button`) }}
		</AppFormButton>
	</AppForm>
</template>
