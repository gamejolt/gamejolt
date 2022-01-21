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
import { useResizeObserver } from '../../utils/hooks/useResizeObserver';
import { Ruler } from '../ruler/ruler-service';
import { useForm } from './AppForm.vue';
import { useFormGroup } from './AppFormGroup.vue';
import { AppFocusWhen as vAppFocusWhen } from './focus-when.directive';
import { FormValidator, validateRequired } from './validators';

interface ValidationOptions {
	validateDelay?: number;
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

		// TODO(vue3): somehow sync up with the control type?
		// 	get validationRules() {
		// 		const rules = {
		// 			...this.baseRules,
		// 		};

		// 		if (this.type === 'currency') {
		// 			rules.decimal = 2;
		// 		}

		// 		if (this.type === 'email') {
		// 			rules.email = true;
		// 		}

		// 		return rules;
		// 	}

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

export default {
	// Since we may show a prefix, we need to put the fallthrough attributes
	// manually.
	inheritAttrs: false,
};
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
	prefix: {
		type: String,
		default: null,
	},
	mask: {
		type: Array as PropType<(string | RegExp)[]>,
		default: () => [],
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

const { validators } = toRefs(props);

// TODO(vue3): can we do the text masking in a way that tree shakes it away when not used?

const group = useFormGroup()!;
const c = createFormControl({
	initialValue: '',
	validators,
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

const root = ref<HTMLInputElement>();
const prefixElement = ref<HTMLSpanElement>();

const originalInputPaddingTop = ref(0);
const originalInputPaddingLeft = ref(0);
const originalInputMarginTop = ref(0);
const originalInputMarginLeft = ref(0);
const paddingLeft = ref('');

const originalOffsetTop = computed(
	() => originalInputPaddingTop.value + originalInputMarginTop.value
);
const originalOffsetLeft = computed(
	() => originalInputPaddingLeft.value + originalInputMarginLeft.value
);

const controlType = computed(() => {
	return props.type === 'currency' ? 'number' : props.type;
});

function onChange() {
	c.applyValue(root.value?.value ?? '', {
		validateDelay: props.validateDelay,
	});
}

useResizeObserver({ target: prefixElement, callback: recalcPositioning });

onMounted(() => {
	// If there's a prefix.
	if (root.value && prefixElement.value) {
		const styles = window.getComputedStyle(root.value);
		originalInputPaddingTop.value = parseFloat(styles.paddingTop || '0');
		originalInputPaddingLeft.value = parseFloat(styles.paddingLeft || '0');
		originalInputMarginTop.value = parseFloat(styles.marginTop || '0');
		originalInputMarginLeft.value = parseFloat(styles.marginLeft || '0');

		recalcPositioning();
	}
});

function recalcPositioning() {
	if (prefixElement.value) {
		paddingLeft.value = Ruler.outerWidth(prefixElement.value) + originalOffsetLeft.value + 'px';
	}
}

function onBlur() {
	if (props.validateOnBlur) {
		c.applyBlur({
			validateDelay: props.validateDelay,
		});
	}
}
</script>

<template>
	<div class="-container">
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
			:style="{ 'padding-left': paddingLeft }"
			@input="onChange"
			@blur="onBlur"
		/>
		<span
			v-if="prefix"
			ref="prefixElement"
			class="-prefix text-muted"
			:style="{ top: `${originalOffsetTop}px`, left: `${originalOffsetLeft}px` }"
		>
			<em>{{ prefix }}</em>
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.-container
	position: relative

.-prefix
	position: absolute
	pointer-events: none
</style>
