import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import AppFormTS from '../form';
import AppFormGroupTS from '../group/group';

@Component({})
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

	destroyed() {
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

		this.$emit('changed', value);
		this.form.onChange();
	}
}
