<script lang="ts" setup>
import { computed, toRefs } from 'vue';
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

const { disabled, validators, value } = toRefs(props);

const emit = defineEmits({
	...defineFormControlEmits(),
});

const form = useForm()!;
const { name } = useFormGroup()!;

const { applyValue } = createFormControl<any[]>({
	initialValue: [],
	validators,
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
	multi: true,
	alwaysOptional: true,
});

const currentSelection = computed(() => form.formModel[name.value] ?? []);

const isSelected = computed(() => currentSelection.value.includes(value.value));

function toggle() {
	if (disabled.value) {
		return;
	}

	const selected = [...currentSelection.value];
	const currentValue = value.value;

	if (!isSelected.value) {
		selected.push(currentValue);
	} else {
		arrayRemove(selected, i => i === currentValue);
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
	// We need to modify this button styling. We want the options to have more
	// room to squish into one line.
	margin-left: 0 !important
	padding-left: 4px !important
	padding-right: 4px !important
</style>
