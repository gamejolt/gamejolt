<script lang="ts" setup>
import { computed } from 'vue';
import AppDatetimePicker from '../../datetime-picker/AppDatetimePicker.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../AppFormControl.vue';
import { validateMaxDate, validateMinDate } from '../validators';

const props = defineProps({
	...defineFormControlProps(),
	timezoneOffset: {
		type: Number,
		required: true,
	},
	minDate: {
		type: Number,
		default: undefined,
	},
	maxDate: {
		type: Number,
		default: undefined,
	},
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const { id, controlVal, applyValue } = createFormControl({
	initialValue: Date.now(),
	validators: computed(() => {
		const validators = [...props.validators];

		if (props.minDate) {
			validators.push(validateMinDate(props.minDate));
		}

		if (props.maxDate) {
			validators.push(validateMaxDate(props.maxDate));
		}

		return validators;
	}),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

function onChange(value: number) {
	applyValue(value);
}
</script>

<template>
	<AppDatetimePicker
		:id="id"
		:value="controlVal"
		:timezone-offset="timezoneOffset"
		:min-date="minDate"
		:max-date="maxDate"
		@change="onChange"
	/>
</template>
