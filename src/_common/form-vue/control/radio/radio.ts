import { Options, Prop } from 'vue-property-decorator';
import BaseFormControl from '../base';

@Options({})
export default class AppFormControlRadio extends BaseFormControl {
	@Prop() value!: any;

	multi = true;

	get checked() {
		return this.form.base.formModel[this.group.name] === this.value;
	}

	onChange() {
		this.applyValue(this.value);
	}
}
