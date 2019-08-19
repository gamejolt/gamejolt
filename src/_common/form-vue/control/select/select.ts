import { Component, Prop } from 'vue-property-decorator';
import BaseFormControl from '../base';

@Component({})
export default class AppFormControlSelect extends BaseFormControl {
	@Prop(Array) validateOn!: string[];
	@Prop(Number) validateDelay!: number;

	controlVal = '';

	get validationRules() {
		return {
			...this.baseRules,
		};
	}

	onChange(value: string) {
		this.applyValue(value);
	}
}
