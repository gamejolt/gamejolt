<script lang="ts" setup>
import { computed, toRef } from 'vue';

import { useForm } from '~common/form-vue/AppForm.vue';
import { createFormControl, FormControlEmits } from '~common/form-vue/AppFormControl.vue';
import { useFormGroup } from '~common/form-vue/AppFormGroup.vue';
import { FormValidator } from '~common/form-vue/validators';

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
