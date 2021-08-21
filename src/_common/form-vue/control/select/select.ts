import { Options, Prop } from 'vue-property-decorator';
import BaseFormControl from '../controller';

@Options({})
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
