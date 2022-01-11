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
import { FormValidator, validateRequired } from './validators';

export interface FormControlController<T = any> {
	readonly id: string | undefined;
	/**
	 * Whether or not the form control has multiple controls for the group. This
	 * is for radio and checkboxes mostly.
	 */
	readonly multi: boolean;
	controlVal: T;
	applyValue: (value: T) => void;
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

export function provideFormControl(c: FormControlController) {
	provide(Key, c);
}

export function useFormControl<T>() {
	return inject(Key, null) as FormControlController<T> | null;
}

export function createFormControl<T>(
	initialValue: T,
	inputValidators: Ref<FormValidator[]>,
	{ multi = false }: { multi?: boolean } = {}
) {
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
		// Copy over the initial form model value.
		controlVal.value = form.formModel[group.name];

		// Watch the form model for changes and sync to our control.
		watch(
			() => form.formModel[group.name],
			newVal => (controlVal.value = newVal)
		);
	}

	function applyValue(value: T) {
		// When the DOM value changes we bind it back to our own value and set
		// it on the form model as well.
		if (!multi) {
			controlVal.value = value;
		}

		form.formModel[group.name] = value;
		group.changed = true;

		// TODO(vue3): oh boy
		// this.emitChanged(value);
		form._onControlChanged();
	}

	const c = reactive({
		id,
		multi,
		controlVal,
		applyValue,
		validators,
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
	type: {
		type: String,
		default: 'text',
	},
	validateOn: {
		type: Array as PropType<string[]>,
		default: () => [],
	},
	validateDelay: {
		type: Number,
		default: 0,
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

const { validators } = toRefs(props);

// TODO(vue3): can we do the text masking in a way that tree shakes it away when not used?

const group = useFormGroup()!;
const c = createFormControl('', validators);

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
	c.applyValue(root.value?.value ?? '');
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

// @Options({})
// export default class AppFormControl extends BaseFormControl {
// 	@Prop({ type: String, default: 'text' })
// 	type!: string;

// 	@Prop(Array) validateOn!: string[];
// 	@Prop(Number) validateDelay!: number;
// 	@Prop(Array) mask!: (string | RegExp)[];
// 	@Prop({ type: Boolean, default: false }) disabled!: boolean;
// 	@Prop({ type: String, default: undefined }) htmlListId!: string;

// 	controlVal = '';
// 	maskedInputElem: any = null;

// 	declare $el: HTMLInputElement;

// 	get controlType() {
// 		if (this.type === 'currency') {
// 			return 'number';
// 		}
// 		return this.type;
// 	}

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

// 	mounted() {
// 		const mask = this.mask;
// 		if (mask) {
// 			this.maskedInputElem = createTextMaskInputElement({
// 				inputElement: this.$el,
// 				mask,
// 			});
// 			this.maskedInputElem.update(this.controlVal);
// 		}
// 	}

// 	onChange() {
// 		if (this.maskedInputElem) {
// 			this.maskedInputElem.update(this.$el.value);
// 		}

// 		this.applyValue(this.$el.value);
// 	}
// }

// @Options({})
// export default class BaseFormControl extends Vue {
// 	@Prop()
// 	rules!: any;

// 	controlVal: any;
// 	changed = false;

// 	/**
// 	 * Whether or not the form control has multiple controls for the group. This
// 	 * is for radio and checkboxes mostly.
// 	 */
// 	multi = false;

// 	form!: AppFormTS;
// 	group!: AppFormGroupTS;

// 	@Emit('changed')
// 	emitChanged(_value: any) {}

// 	get id() {
// 		const id = this.form.name + '-' + this.group.name;
// 		return !this.multi ? id : undefined;
// 	}

// 	protected get baseRules() {
// 		return {
// 			required: !this.group.optional,
// 			...this.rules,
// 		};
// 	}

// 	get validationRules() {
// 		return this.baseRules;
// 	}

// 	created() {
// 		this.form = findRequiredVueParent(this, require('../form.vue').default) as AppFormTS;
// 		this.form.controls.push(this);

// 		this.group = findRequiredVueParent(
// 			this,
// 			require('../group/group.vue').default
// 		) as AppFormGroupTS;
// 		this.group.inputErrors = this.$validator.errorBag;
// 		this.group.control = this;

// 		if (!this.multi) {
// 			// Copy over the initial form model value.
// 			this.controlVal = this.form.base.formModel[this.group.name];

// 			// Watch the form model for changes and sync to our control.
// 			this.$watch(
// 				() => this.form.base.formModel[this.group.name],
// 				newVal => (this.controlVal = newVal)
// 			);
// 		}
// 	}

// 	unmounted() {
// 		if (this.form) {
// 			const index = this.form.controls.findIndex(control => control === this);
// 			this.form.controls.splice(index, 1);
// 		}
// 	}

// 	applyValue(value: any) {
// 		// When the DOM value changes we bind it back to our own value and set
// 		// it on the form model as well.
// 		if (!this.multi) {
// 			this.controlVal = value;
// 		}

// 		this.form.base.setField(this.group.name, value);
// 		this.group.changed = true;

// 		this.emitChanged(value);
// 		this.form.onChange();
// 	}
// }
</script>

<!-- v-validate="{ rules: validationRules }"
	:data-vv-validate-on="validateOn"
	:data-vv-delay="validateDelay" -->
<template>
	<div class="-container">
		<input
			:id="c.id"
			ref="root"
			:name="group.name"
			class="form-control"
			:type="controlType"
			:value="c.controlVal"
			:disabled="disabled"
			:list="htmlListId"
			v-bind="$attrs"
			:style="{ 'padding-left': paddingLeft }"
			@input="onChange"
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
