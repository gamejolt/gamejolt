<script lang="ts" setup>
import { ref, toRef } from 'vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
	defineFormControlValidateProps,
} from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';

const props = defineProps({
	...defineFormControlProps(),
	...defineFormControlValidateProps(),
});

const emit = defineEmits({
	...defineFormControlEmits(),
	paste: (_event: ClipboardEvent) => true,
});

const { name } = useFormGroup()!;

const { id, controlVal, applyValue, applyBlur } = createFormControl({
	initialValue: '',
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

const root = ref<HTMLTextAreaElement>();

function onChange() {
	applyValue(root.value?.value || '', {
		validateDelay: props.validateDelay,
		validateOnBlur: props.validateOnBlur,
	});
}

function onBlur() {
	if (props.validateOnBlur) {
		applyBlur({
			validateDelay: props.validateDelay,
		});
	}
}
</script>

<template>
	<textarea
		:id="id"
		ref="root"
		:name="name"
		class="form-control"
		:value="controlVal"
		:disabled="disabled ? 'true' : undefined"
		@input="onChange"
		@blur="onBlur"
		@paste="emit('paste', $event)"
	/>
</template>
