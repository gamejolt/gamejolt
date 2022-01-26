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
});

const { name } = useFormGroup()!;

const { id, controlVal, applyValue } = createFormControl({
	initialValue: '',
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

const root = ref<HTMLSelectElement>();

function onChange() {
	applyValue(root.value?.value || '');
}
</script>

<!--
The click.stop is because selects in modals end up closing the modal when
selecting an option. The click event triggers as being outside the modal.
There doesn't seem to be a harm in just not propagating the event always
since nothing ever needs to hook into it so far.
-->
<template>
	<select
		:id="id"
		ref="root"
		:name="name"
		class="form-control"
		:value="controlVal"
		:disabled="disabled ? 'true' : undefined"
		@click.stop
		@change="onChange"
	>
		<slot />
	</select>
</template>
