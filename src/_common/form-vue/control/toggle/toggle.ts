import { Component, Prop } from 'vue-property-decorator';
import BaseFormControl from '../base';

@Component({})
export default class AppFormControlToggle extends BaseFormControl {
	@Prop(Boolean) disabled?: boolean;

	controlVal = false;

	toggle() {
		if (this.disabled) {
			return;
		}

		this.applyValue(!this.controlVal);
	}
}
