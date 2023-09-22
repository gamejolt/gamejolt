<script lang="ts">
import { computed, ComputedRef, onMounted, PropType, Ref, ref, toRefs, watch } from 'vue';
import { useForm } from './AppForm.vue';
import { useFormGroup } from './AppFormGroup.vue';
import { vAppFocusWhen } from './focus-when.directive';
import { useFormControlHooks } from './form-control-hooks';
import { FormValidator, validateDecimal, validateEmail, validateRequired } from './validators';

interface ValidationOptions {
	validateDelay?: number;
	validateOnBlur?: boolean;
}

/**
 * Used to mix in common props used in most form controls.
 */
export function defineFormControlProps() {
	return {
		disabled: {
			type: Boolean,
		},
		validators: {
			type: Array as PropType<FormValidator[]>,
			default: () => [],
		},
	};
}

export function defineFormControlValidateProps() {
	return {
		validateOnBlur: {
			type: Boolean,
			default: false,
		},
		validateDelay: {
			type: Number,
			default: 0,
		},
	};
}

/**
 * Used to mix in common emits used in most form controls.
 */
export function defineFormControlEmits<T = any>() {
	return {
		changed: (_value: T) => true,
	};
}

export function createFormControl<T>({
	initialValue,
	validators: inputValidators,
	onChange,
	multi = false,
	alwaysOptional = false,
}: {
	initialValue: T;
	validators: Ref<FormValidator[]>;
	onChange: (value: T) => void;
	multi?: boolean;

	/**
	 * Whether or not we should add a required validator for this form control.
	 * Some form control types don't make sense to mark as required.
	 */
	alwaysOptional?: boolean;
}) {
	const hooks = useFormControlHooks();
	const form = useForm()!;
	const { name: groupName, control: groupControl, optional, changed } = useFormGroup()!;

	const controlVal = ref(initialValue) as Ref<T>;

	const id = computed(() => {
		const id = `${form.name}-${groupName.value}`;
		return !multi ? id : undefined;
	});

	const validators = computed(() => {
		const validators: FormValidator[] = [...inputValidators.value];

		if (!optional.value && !alwaysOptional) {
			validators.push(validateRequired());
		}

		return validators;
	});

	if (!multi) {
		// Copy over the initial form model value. If the formModel contains
		// specifically an undefined value, we want to keep it as the initial
		// value.
		if (form.formModel[groupName.value] !== undefined) {
			controlVal.value = form.formModel[groupName.value];
		}

		// Watch the form model for changes and sync to our control.
		watch(
			() => form.formModel[groupName.value],
			newVal => (controlVal.value = newVal)
		);
	}

	function applyValue(value: T, options: ValidationOptions = {}) {
		if (hooks?.beforeApplyValue) {
			value = hooks.beforeApplyValue(c, value);
		}

		// When the DOM value changes we bind it back to our own value and set
		// it on the form model as well.
		if (!multi) {
			controlVal.value = value;
		}

		form.formModel[groupName.value] = value;
		changed.value = true;

		onChange?.(value);
		form.triggerChanged();

		if (!options.validateOnBlur) {
			_validate(options);
		}
	}

	function applyBlur(options: ValidationOptions = {}) {
		_validate(options);
	}

	function _validate({ validateDelay: validationDelay }: ValidationOptions) {
		if (_debounce) {
			clearTimeout(_debounce);
		}

		if (validationDelay) {
			_validateDebounce(validationDelay);
		} else {
			form.validate();
		}
	}

	let _debounce: NodeJS.Timer | undefined;

	function _validateDebounce(timeout: number) {
		const token = form._validationToken;
		_debounce = setTimeout(() => {
			if (token.isCanceled) {
				return;
			}

			form.validate();
		}, timeout);
	}

	const c = {
		id,
		multi,
		controlVal,
		applyValue,
		validators,
		applyBlur,
	} as FormControlController<T>;

	groupControl.value = c;
	return c;
}

export interface FormControlController<T = any> {
	id: ComputedRef<string | undefined>;
	/**
	 * Whether or not the form control has multiple controls for the group. This
	 * is for radio and checkboxes mostly.
	 */
	multi: boolean;
	controlVal: Ref<T>;
	applyValue: (value: T, options?: ValidationOptions) => void;
	applyBlur: (options?: ValidationOptions) => void;
	validators: ComputedRef<FormValidator[]>;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	...defineFormControlProps(),
	...defineFormControlValidateProps(),
	type: {
		type: String,
		default: 'text',
	},
	focus: {
		type: Boolean,
	},
	htmlListId: {
		type: String,
		default: undefined,
	},
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const { validators, type } = toRefs(props);

// We add some extra validators in depending on the form control type.
const ourValidators = computed(() => {
	const ourValidators: FormValidator[] = [];

	if (type.value === 'currency') {
		ourValidators.push(validateDecimal(2));
	} else if (type.value === 'email') {
		ourValidators.push(validateEmail());
	}

	return [...ourValidators, ...validators.value];
});

const hooks = useFormControlHooks();
const { name } = useFormGroup()!;

const c = createFormControl({
	initialValue: '',
	validators: ourValidators,
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

const { id, applyValue, applyBlur, controlVal } = c;
const controlType = computed(() => (type.value === 'currency' ? 'number' : type.value));
const root = ref<HTMLInputElement>();

onMounted(() => {
	if (hooks?.afterMount) {
		hooks.afterMount(c, root);
	}
});

function onChange() {
	applyValue(root.value?.value ?? '', {
		validateDelay: props.validateDelay,
		validateOnBlur: props.validateOnBlur,
	});
}

function onBlur() {
	if (props.validateOnBlur) {
		applyBlur({
			validateDelay: props.validateDelay,
		});
	}
}
</script>

<template>
	<input
		:id="id"
		ref="root"
		v-app-focus-when="focus"
		:name="name"
		class="form-control"
		:type="controlType"
		:value="controlVal"
		:disabled="disabled ? 'true' : undefined"
		:list="htmlListId"
		@input="onChange"
		@blur="onBlur"
	/>
</template>
