import { computed, inject, provide, reactive, ref } from 'vue';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import AppFormTS from '../form';
import { useForm } from '../form.service';
import { useFormControlGroup } from '../group/group.vue';

export interface FormControlController<T = any> {
	readonly id: string | undefined;
	/**
	 * Whether or not the form control has multiple controls for the group. This
	 * is for radio and checkboxes mostly.
	 */
	readonly multi: boolean;
	controlVal: T;
	changed: boolean;
	applyValue: (value: T) => void;
}

const Key = Symbol('form-control');

export function provideFormControl<T>(
	initialValue: T,
	{ multi = false }: { multi?: boolean } = {}
) {
	const form = useForm();
	const group = useFormControlGroup()!;

	const id = computed(() => {
		const id = `${form.name}-${group.name}`;
		return !multi ? id : undefined;
	});

	const controlVal = ref(initialValue);
	const changed = ref(false);

	function applyValue(value: T) {
		// When the DOM value changes we bind it back to our own value and set
		// it on the form model as well.
		if (!multi) {
			controlVal.value = value;
		}

		form.setField(group.name, value);
		group.changed = true;

		// TODO(vue3): oh boy
		// this.emitChanged(value);
		form.onChange();
	}

	// TODO(vue3)
	// if (!this.multi) {
	// 	// Copy over the initial form model value.
	// 	this.controlVal = this.form.base.formModel[this.group.name];

	// 	// Watch the form model for changes and sync to our control.
	// 	this.$watch(
	// 		() => this.form.base.formModel[this.group.name],
	// 		newVal => (this.controlVal = newVal)
	// 	);
	// }

	const c = reactive({
		id,
		multi,
		controlVal,
		changed,
		applyValue,
	}) as FormControlController<T>;

	// TODO(vue3): are we able to get rid of this coupling by any chance?
	group.control = c;

	provide(Key, c);
	return c;
}

export function useFormControl() {
	return inject(Key) as FormControlController;
}

@Options({})
export default class BaseFormControl extends Vue {
	@Prop()
	rules!: any;

	controlVal: any;
	changed = false;

	/**
	 * Whether or not the form control has multiple controls for the group. This
	 * is for radio and checkboxes mostly.
	 */
	multi = false;

	form!: AppFormTS;
	group!: AppFormGroupTS;

	@Emit('changed')
	emitChanged(_value: any) {}

	get id() {
		const id = this.form.name + '-' + this.group.name;
		return !this.multi ? id : undefined;
	}

	protected get baseRules() {
		return {
			required: !this.group.optional,
			...this.rules,
		};
	}

	get validationRules() {
		return this.baseRules;
	}

	created() {
		this.form = findRequiredVueParent(this, require('../form.vue').default) as AppFormTS;
		this.form.controls.push(this);

		this.group = findRequiredVueParent(
			this,
			require('../group/group.vue').default
		) as AppFormGroupTS;
		this.group.inputErrors = this.$validator.errorBag;
		this.group.control = this;

		if (!this.multi) {
			// Copy over the initial form model value.
			this.controlVal = this.form.base.formModel[this.group.name];

			// Watch the form model for changes and sync to our control.
			this.$watch(
				() => this.form.base.formModel[this.group.name],
				newVal => (this.controlVal = newVal)
			);
		}
	}

	unmounted() {
		if (this.form) {
			const index = this.form.controls.findIndex(control => control === this);
			this.form.controls.splice(index, 1);
		}
	}

	applyValue(value: any) {
		// When the DOM value changes we bind it back to our own value and set
		// it on the form model as well.
		if (!this.multi) {
			this.controlVal = value;
		}

		this.form.base.setField(this.group.name, value);
		this.group.changed = true;

		this.emitChanged(value);
		this.form.onChange();
	}
}
