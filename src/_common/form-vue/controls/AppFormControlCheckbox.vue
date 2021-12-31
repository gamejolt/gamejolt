<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';
import { useForm } from '../AppForm.vue';
import { createFormControl, defineFormControlProps } from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';

// TODO(vue3): better typing
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

const form = useForm<any>()!;
const group = useFormGroup()!;

const c = createFormControl<any>(null, toRef(props, 'validators'), { multi: true });

const root = ref<HTMLInputElement>();

const currentOptions = computed(() => {
	return form.formModel[group.name] || [];
});

const checked = computed(() => {
	// This is when there's only one checkbox without a value field. That means
	// we want to check for just a boolean check.
	if (!props.value) {
		return !!form.formModel[group.name];
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
		c.applyValue(root.value.checked);
	} else {
		// Multiple checkboxes with values.
		const options = currentOptions.value as string[];

		if (root.value.checked) {
			options.push(props.value);
		} else {
			const index = options.findIndex(i => i === props.value);
			if (index !== -1) {
				options.splice(index, 1);
			}
		}

		c.applyValue(currentOptions);
	}
}
</script>

<template>
	<input
		ref="root"
		type="checkbox"
		:name="group.name"
		:value="c.controlVal"
		:checked="checked"
		@change="onChange"
	/>
</template>
