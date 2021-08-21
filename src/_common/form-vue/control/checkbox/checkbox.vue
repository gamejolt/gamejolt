<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useFormControlGroup } from '../../group/group.vue';
import { provideFormControl } from '../controller';

// TODO(vue3): better typing
const props = defineProps({
	value: {
		type: null,
		default: undefined,
	},
});

const root = ref<HTMLInputElement>();
const group = useFormControlGroup();

const c = provideFormControl<any>(null, { multi: true });

const currentOptions = computed(() => {
	return form.base.formModel[group.name] || [];
});

const checked = computed(() => {
	// This is when there's only one checkbox without a value field. That means
	// we want to check for just a boolean check.
	if (!props.value) {
		return !!form.base.formModel[group.name];
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
