<script lang="ts" setup>
import { computed, toRef } from 'vue';
import { useForm } from '../AppForm.vue';
import { createFormControl, defineFormControlProps } from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';

const props = defineProps({
	...defineFormControlProps(),
	value: {
		type: null,
		default: undefined,
	},
});

const form = useForm<any>()!;
const group = useFormGroup()!;
const c = createFormControl<any>(undefined, toRef(props, 'validators'), { multi: true });

const checked = computed(() => form.formModel[group.name] === props.value);

function onChange() {
	c.applyValue(props.value);
}
</script>

<template>
	<input type="radio" :name="group.name" :checked="checked" @change="onChange" />
</template>
