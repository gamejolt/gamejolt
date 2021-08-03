import Component from 'vue-class-component';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { BaseForm } from '../../../../../_common/form-vue/form.service';

@Component({
	directives: {
		AppFocusWhen,
	},
})
export default class FormFiresideEdit extends BaseForm<Fireside> {
	modelClass = Fireside;
}
