import { ErrorBag } from 'vee-validate';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { titleCase } from '../../../utils/string';
import { findRequiredVueParent } from '../../../utils/vue';
import BaseFormControl from '../control/base';
import AppFormTS from '../form';

@Component({})
export default class AppFormGroup extends Vue {
	@Prop(String) name!: string;
	@Prop(String) label?: string;
	@Prop(Boolean) optional?: boolean;
	@Prop(Boolean) hideLabel?: boolean;
	@Prop(String) labelClass?: string;

	form!: AppFormTS;
	control!: BaseFormControl;
	inputErrors: ErrorBag | null = null;
	changed = false;

	get humanLabel() {
		const name = this.name;

		if (!this.label) {
			return titleCase(name, {
				dropHyphens: true,
				dropUnderscores: true,
				expandCamelCase: true,
				keepLcWords: true,
			});
		}

		return this.label;
	}

	get labelClasses() {
		let labelClass = this.labelClass || '';

		if (this.hideLabel) {
			labelClass += ' sr-only';
		}

		return labelClass;
	}

	created() {
		this.form = findRequiredVueParent(this, require('../form.vue').default) as AppFormTS;
	}
}
