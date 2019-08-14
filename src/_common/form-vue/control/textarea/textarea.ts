import { Component, Emit, Prop } from 'vue-property-decorator';
import BaseFormControl from '../base';

@Component({})
export default class AppFormControlTextarea extends BaseFormControl {
	@Prop(Array)
	validateOn!: string[];
	@Prop(Number)
	validateDelay!: number;

	controlVal = '';

	get validationRules() {
		return {
			...this.baseRules,
		};
	}

	onChange(value: string) {
		this.applyValue(value);
	}

	@Emit('paste')
	emitPaste(_event: ClipboardEvent) {}
}
