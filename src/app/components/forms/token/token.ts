import { Api } from '../../../../_common/api/api.service';
import { AppFocusWhen } from '../../../../_common/form-vue/focus-when.directive';
import {
	BaseForm,
	FormOnInit,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from '../../../../_common/form-vue/form.service';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	directives: {
		AppFocusWhen,
	},
})
export default class FormToken extends BaseForm<any>
	implements FormOnInit, FormOnSubmit, FormOnSubmitSuccess {
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
