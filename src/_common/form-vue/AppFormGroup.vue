<script lang="ts">
import {
	computed,
	inject,
	InjectionKey,
	markRaw,
	onUnmounted,
	provide,
	ref,
	shallowRef,
	toRefs,
} from 'vue';
import { arrayRemove } from '../../utils/array';
import { CancelToken } from '../../utils/cancel-token';
import { titleCase } from '../../utils/string';
import { useForm } from './AppForm.vue';
import { FormControlController } from './AppFormControl.vue';
import { FormValidatorError } from './validators';

export type FormGroupController = ReturnType<typeof createFormGroup>;

const Key: InjectionKey<FormGroupController> = Symbol('form-control-group');

export function useFormGroup() {
	return inject(Key, null);
}

function createFormGroup($props: typeof props) {
	const { name, label, optional } = toRefs($props);

	const form = useForm()!;

	const changed = ref(false);
	const control = shallowRef<FormControlController>();
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
	 * Validate this single control. Calling {@link FormController.validate}
	 * will call this for every field in the form.
	 */
	async function validate(cancelToken: CancelToken) {
		// Only validate if a control has attached to this already.
		if (!control.value) {
			return;
		}

		const { controlVal, validators } = control.value!;

		for (const validator of validators.value) {
			const result = await validator(controlVal.value);

			// If this validation run is no longer active, ignore the result of
			// this validation and early-out.
			if (cancelToken.isCanceled) {
				return;
			}

			// The first error is the one that gets frozen.
			if (result) {
				error.value = result;
				return;
			}
		}

		error.value = null;
	}

	function clearError() {
		error.value = null;
	}

	const c = {
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
		clearError,
	};

	form._groups.push(markRaw(c));
	onUnmounted(() => arrayRemove(form._groups, i => i === c));

	return c;
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

const { humanLabel } = c;
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
			<slot name="label">{{ humanLabel }}</slot>
		</label>

		<slot />
	</div>
</template>
