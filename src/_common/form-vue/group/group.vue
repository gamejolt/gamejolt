<script lang="ts">
import { computed, inject, provide, reactive } from 'vue';
import { titleCase } from '../../../utils/string';
import { FormControlController } from '../control/controller';
import { useForm } from '../form.service';

type Controller = ReturnType<typeof provideFormControlGroup>;

const Key = Symbol();

export function provideFormControlGroup() {
	const c = reactive({
		inputErrors: null, // TODO: Proper type
		changed: false,
		control: undefined as FormControlController | undefined,
		get name() {
			return props.name;
		},
		get label() {
			return props.label;
		},
		get humanLabel() {
			const name = this.name;

			return !this.label
				? titleCase(name, {
						dropHyphens: true,
						dropUnderscores: true,
						expandCamelCase: true,
						keepLcWords: true,
				  })
				: this.label;
		},
	});

	provide(Key, c);
	return c;
}

export function useFormControlGroup() {
	return inject(Key) as Controller;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	name: {
		type: String,
		required: true,
	},
	label: {
		type: String,
		default: undefined,
	},
	optional: {
		type: Boolean,
	},
	hideLabel: {
		type: Boolean,
	},
	labelClass: {
		type: String,
		default: undefined,
	},
});

const form = useForm();
const c = provideFormControlGroup();

const labelClasses = computed(() => [props.labelClass, { 'sr-only': props.hideLabel }]);
</script>

<template>
	<div
		class="form-group"
		:class="{
			optional,
		}"
	>
		<label class="control-label" :class="labelClasses" :for="`${form.name}-${name}`">
			<slot name="label">{{ c.humanLabel }}</slot>
		</label>

		<slot />
	</div>
</template>
