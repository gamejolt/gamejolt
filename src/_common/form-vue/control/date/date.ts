import { Component, Prop } from 'vue-property-decorator';
import AppDatetimePicker from '../../../datetime-picker/datetime-picker.vue';
import BaseFormControl from '../base';

@Component({
	components: {
		AppDatetimePicker,
	},
})
export default class AppFormControlDate extends BaseFormControl {
	@Prop(Number) timezoneOffset!: number;

	controlVal = Date.now();

	get minDate() {
		return this.validationRules.min_date;
	}

	get maxDate() {
		return this.validationRules.max_date;
	}

	onChange(value: number) {
		this.applyValue(value);
	}
}
