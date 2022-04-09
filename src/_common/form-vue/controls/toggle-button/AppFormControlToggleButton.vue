<script lang="ts" setup>
import { computed, toRef } from 'vue';
import { arrayRemove } from '../../../../utils/array';
import AppButton from '../../../button/AppButton.vue';
import { useForm } from '../../AppForm.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../../AppFormControl.vue';
import { useFormGroup } from '../../AppFormGroup.vue';

const props = defineProps({
	...defineFormControlProps(),
	/**
	 * Should be set to define what value the checkbox will set on the form
	 * group.
	 */
	value: {
		type: null,
		required: true,
	},
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const form = useForm()!;
const { name } = useFormGroup()!;

const { applyValue } = createFormControl<any[]>({
	initialValue: [],
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
	multi: true,
	alwaysOptional: true,
});

const currentSelection = computed(() => form.formModel[name.value] ?? []);

const isSelected = computed(() => currentSelection.value.includes(props.value));

function toggle() {
	if (props.disabled) {
		return;
	}

	const selected = [...currentSelection.value];

	if (!isSelected.value) {
		selected.push(props.value);
	} else {
		arrayRemove(selected, i => i === props.value);
	}

	applyValue(selected);
}
</script>

<template>
	<AppButton
		class="-toggle-button"
		:solid="isSelected"
		:primary="isSelected"
		:disabled="disabled"
		@click="toggle"
	>
		<slot />
	</AppButton>
</template>

<style lang="stylus" scoped>
.-toggle-button
	width: 100%
	text-align: center
</style>
