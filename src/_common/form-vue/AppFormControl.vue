<script lang="ts">
import {
	computed,
	inject,
	InjectionKey,
	onMounted,
	PropType,
	provide,
	reactive,
	Ref,
	ref,
	toRefs,
	watch,
} from 'vue';
import { useForm } from './AppForm.vue';
import { useFormGroup } from './AppFormGroup.vue';
import { AppFocusWhen as vAppFocusWhen } from './focus-when.directive';
import { useFormControlHooks } from './form-control-hooks';
import { FormValidator, validateDecimal, validateEmail, validateRequired } from './validators';

interface ValidationOptions {
	validateDelay?: number;
}

const Key: InjectionKey<FormControlController> = Symbol('form-control');

/**
 * Used to mix in common props used in most form controls.
 */
export function defineFormControlProps() {
	return {
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
export function defineFormControlEmits() {
	return {
		changed: (_value: any) => true,
	};
}

export function provideFormControl(c: FormControlController) {
	provide(Key, c);
}

export function useFormControl<T>() {
	return inject(Key, null) as FormControlController<T> | null;
}

export function createFormControl<T>({
	initialValue,
	validators: inputValidators,
	onChange,
	multi = false,
}: {
	initialValue: T;
	validators: Ref<FormValidator[]>;
	onChange: (value: T) => void;
	multi?: boolean;
}) {
	const hooks = useFormControlHooks();
	const form = useForm()!;
	const group = useFormGroup()!;

	const controlVal = ref(initialValue) as Ref<T>;

	const id = computed(() => {
		const id = `${form.name}-${group.name}`;
		return !multi ? id : undefined;
	});

	const validators = computed(() => {
		const validators: FormValidator[] = [...inputValidators.value];

		if (!group.optional) {
			validators.push(validateRequired());
		}

		return validators;
	});

	if (!multi) {
		// Copy over the initial form model value. If the formModel contains
		// specifically an undefined value, we want to keep it as the initial
		// value.
		if (form.formModel[group.name] !== undefined) {
			controlVal.value = form.formModel[group.name];
		}

		// Watch the form model for changes and sync to our control.
		watch(
			() => form.formModel[group.name],
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

		form.formModel[group.name] = value;
		group.changed = true;

		onChange?.(value);
		form._onControlChanged();

		_validate(options);
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

	const c = reactive({
		id,
		multi,
		controlVal,
		applyValue,
		validators,
		applyBlur,
	}) as FormControlController<T>;

	group.control = c;
	return c;
}

export interface FormControlController<T = any> {
	readonly id: string | undefined;
	/**
	 * Whether or not the form control has multiple controls for the group. This
	 * is for radio and checkboxes mostly.
	 */
	readonly multi: boolean;
	controlVal: T;
	applyValue: (value: T, options?: ValidationOptions) => void;
	applyBlur: (options?: ValidationOptions) => void;
	readonly validators: FormValidator[];
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
	disabled: {
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
const group = useFormGroup()!;
const c = createFormControl({
	initialValue: '',
	validators: ourValidators,
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

const root = ref<HTMLInputElement>();

const controlType = computed(() => (type.value === 'currency' ? 'number' : type.value));

function onChange() {
	c.applyValue(root.value?.value ?? '', {
		validateDelay: props.validateDelay,
	});
}

onMounted(() => {
	if (hooks?.afterMount) {
		hooks.afterMount(c, root);
	}
});

function onBlur() {
	if (props.validateOnBlur) {
		c.applyBlur({
			validateDelay: props.validateDelay,
		});
	}
}
</script>

<template>
	<input
		:id="c.id"
		ref="root"
		v-app-focus-when="focus"
		:name="group.name"
		class="form-control"
		:type="controlType"
		:value="c.controlVal"
		:disabled="disabled"
		:list="htmlListId"
		v-bind="$attrs"
		@input="onChange"
		@blur="onBlur"
	/>
</template>
