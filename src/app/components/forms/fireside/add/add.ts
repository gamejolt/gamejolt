import Component from 'vue-class-component';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { BaseForm } from '../../../../../_common/form-vue/form.service';

type FormModel = {
	title: string;
};

@Component({
	directives: {
		AppFocusWhen,
	},
})
export default class FormFiresideAdd extends BaseForm<FormModel> {}
