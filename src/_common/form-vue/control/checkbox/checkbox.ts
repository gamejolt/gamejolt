import { Component, Prop } from 'vue-property-decorator';
import BaseFormControl from '../base';

@Component({})
export default class AppFormControlCheckbox extends BaseFormControl {
	@Prop() value!: any;

	multi = true;

	get currentOptions() {
		return this.form.base.formModel[this.group.name] || [];
	}

	get checked() {
		// This is when there's only one checkbox without a value field.
		// That means we want to check for just a boolean check.
		if (!this.value) {
			return !!this.form.base.formModel[this.group.name];
		}

		// Multiple checkboxes, so we want to check to see if it's within the
		// form model array of checked options.
		return this.currentOptions.indexOf(this.value) !== -1;
	}

	onChange() {
		const el = this.$el as HTMLInputElement;

		// Boolean based single checkbox.
		if (!this.value) {
			this.applyValue(el.checked);
		} else {
			// Multiple checkboxes with values.
			const currentOptions: string[] = this.currentOptions;

			if (el.checked) {
				currentOptions.push(this.value);
			} else {
				const index = currentOptions.findIndex(i => i === this.value);
				if (index !== -1) {
					currentOptions.splice(index, 1);
				}
			}

			this.applyValue(currentOptions);
		}
	}
}
