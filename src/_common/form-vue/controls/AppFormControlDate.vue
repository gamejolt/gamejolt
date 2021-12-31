<script lang="ts" setup>
import { computed, toRef } from 'vue';
import AppDatetimePicker from '../../datetime-picker/datetime-picker.vue';
import { createFormControl, defineFormControlProps } from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';

const props = defineProps({
	...defineFormControlProps(),
	timezoneOffset: {
		type: Number,
		required: true,
	},
});

const group = useFormGroup()!;
const c = createFormControl(Date.now(), toRef(props, 'validators'));

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
	c.applyValue(value);
}
</script>

<template>
	<div>
		<app-datetime-picker
			:id="c.id"
			:value="c.controlVal"
			:timezone-offset="timezoneOffset"
			:min-date="minDate"
			:max-date="maxDate"
			@change="onChange"
		/>

		<!-- v-validate="{ rules: validationRules }" -->
		<input v-model="c.controlVal" class="hidden" type="number" :name="group.name" />
	</div>
</template>
