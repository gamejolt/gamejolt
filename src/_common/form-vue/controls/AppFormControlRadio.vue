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
const group = useFormGroup()!;
const c = createFormControl<any>({
	initialValue: undefined,
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
	multi: true,
});

const checked = computed(() => form.formModel[group.name] === props.value);

function onChange() {
	c.applyValue(props.value);
}
</script>

<template>
	<input type="radio" :name="group.name" :checked="checked" @change="onChange" />
</template>
