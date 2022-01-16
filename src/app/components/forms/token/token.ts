import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { AppFocusWhen } from '../../../../_common/form-vue/focus-when.directive';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from '../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<any> {}

@Options({
	directives: {
		AppFocusWhen,
	},
})
export default class FormToken
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnSubmitSuccess
{
	@Prop(String) token!: string;

	onInit() {
		this.setField('token', this.token);
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/token/save', this.formModel);
	}

	onSubmitSuccess(response: any) {
		this.setField('token', response.token);
	}
}