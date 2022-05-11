<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';
import { useForm } from '../AppForm.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';

// TODO: better typing
const props = defineProps({
	...defineFormControlProps(),
	/**
	 * Should be set to define what value the checkbox will set on the form
	 * group. If this is undefined, we will use boolean value when it's on/off.
	 */
	value: {
		type: null,
		default: undefined,
	},
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const form = useForm()!;
const { name } = useFormGroup()!;

const { controlVal, applyValue } = createFormControl<any>({
	initialValue: null,
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
	multi: true,
	alwaysOptional: true,
});

const root = ref<HTMLInputElement>();

const currentOptions = computed(() => form.formModel[name.value] || []);

const checked = computed(() => {
	// This is when there's only one checkbox without a value field. That means
	// we want to check for just a boolean check.
	if (!props.value) {
		return !!form.formModel[name.value];
	}

	// Multiple checkboxes, so we want to check to see if it's within the form
	// model array of checked options.
	return currentOptions.value.indexOf(props.value) !== -1;
});

function onChange() {
	if (!root.value) {
		return;
	}

	// Boolean based single checkbox.
	if (!props.value) {
		applyValue(root.value.checked);
	} else {
		// Multiple checkboxes with values.
		const options: any[] = [...currentOptions.value];

		if (root.value.checked) {
			options.push(props.value);
		} else {
			const index = options.findIndex(i => i === props.value);
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
