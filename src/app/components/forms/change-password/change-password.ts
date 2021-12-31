import { Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';

type FormModel = {
	old_password: string;
	password: string;
	confirm_password: string;
};

@Options({})
export default class FormChangePassword extends BaseForm<FormModel> implements FormOnSubmit {
	@Prop({ type: Boolean, default: true })
	requiresOld!: boolean;

	created() {
		this.form.warnOnDiscard = false;
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('old_password', '');
		this.setField('password', '');
		this.setField('confirm_password', '');
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/account/set-password', {
			old_password: this.formModel.old_password,
			password: this.formModel.password,
		});
	}
}
