<script lang="ts">
import { computed, PropType, toRefs } from 'vue';
import AppButtonStack from '../../../button-stack/AppButtonStack.vue';
import AppButton from '../../../button/AppButton.vue';
import { useForm } from '../../AppForm.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../../AppFormControl.vue';
import { useFormGroup } from '../../AppFormGroup.vue';

export interface StackedButtonOption {
	label: string;
	value: any;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	options: {
		type: Array as PropType<StackedButtonOption[]>,
		required: true,
	},
	...defineFormControlProps(),
});

const { validators, options } = toRefs(props);

const emit = defineEmits({
	...defineFormControlEmits(),
});

const form = useForm()!;
const { name } = useFormGroup()!;

const { applyValue } = createFormControl<any>({
	initialValue: 'asdf',
	validators,
	onChange: val => emit('changed', val),
});

const currentSelection = computed(() => form.formModel[name.value] ?? []);
</script>
<template>
	<AppButtonStack class="-stacked-button-group">
		<AppButton
			v-for="{ label, value } of options"
			:key="label"
			:primary="value === currentSelection"
			:solid="value === currentSelection"
			block
			@click="applyValue(value)"
		>
			{{ label }}
		</AppButton>
	</AppButtonStack>
</template>

<style lang="stylus" scoped></style>
