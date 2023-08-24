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
import { validateBasicLink } from '../../../../form-vue/validators';
import { LinkData } from './link-modal.service';

const props = defineProps({
	...defineFormProps<LinkData>(true),
});

const emit = defineEmits({
	submit: (_model: LinkData) => true,
});

const form: FormController<LinkData> = createForm({
	model: toRef(props, 'model'),
	onInit() {
		form.formModel.href ??= form.formModel.href || '';
		form.formModel.title ??= form.formModel.title || '';
	},
	onSubmitSuccess() {
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

		<AppFormButton :disabled="!form.valid">
			{{ $gettext(`Insert link`) }}
		</AppFormButton>
	</AppForm>
</template>
