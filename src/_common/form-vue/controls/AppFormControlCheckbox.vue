<script lang="ts" setup>
import { computed, toRef, useTemplateRef } from 'vue';

import { useForm } from '~common/form-vue/AppForm.vue';
import { createFormControl, FormControlEmits } from '~common/form-vue/AppFormControl.vue';
import { useFormGroup } from '~common/form-vue/AppFormGroup.vue';
import { FormValidator } from '~common/form-vue/validators';

type Props = {
	disabled?: boolean;
	validators?: FormValidator[];
	/**
	 * Should be set to define what value the checkbox will set on the form
	 * group. If this is undefined, we will use boolean value when it's on/off.
	 */
	value?: any;
};
const { disabled, validators = [], value } = defineProps<Props>();

const emit = defineEmits<FormControlEmits>();

const form = useForm()!;
const { name } = useFormGroup()!;

const { controlVal, applyValue } = createFormControl<any>({
	initialValue: null,
	validators: toRef(() => validators),
	onChange: val => emit('changed', val),
	multi: true,
	alwaysOptional: true,
});

const root = useTemplateRef('root');

const currentOptions = computed(() => form.formModel[name.value] || []);

const checked = computed(() => {
	// This is when there's only one checkbox without a value field. That means
	// we want to check for just a boolean check.
	if (!value) {
		return !!form.formModel[name.value];
	}

	// Multiple checkboxes, so we want to check to see if it's within the form
	// model array of checked options.
	return currentOptions.value.indexOf(value) !== -1;
});

function onChange() {
	if (!root.value) {
		return;
	}

	// Boolean based single checkbox.
	if (!value) {
		applyValue(root.value.checked);
	} else {
		// Multiple checkboxes with values.
		const options: any[] = [...currentOptions.value];

		if (root.value.checked) {
			options.push(value);
		} else {
			const index = options.findIndex(i => i === value);
			if (index !== -1) {
				options.splice(index, 1);
			}
		}

		applyValue(options);
	}
}
</script>

<template>
	<input
		ref="root"
		type="checkbox"
		:name="name"
		:value="controlVal"
		:checked="checked ? 'true' : undefined"
		:disabled="disabled ? 'true' : undefined"
		@change="onChange"
	/>
</template>
