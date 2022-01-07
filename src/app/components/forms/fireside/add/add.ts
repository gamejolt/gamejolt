import { mixins, Options, Prop } from 'vue-property-decorator';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { BaseForm } from '../../../../../_common/form-vue/form.service';

type FormModel = {
	title: string;
	is_draft: boolean;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	directives: {
		AppFocusWhen,
	},
})
export default class FormFiresideAdd extends mixins(Wrapper) {
	@Prop({ type: String, required: false })
	defaultTitle?: string;

	onInit() {
		if (this.defaultTitle) {
			this.setField('title', this.defaultTitle);
		}
		this.setField('is_draft', false);
	}

	onDraftSubmit() {
		this.setField('is_draft', true);
	}
}
