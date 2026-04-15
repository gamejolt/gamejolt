<script lang="ts" setup>
import { toRef } from 'vue';

import AppForm, {
	createForm,
	defineFormProps,
	FormController,
} from '../../../../form-vue/AppForm.vue';
import AppFormButton from '../../../../form-vue/AppFormButton.vue';
import AppFormControl from '../../../../form-vue/AppFormControl.vue';
import AppFormGroup from '../../../../form-vue/AppFormGroup.vue';
import { validateMinLength } from '../../../../form-vue/validators.js';
import { CustomButtonData } from './custom-button-modal.service';

type FormModel = CustomButtonData;

const props = defineProps({
	...defineFormProps<FormModel>(true),
});

const emit = defineEmits<{
	submit: [model: FormModel];
}>();

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(props, 'model'),
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
