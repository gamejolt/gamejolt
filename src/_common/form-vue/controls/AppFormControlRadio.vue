<script lang="ts" setup>
import { computed, toRef } from 'vue';

import { useForm } from '../AppForm.vue';
import {
	createFormControl,
	FormControlEmits,
} from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';
import { FormValidator } from '../validators';

type Props = {
	disabled?: boolean;
	validators?: FormValidator[];
	value?: any;
};
const { disabled, validators = [], value } = defineProps<Props>();

const emit = defineEmits<FormControlEmits>();

const form = useForm()!;
const { name } = useFormGroup()!;

const { applyValue } = createFormControl<any>({
	initialValue: undefined,
	validators: toRef(() => validators),
	onChange: val => emit('changed', val),
	multi: true,
	alwaysOptional: true,
});

const checked = computed(() => form.formModel[name.value] === value);

function onChange() {
	applyValue(value);
}
</script>

<template>
	<input
		type="radio"
		:name="name"
		:checked="checked ? 'true' : undefined"
		:disabled="disabled ? 'true' : undefined"
		@change="onChange"
	/>
</template>
