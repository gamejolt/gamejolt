<script lang="ts">
import { inject, provide, reactive } from 'vue';
import { titleCase } from '../../../utils/string';

interface Controller {
	inputErrors: ErrorBag | null;
	changed: boolean;
	readonly name: string;
	readonly label: string | undefined;
	readonly humanLabel: string;
	control: FormControlController | undefined;
}

const Key = Symbol();

export function provideFormControlGroup() {
	const c = reactive({
		inputErrors: null,
		changed: false,
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
	}) as Controller;

	provide(Key, c);
	return c;
}

export function useFormControlGroup() {
	return inject(Key) as Controller;
}
</script>

<script lang="ts" setup>
import { computed } from 'vue';
import { FormControlController } from '../control/controller';
import { useForm } from '../form.service';

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
