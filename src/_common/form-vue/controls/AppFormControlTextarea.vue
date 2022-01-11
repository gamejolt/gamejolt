<script lang="ts" setup>
import { ref, toRef } from 'vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';

const props = defineProps({
	...defineFormControlProps(),
});

const emit = defineEmits({
	...defineFormControlEmits(),
	paste: (_event: ClipboardEvent) => true,
});

const group = useFormGroup()!;
const c = createFormControl({
	initialValue: '',
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

const root = ref<HTMLTextAreaElement>();

function onChange() {
	c.applyValue(root.value?.value || '');
}
</script>

<!-- v-validate="{ rules: validationRules }" -->
<!-- :data-vv-validate-on="validateOn"
		:data-vv-delay="validateDelay" -->
<template>
	<textarea
		:id="c.id"
		ref="root"
		:name="group.name"
		class="form-control"
		:value="c.controlVal"
		@input="onChange"
		@paste="emit('paste', $event)"
	/>
</template>
