<script lang="ts">
import {
	computed,
	inject,
	InjectionKey,
	onUnmounted,
	provide,
	reactive,
	ref,
	toRefs,
	unref,
} from 'vue';
import { arrayRemove } from '../../utils/array';
import { titleCase } from '../../utils/string';
import { useForm } from './AppForm.vue';
import { FormControlController } from './AppFormControl.vue';
import { FormValidatorError } from './validators';

export type FormGroupController = ReturnType<typeof createFormGroup>;

const Key: InjectionKey<FormGroupController> = Symbol('form-control-group');

export function createFormGroup($props: typeof props) {
	const { name, label, optional } = toRefs($props);

	const form = useForm()!;

	const changed = ref(false);
	const control = ref(undefined as FormControlController | undefined);
	const error = ref(null as FormValidatorError | null);

	const invalid = computed(() => error.value !== null);
	const valid = computed(() => !invalid.value);

	const dirty = computed(() => changed.value);
	const pristine = computed(() => !dirty.value);

	const humanLabel = computed(() =>
		!label?.value
			? titleCase(name.value, {
					dropHyphens: true,
					dropUnderscores: true,
					expandCamelCase: true,
					keepLcWords: true,
			  })
			: label.value
	);

	/**
	 * Validate this single control. Calling [FormController.validate] will call
	 * this for every field in the form.
	 */
	async function validate() {
		// Only validate if a control has attached to this already.
		if (!control.value) {
			return true;
		}

		const { controlVal, validators } = unref(control)!;

		for (const validator of validators) {
			const result = await validator(controlVal);

			// The first error is the one that gets frozen.
			if (result) {
				error.value = result;
				return false;
			}
		}

		error.value = null;
		return true;
	}

	const c = reactive({
		changed,
		invalid,
		valid,
		dirty,
		pristine,
		error,
		control,
		name,
		label,
		humanLabel,
		optional,
		validate,
	});

	form._groups.push(c);
	onUnmounted(() => arrayRemove(form._groups, i => i === c));

	return c;
}

export function useFormGroup() {
	return inject(Key, null);
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

const form = useForm()!;

const c = createFormGroup(props);
provide(Key, c);

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
