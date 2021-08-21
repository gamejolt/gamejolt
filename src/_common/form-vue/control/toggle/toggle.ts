import { Options, Prop } from 'vue-property-decorator';
import BaseFormControl from '../controller';

@Options({})
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
