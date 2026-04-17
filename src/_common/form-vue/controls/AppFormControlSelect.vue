<script lang="ts" setup>
import { toRef, useTemplateRef } from 'vue';

import { createFormControl, FormControlEmits } from '~common/form-vue/AppFormControl.vue';
import { useFormGroup } from '~common/form-vue/AppFormGroup.vue';
import { FormValidator } from '~common/form-vue/validators';

type Props = {
	disabled?: boolean;
	validators?: FormValidator[];
};
const { disabled, validators = [] } = defineProps<Props>();

const emit = defineEmits<FormControlEmits>();

const { name } = useFormGroup()!;

const { id, controlVal, applyValue } = createFormControl({
	initialValue: '',
	validators: toRef(() => validators),
	onChange: val => emit('changed', val),
	alwaysOptional: true,
});

const root = useTemplateRef('root');

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
