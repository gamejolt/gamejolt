<script lang="ts" setup>
import { toRef } from 'vue';
import AppForm, {
	FormController,
	createForm,
	defineFormProps,
} from '../../../../form-vue/AppForm.vue';
import AppFormButton from '../../../../form-vue/AppFormButton.vue';
import AppFormControl from '../../../../form-vue/AppFormControl.vue';
import AppFormGroup from '../../../../form-vue/AppFormGroup.vue';
import { validateMinLength } from '../../../../form-vue/validators.js';
import { CustomButtonData } from './custom-button-modal.service';

const props = defineProps({
	...defineFormProps<CustomButtonData>(true),
});

const emit = defineEmits({
	submit: (_model: CustomButtonData) => true,
});

const form: FormController<CustomButtonData> = createForm({
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
