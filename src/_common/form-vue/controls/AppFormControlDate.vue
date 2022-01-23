<script lang="ts" setup>
import { computed, toRef } from 'vue';
import AppDatetimePicker from '../../datetime-picker/AppDatetimePicker.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';

const props = defineProps({
	...defineFormControlProps(),
	timezoneOffset: {
		type: Number,
		required: true,
	},
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const { name } = useFormGroup()!;

const { id, controlVal, applyValue } = createFormControl({
	initialValue: Date.now(),
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

const minDate = computed(() => {
	return undefined;
	// TODO(vue3)
	// return this.validationRules.min_date;
});

const maxDate = computed(() => {
	return undefined;
	// TODO(vue3)
	// return this.validationRules.max_date;
});

function onChange(value: number) {
	applyValue(value);
}
</script>

<template>
	<div>
		<AppDatetimePicker
			:id="id"
			:value="controlVal"
			:timezone-offset="timezoneOffset"
			:min-date="minDate"
			:max-date="maxDate"
			@change="onChange"
		/>

		<!-- v-validate="{ rules: validationRules }" -->
		<input v-model="controlVal" class="hidden" type="number" :name="name" />
	</div>
</template>
