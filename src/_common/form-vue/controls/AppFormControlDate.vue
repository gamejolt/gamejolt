<script lang="ts" setup>
import { computed } from 'vue';

import AppDatetimePicker from '~common/datetime-picker/AppDatetimePicker.vue';
import { createFormControl, FormControlEmits } from '~common/form-vue/AppFormControl.vue';
import { FormValidator, validateMaxDate, validateMinDate } from '~common/form-vue/validators';

type Props = {
	disabled?: boolean;
	validators?: FormValidator[];
	timezoneOffset: number;
	minDate?: number;
	maxDate?: number;
};
const { validators = [], timezoneOffset, minDate, maxDate } = defineProps<Props>();

const emit = defineEmits<FormControlEmits>();

const { id, controlVal, applyValue } = createFormControl({
	initialValue: Date.now(),
	validators: computed(() => {
		const _validators = [...validators];

		if (minDate) {
			_validators.push(validateMinDate(minDate));
		}

		if (maxDate) {
			_validators.push(validateMaxDate(maxDate));
		}

		return _validators;
	}),
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
