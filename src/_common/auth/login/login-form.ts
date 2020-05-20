import { Component, Prop } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import { Connection } from '../../connection/connection-service';
import { Environment } from '../../environment/environment.service';
import { BaseForm, FormOnSubmit } from '../../form-vue/form.service';
import { Provider } from '../../linked-account/linked-account.model';
import { LinkedAccounts } from '../../linked-account/linked-accounts.service';
import AppLoading from '../../loading/loading.vue';
import { AppTooltip } from '../../tooltip/tooltip-directive';

@Component({
	components: {
		AppLoading,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppAuthLoginForm extends BaseForm<any> implements FormOnSubmit {
	@Prop(Boolean)
	overlay?: boolean;

	warnOnDiscard = false;

	invalidLogin = false;
	blockedLogin = false;

	readonly Connection = Connection;
	readonly Environment = Environment;

	onChanged() {
		this.resetErrors();
	}

	resetErrors() {
		this.invalidLogin = false;
		this.blockedLogin = false;
	}

	async onSubmit() {
		this.resetErrors();

		const response = await Api.sendRequest('/web/auth/login', this.formModel);

		if (response.success === false) {
			if (response.reason) {
				if (response.reason === 'invalid-login') {
					this.invalidLogin = true;
				} else if (response.reason === 'blocked') {
					this.blockedLogin = true;
				}
			}
		}

		return response;
	}

	linkedChoose(provider: Provider) {
		LinkedAccounts.login(this.$router, provider);
	}
}
