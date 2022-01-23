<script lang="ts" setup>
import { computed, toRef } from 'vue';
import { useForm } from '../AppForm.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';

const props = defineProps({
	...defineFormControlProps(),
	value: {
		type: null,
		default: undefined,
	},
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const form = useForm()!;
const { name } = useFormGroup()!;

const { applyValue } = createFormControl<any>({
	initialValue: undefined,
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
	multi: true,
	alwaysOptional: true,
});

const checked = computed(() => form.formModel[name.value] === props.value);

function onChange() {
	applyValue(props.value);
}
</script>

<template>
	<input type="radio" :name="name" :checked="checked" @change="onChange" />
</template>
