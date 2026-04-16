<script lang="ts" setup>
import { TextareaHTMLAttributes, toRef, useTemplateRef } from 'vue';

import { createFormControl, FormControlEmits } from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';
import { FormValidator } from '../validators';

type Props = {
	disabled?: boolean;
	validators?: FormValidator[];
	validateDelay?: number;
	validateOnBlur?: boolean;
} & /* @vue-ignore */ Pick<TextareaHTMLAttributes, 'rows' | 'maxlength'>;

const {
	disabled,
	validators = [],
	validateDelay = 0,
	validateOnBlur = false,
} = defineProps<Props>();

const emit = defineEmits<
	FormControlEmits & {
		paste: [event: ClipboardEvent];
	}
>();

const { name } = useFormGroup()!;

const { id, controlVal, applyValue, applyBlur } = createFormControl({
	initialValue: '',
	validators: toRef(() => validators),
	onChange: val => emit('changed', val),
});

const root = useTemplateRef('root');

function onChange() {
	applyValue(root.value?.value || '', {
		validateDelay: validateDelay,
		validateOnBlur: validateOnBlur,
	});
}

function onBlur() {
	if (validateOnBlur) {
		applyBlur({
			validateDelay: validateDelay,
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
