import { Component, Prop } from 'vue-property-decorator';
import { Provider } from '../../../components/linked-account/linked-account.model';
import AppLoading from '../../../vue/components/loading/loading.vue';
import { Api } from '../../api/api.service';
import { Connection } from '../../connection/connection-service';
import { Environment } from '../../environment/environment.service';
import { BaseForm, FormOnSubmit, FormOnSubmitSuccess } from '../../form-vue/form.service';
import { LinkedAccounts } from '../../linked-account/linked-accounts.service';
import { AppTooltip } from '../../tooltip/tooltip';

export type FormModel = {
	email: string;
	username: string;
	password: string;
	token: string;
};

@Component({
	components: {
		AppLoading,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppAuthJoinForm extends BaseForm<FormModel>
	implements FormOnSubmit, FormOnSubmitSuccess {
	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	blocked?: boolean;

	warnOnDiscard = false;

	readonly Connection = Connection;
	readonly Environment = Environment;

	onSubmit() {
		return Api.sendRequest('/web/auth/join', this.formModel);
	}

	onSubmitSuccess(response: any) {
		this.setField('token', response.token);
	}

	/**
	 * Sign up is just login without an account. It'll direct to the correct page when it figures
	 * out if they have an account in the callback URL.
	 */
	linkedChoose(provider: Provider) {
		LinkedAccounts.login(this.$router, provider);
	}
}
