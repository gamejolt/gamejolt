import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
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
export default class FormFiresideAdd extends BaseForm<FormModel> {
	@Prop({ type: String, required: false, default: undefined }) defaultTitle!: string;

	created() {
		this.setField('title', this.defaultTitle);
	}
}
