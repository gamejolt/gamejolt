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
import { useFormControlToggleButtonGroup } from './AppFormControlToggleButtonGroup.vue';

const props = defineProps({
	...defineFormControlProps(),
	/**
	 * Should be set to define what value the toggled button will set on the
	 * form group.
	 */
	value: {
		type: null,
		required: true,
	},
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const { disabled, validators, value } = toRefs(props);

const form = useForm()!;
const { name } = useFormGroup()!;
const { multi, direction } = useFormControlToggleButtonGroup()!;

const { applyValue } = createFormControl<any>({
	initialValue: multi ? [] : null,
	validators,
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
	multi,
});

const currentSelection = computed(() => {
	const currentValue = form.formModel[name.value];

	if (multi) {
		return currentValue ?? [];
	} else {
		// We make it an array to make the code easier to work with multi and
		// singular versions.
		return [currentValue ?? null];
	}
});

const isSelected = computed(() => currentSelection.value.includes(value.value));

function toggle() {
	if (disabled.value) {
		return;
	}

	const newValue = value.value;

	// Single value toggles.
	if (!multi) {
		applyValue(newValue);
	} else {
		const selected = [...currentSelection.value];

		if (!isSelected.value) {
			selected.push(newValue);
		} else {
			arrayRemove(selected, i => i === newValue);
		}

		applyValue(selected);
	}
}
</script>

<template>
	<AppButton
		class="-toggle-button"
		:class="[
			multi ? '-multi' : '-single',
			`-direction-${direction}`,
			{ '-selected': isSelected },
		]"
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
	margin: 0 !important
	padding-left: 4px !important
	padding-right: 4px !important

	&:not(.-selected)
		border-color: var(--theme-bg-subtle)

.-single
	&.-direction-row
		&:first-child
			border-top-right-radius: 0
			border-bottom-right-radius: 0

		&:last-child
			border-top-left-radius: 0
			border-bottom-left-radius: 0

		&:not(:first-child):not(:last-child)
			border-radius: 0

	&.-direction-column
		&:first-child
			border-bottom-left-radius: 0
			border-bottom-right-radius: 0

		&:last-child
			border-top-left-radius: 0
			border-top-right-radius: 0

		&:not(:first-child):not(:last-child)
			border-radius: 0
</style>
